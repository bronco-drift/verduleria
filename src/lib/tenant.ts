import { cache } from "react";
import { createSupabaseAdminClient } from "./supabase/admin";
import { DEMO_STORE_SLUG } from "./demo";

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
 * Get the active demo store. In a no-auth phase, "Mi verdulería" always
 * manages this store. When auth comes back, this is resolved from the
 * logged-in user's store_members entry.
 */
export const getDemoStore = cache(async () => {
  const store = await getStoreBySlug(DEMO_STORE_SLUG);
  if (!store) {
    throw new Error(
      `Demo store "${DEMO_STORE_SLUG}" not found. Run \`npm run db:seed\`.`
    );
  }
  return store;
});

/**
 * List all active stores (for the Tienda landing when multiple stores exist).
 */
export const listActiveStores = cache(async () => {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("stores")
    .select("id, slug, name, address, phone, delivery_fee, is_active")
    .order("name");
  return data ?? [];
});
