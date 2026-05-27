import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const env = {
    hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    urlHost: process.env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/([^.]+)/)?.[1] ?? null,
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    anonKeyPrefix: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 18) ?? null,
    hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  };

  let query: {
    success: boolean;
    error: string | null;
    storeCount: number;
  } = { success: false, error: null, storeCount: 0 };

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from("stores").select("id");
    if (error) {
      query.error = `${error.code ?? "?"}: ${error.message}`;
    } else {
      query.success = true;
      query.storeCount = data?.length ?? 0;
    }
  } catch (e) {
    query.error = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
  }

  return Response.json({ env, query });
}
