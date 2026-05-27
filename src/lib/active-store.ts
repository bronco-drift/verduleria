import { cache } from "react";
import { cookies } from "next/headers";
import { createSupabaseAdminClient } from "./supabase/admin";
import { STORE_COOKIE } from "./store-cookie";

export { STORE_COOKIE };

export const getActiveStoreSlug = cache(async (): Promise<string | null> => {
  const c = await cookies();
  return c.get(STORE_COOKIE)?.value ?? null;
});

/**
 * Resolve the store the user is currently working with.
 * Order of resolution:
 *   1. Cookie verduleria-store (set by the StoreSelector client)
 *   2. First active store (fallback for first-time visitors)
 * Throws if there are no active stores at all.
 */
export const getActiveStore = cache(async () => {
  const supabase = createSupabaseAdminClient();
  const slug = await getActiveStoreSlug();

  if (slug) {
    const { data } = await supabase
      .from("stores")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();
    if (data) return data;
  }

  const { data: first } = await supabase
    .from("stores")
    .select("*")
    .eq("is_active", true)
    .order("created_at")
    .limit(1)
    .maybeSingle();

  if (!first) {
    throw new Error(
      "No hay verdulerías activas. Creá una primero desde /admin/nueva."
    );
  }
  return first;
});

export const listActiveStores = cache(async () => {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("stores")
    .select("id, slug, name")
    .eq("is_active", true)
    .order("name");
  return data ?? [];
});
