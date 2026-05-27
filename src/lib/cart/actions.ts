"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CartActionResult =
  | { ok: true }
  | { ok: false; error: string; needsAuth?: boolean };

export async function addToCartAction({
  productId,
  quantity,
}: {
  productId: string;
  quantity: number;
}): Promise<CartActionResult> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Login required", needsAuth: true };

  const { data: product } = await supabase
    .from("products")
    .select("store_id")
    .eq("id", productId)
    .eq("is_active", true)
    .single();
  if (!product) return { ok: false, error: "Producto no encontrado" };

  // Get or create cart
  let { data: cart } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", user.id)
    .eq("store_id", product.store_id)
    .maybeSingle();

  if (!cart) {
    const ins = await supabase
      .from("carts")
      .insert({ user_id: user.id, store_id: product.store_id })
      .select("id")
      .single();
    if (ins.error) return { ok: false, error: ins.error.message };
    cart = ins.data;
  }

  // Upsert item
  const { data: existing } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("cart_id", cart!.id)
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
      .insert({ cart_id: cart!.id, product_id: productId, quantity });
    if (ins.error) return { ok: false, error: ins.error.message };
  }

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updateCartItemAction({
  itemId,
  quantity,
}: {
  itemId: string;
  quantity: number;
}): Promise<CartActionResult> {
  const supabase = await createSupabaseServerClient();

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

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function clearCartAction(cartId: string): Promise<CartActionResult> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("cart_id", cartId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}
