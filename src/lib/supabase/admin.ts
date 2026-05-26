import { createClient } from "@supabase/supabase-js";

/**
 * Server-only client with the service_role key.
 * Bypasses RLS — use ONLY in server actions / server components / scripts,
 * NEVER in client components or anything that reaches the browser.
 */
export function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
