import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { MemberRole } from "@/db/schema";

export type AdminStore = {
  id: string;
  slug: string;
  name: string;
  delivery_fee: string;
};

export type AdminContext = {
  user: { id: string; email: string | undefined };
  store: AdminStore;
  role: MemberRole;
  /** Admin (service_role) client — bypasses RLS. Use for store-scoped queries. */
  admin: ReturnType<typeof createSupabaseAdminClient>;
};

/**
 * Get current admin context. Returns null if user is not a member of any store
 * with role owner/admin. Redirects to login if not authenticated.
 */
export async function getAdminContext(): Promise<AdminContext | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/admin");

  type Row = {
    role: MemberRole;
    stores: AdminStore | null;
  };

  const { data: membership } = await supabase
    .from("store_members")
    .select(`role, stores(id, slug, name, delivery_fee)`)
    .eq("user_id", user.id)
    .in("role", ["owner", "admin"])
    .limit(1)
    .returns<Row[]>()
    .maybeSingle();

  if (!membership || !membership.stores) return null;

  return {
    user: { id: user.id, email: user.email },
    store: membership.stores,
    role: membership.role,
    admin: createSupabaseAdminClient(),
  };
}

export async function requireAdminContext(): Promise<AdminContext> {
  const ctx = await getAdminContext();
  if (!ctx) {
    throw new Error("FORBIDDEN: user is not an admin of any store");
  }
  return ctx;
}
