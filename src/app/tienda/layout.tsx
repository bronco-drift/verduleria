import { headers } from "next/headers";
import { SubTabs } from "@/components/layout/sub-tabs";
import { getDemoStore } from "@/lib/tenant";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { DEMO_USER_ID } from "@/lib/demo";

export default async function TiendaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const h = await headers();
  const pathname = h.get("x-next-pathname") ?? "/tienda";

  const store = await getDemoStore();

  // Cart count
  const supabase = createSupabaseAdminClient();
  const { data: cart } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", DEMO_USER_ID)
    .eq("store_id", store.id)
    .maybeSingle();
  let cartCount = 0;
  if (cart) {
    const { data: items } = await supabase
      .from("cart_items")
      .select("quantity")
      .eq("cart_id", cart.id);
    cartCount = items?.reduce((sum, it) => sum + it.quantity, 0) ?? 0;
  }

  const tabs = [
    { href: "/tienda", label: "Catálogo" },
    {
      href: "/tienda/carrito",
      label: cartCount > 0 ? `Carrito (${cartCount})` : "Carrito",
    },
    { href: "/tienda/mis-pedidos", label: "Mis pedidos" },
  ];

  return (
    <main className="flex-1 mx-auto w-full max-w-5xl px-4 sm:px-6 py-6">
      <div className="mb-2">
        <p className="text-xs text-muted-foreground">Comprando en</p>
        <h2 className="text-lg font-semibold">{store.name}</h2>
      </div>
      <SubTabs tabs={tabs} pathname={pathname} />
      {children}
    </main>
  );
}
