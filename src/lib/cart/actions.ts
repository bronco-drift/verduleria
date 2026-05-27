"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { DEMO_USER_ID } from "@/lib/demo";
import { getActiveStore } from "@/lib/active-store";

export type CartActionResult =
  | { ok: true }
  | { ok: false; error: string };

async function getOrCreateCart(storeId: string) {
  const supabase = createSupabaseAdminClient();
  const { data: existing } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", DEMO_USER_ID)
    .eq("store_id", storeId)
    .maybeSingle();
  if (existing) return existing;
  const { data, error } = await supabase
    .from("carts")
    .insert({ user_id: DEMO_USER_ID, store_id: storeId })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function addToCartAction({
  productId,
  quantity,
}: {
  productId: string;
  quantity: number;
}): Promise<CartActionResult> {
  const supabase = createSupabaseAdminClient();

  const { data: product } = await supabase
    .from("products")
    .select("store_id")
    .eq("id", productId)
    .eq("is_active", true)
    .maybeSingle();
  if (!product) return { ok: false, error: "Producto no encontrado" };

  const cart = await getOrCreateCart(product.store_id);

  const { data: existing } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("cart_id", cart.id)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    const upd = await supabase
      .from("cart_items")
      .update({ quantity: existing.quantity + quantity })
      .eq("id", existing.id);
    if (upd.error) return { ok: false, error: upd.error.message };
  } else {
    const ins = await supabase
      .from("cart_items")
      .insert({ cart_id: cart.id, product_id: productId, quantity });
    if (ins.error) return { ok: false, error: ins.error.message };
  }

  revalidatePath("/tienda", "layout");
  return { ok: true };
}

export async function updateCartItemAction({
  itemId,
  quantity,
}: {
  itemId: string;
  quantity: number;
}): Promise<CartActionResult> {
  const supabase = createSupabaseAdminClient();

  if (quantity <= 0) {
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", itemId);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("id", itemId);
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath("/tienda", "layout");
  return { ok: true };
}
