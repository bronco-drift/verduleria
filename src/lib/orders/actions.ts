"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { DEMO_USER_ID, DEMO_STORE_SLUG } from "@/lib/demo";

const checkoutSchema = z.object({
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
    deliveryAddress: formData.get("deliveryAddress"),
    customerPhone: formData.get("customerPhone"),
    customerNotes: formData.get("customerNotes") || undefined,
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const supabase = createSupabaseAdminClient();

  const { data: store } = await supabase
    .from("stores")
    .select("id, delivery_fee")
    .eq("slug", DEMO_STORE_SLUG)
    .single();
  if (!store) return { ok: false, error: "Verdulería no encontrada" };

  const { data: cart } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", DEMO_USER_ID)
    .eq("store_id", store.id)
    .maybeSingle();
  if (!cart) return { ok: false, error: "Carrito vacío" };

  type Row = {
    id: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      price: string;
      unit_amount: string | null;
      is_active: boolean;
    } | null;
  };

  const { data: items } = await supabase
    .from("cart_items")
    .select(
      `id, quantity, product:products(id, name, price, unit_amount, is_active)`
    )
    .eq("cart_id", cart.id)
    .returns<Row[]>();

  const validItems = (items ?? []).filter(
    (it) => it.product && it.product.is_active
  ) as (Row & { product: NonNullable<Row["product"]> })[];

  if (validItems.length === 0) {
    return { ok: false, error: "Carrito vacío" };
  }

  const subtotal = validItems.reduce(
    (sum, it) => sum + Number(it.product.price) * it.quantity,
    0
  );
  const deliveryFee = Number(store.delivery_fee);
  const total = subtotal + deliveryFee;

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      store_id: store.id,
      user_id: DEMO_USER_ID,
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

  const orderItemsRows = validItems.map((it) => ({
    order_id: order.id,
    product_id: it.product.id,
    product_name: it.product.name,
    unit_amount: it.product.unit_amount,
    unit_price: it.product.price,
    quantity: it.quantity,
    line_total: (Number(it.product.price) * it.quantity).toFixed(2),
  }));

  const { error: itemsErr } = await supabase
    .from("order_items")
    .insert(orderItemsRows);
  if (itemsErr) {
    await supabase.from("orders").delete().eq("id", order.id);
    return { ok: false, error: itemsErr.message };
  }

  await supabase.from("order_status_history").insert({
    order_id: order.id,
    status: "pending",
    changed_by: DEMO_USER_ID,
  });

  await supabase.from("deliveries").insert({
    order_id: order.id,
    status: "pending_assignment",
  });

  await supabase.from("cart_items").delete().eq("cart_id", cart.id);

  revalidatePath("/", "layout");
  redirect(`/tienda/mis-pedidos?just=${order.id}`);
}
