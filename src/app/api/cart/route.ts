import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { DEMO_USER_ID, DEMO_STORE_SLUG } from "@/lib/demo";

export type CartItemRow = {
  id: string;
  quantity: number;
  product_id: string;
  product_name: string;
  unit_amount: string | null;
  unit_price: number;
  line_total: number;
};

export type CartResponse = {
  items: CartItemRow[];
  subtotal: number;
  count: number;
};

export async function GET() {
  const supabase = createSupabaseAdminClient();
  const { data: store } = await supabase
    .from("stores")
    .select("id")
    .eq("slug", DEMO_STORE_SLUG)
    .maybeSingle();
  if (!store) {
    return Response.json({ items: [], subtotal: 0, count: 0 } satisfies CartResponse);
  }

  const { data: cart } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", DEMO_USER_ID)
    .eq("store_id", store.id)
    .maybeSingle();
  if (!cart) {
    return Response.json({ items: [], subtotal: 0, count: 0 } satisfies CartResponse);
  }

  type DbRow = {
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
    .order("created_at")
    .returns<DbRow[]>();

  const rows: CartItemRow[] = (items ?? [])
    .filter((it) => it.product && it.product.is_active)
    .map((it) => {
      const p = it.product!;
      const unitPrice = Number(p.price);
      return {
        id: it.id,
        quantity: it.quantity,
        product_id: p.id,
        product_name: p.name,
        unit_amount: p.unit_amount,
        unit_price: unitPrice,
        line_total: unitPrice * it.quantity,
      };
    });

  const subtotal = rows.reduce((s, r) => s + r.line_total, 0);
  const count = rows.reduce((s, r) => s + r.quantity, 0);
  return Response.json({ items: rows, subtotal, count } satisfies CartResponse);
}
