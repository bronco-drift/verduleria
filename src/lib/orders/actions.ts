"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const checkoutSchema = z.object({
  storeSlug: z.string().min(1),
  deliveryAddress: z.string().min(5, "Indicá una dirección"),
  customerPhone: z.string().min(6, "Indicá un teléfono"),
  customerNotes: z.string().optional(),
});

export type CheckoutResult =
  | { ok: true; orderId: string }
  | { ok: false; error: string };

export async function createOrderFromCartAction(
  _prev: CheckoutResult | null,
  formData: FormData
): Promise<CheckoutResult> {
  const parsed = checkoutSchema.safeParse({
    storeSlug: formData.get("storeSlug"),
    deliveryAddress: formData.get("deliveryAddress"),
    customerPhone: formData.get("customerPhone"),
    customerNotes: formData.get("customerNotes") || undefined,
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Tenés que iniciar sesión" };

  const { data: store } = await supabase
    .from("stores")
    .select("id, delivery_fee")
    .eq("slug", parsed.data.storeSlug)
    .single();
  if (!store) return { ok: false, error: "Verdulería no encontrada" };

  // Load cart with items + product info
  const { data: cart } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", user.id)
    .eq("store_id", store.id)
    .maybeSingle();
  if (!cart) return { ok: false, error: "Carrito vacío" };

  const { data: items } = await supabase
    .from("cart_items")
    .select(
      `
      id,
      quantity,
      product:products (
        id,
        name,
        price,
        unit_amount,
        is_active
      )
    `
    )
    .eq("cart_id", cart.id);

  if (!items || items.length === 0) {
    return { ok: false, error: "Carrito vacío" };
  }

  // Filter out inactive products defensively
  const validItems = items.filter(
    // @ts-expect-error - supabase join returns array, we treat as single
    (it) => it.product && it.product.is_active
  );
  if (validItems.length === 0) {
    return { ok: false, error: "No hay productos válidos en el carrito" };
  }

  // Calculate totals (numeric -> string in Postgres)
  const subtotal = validItems.reduce((sum, it) => {
    // @ts-expect-error - same as above
    return sum + Number(it.product.price) * it.quantity;
  }, 0);
  const deliveryFee = Number(store.delivery_fee);
  const total = subtotal + deliveryFee;

  // Use admin client to atomically create order + items + status_history + delivery
  const admin = createSupabaseAdminClient();

  const { data: order, error: orderErr } = await admin
    .from("orders")
    .insert({
      store_id: store.id,
      user_id: user.id,
      status: "pending",
      subtotal: subtotal.toFixed(2),
      delivery_fee: deliveryFee.toFixed(2),
      total: total.toFixed(2),
      delivery_address: parsed.data.deliveryAddress,
      customer_phone: parsed.data.customerPhone,
      customer_notes: parsed.data.customerNotes ?? null,
    })
    .select()
    .single();

  if (orderErr || !order) {
    return { ok: false, error: orderErr?.message ?? "Error creando pedido" };
  }

  // Insert order_items with snapshots
  const orderItemsRows = validItems.map((it) => ({
    order_id: order.id,
    // @ts-expect-error - same as above
    product_id: it.product.id,
    // @ts-expect-error - same as above
    product_name: it.product.name,
    // @ts-expect-error - same as above
    unit_amount: it.product.unit_amount,
    // @ts-expect-error - same as above
    unit_price: it.product.price,
    quantity: it.quantity,
    line_total: (
      // @ts-expect-error - same as above
      Number(it.product.price) * it.quantity
    ).toFixed(2),
  }));

  const { error: itemsErr } = await admin
    .from("order_items")
    .insert(orderItemsRows);
  if (itemsErr) {
    // Rollback-ish: delete the order
    await admin.from("orders").delete().eq("id", order.id);
    return { ok: false, error: itemsErr.message };
  }

  // Initial status history
  await admin.from("order_status_history").insert({
    order_id: order.id,
    status: "pending",
    changed_by: user.id,
  });

  // Pending delivery
  await admin.from("deliveries").insert({
    order_id: order.id,
    status: "pending_assignment",
  });

  // Clear cart
  await supabase.from("cart_items").delete().eq("cart_id", cart.id);

  revalidatePath("/", "layout");
  redirect(`/${parsed.data.storeSlug}/mis-pedidos?just=${order.id}`);
}
