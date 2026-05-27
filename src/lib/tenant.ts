import { cache } from "react";
import { createSupabaseAdminClient } from "./supabase/admin";
import { getActiveStore } from "./active-store";

/**
 * Get store by URL slug. Cached per-request via React cache().
 * Returns null if not found.
 */
export const getStoreBySlug = cache(async (slug: string) => {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("stores")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return data;
});

/**
 * Backwards-compat alias for the currently-active store.
 * Prefer importing `getActiveStore` directly in new code.
 */
export const getDemoStore = getActiveStore;

export const listActiveStores = cache(async () => {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("stores")
    .select("id, slug, name, address, phone, delivery_fee, is_active")
    .order("name");
  return data ?? [];
});
