import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const STORE_SLUG = "don-jose";

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Uso: npm run db:make-admin -- <email>");
    process.exit(1);
  }

  // 1) Find user by email in auth.users
  const { data: usersData, error: usersErr } =
    await supabase.auth.admin.listUsers();
  if (usersErr) {
    console.error(usersErr);
    process.exit(1);
  }

  const user = usersData.users.find((u) => u.email === email);
  if (!user) {
    console.error(
      `No existe ningún usuario con email "${email}". Registralo primero en /registro.`
    );
    process.exit(1);
  }

  // 2) Find store
  const { data: store } = await supabase
    .from("stores")
    .select("id, name")
    .eq("slug", STORE_SLUG)
    .single();

  if (!store) {
    console.error(`No existe la store "${STORE_SLUG}". Corré npm run db:seed primero.`);
    process.exit(1);
  }

  // 3) Upsert membership as owner
  const { error: memberErr } = await supabase.from("store_members").upsert(
    {
      store_id: store.id,
      user_id: user.id,
      role: "owner",
    },
    { onConflict: "store_id,user_id" }
  );

  if (memberErr) {
    console.error(memberErr);
    process.exit(1);
  }

  console.log(`✅ ${email} es ahora owner de "${store.name}".`);
  console.log(`   Entrá a /admin con su cuenta.`);
}

main();
