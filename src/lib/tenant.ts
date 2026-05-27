import { createSupabaseServerClient } from "./supabase/server";
import { cache } from "react";

/**
 * Get store by URL slug. Cached per-request via React cache().
 * Returns null if not found. Use for /[storeSlug]/... routes.
 */
export const getStoreBySlug = cache(async (slug: string) => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("getStoreBySlug error:", error);
    return null;
  }
  return data;
});

/**
 * Get the store the current user is a member of (owner/admin/driver).
 * Used in /admin routes. Returns null if user is not a member of any store.
 */
export const getCurrentUserStore = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("store_members")
    .select("role, stores(*)")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!data || !data.stores) return null;

  return {
    store: data.stores as unknown as {
      id: string;
      slug: string;
      name: string;
      delivery_fee: string;
    },
    role: data.role as "owner" | "admin" | "driver",
    user,
  };
});

/**
 * Get the active store from the user's session (must be logged in).
 * Returns null if not logged in or not a member.
 */
export const requireUserStore = async () => {
  const result = await getCurrentUserStore();
  if (!result) throw new Error("Unauthorized: no store membership");
  return result;
};
