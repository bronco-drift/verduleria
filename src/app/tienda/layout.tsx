import { headers } from "next/headers";
import { SubTabs } from "@/components/layout/sub-tabs";
import { StoreSelector } from "@/components/layout/store-selector";
import { getActiveStore, listActiveStores } from "@/lib/active-store";
import { CartToggle } from "./cart-toggle";
import { CartDrawer } from "./cart-drawer";

export default async function TiendaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const h = await headers();
  const pathname = h.get("x-next-pathname") ?? "/tienda";

  const [store, allStores] = await Promise.all([
    getActiveStore(),
    listActiveStores(),
  ]);

  const tabs = [
    { href: "/tienda", label: "Catálogo", match: (p: string) => p === "/tienda" },
    {
      href: "/tienda/recetas",
      label: "👨‍🍳 Recetas",
      match: (p: string) => p.startsWith("/tienda/recetas"),
    },
    {
      href: "/tienda/cerca",
      label: "📍 Cerca de mí",
      match: (p: string) => p.startsWith("/tienda/cerca"),
    },
    {
      href: "/tienda/mis-pedidos",
      label: "Mis pedidos",
      match: (p: string) => p.startsWith("/tienda/mis-pedidos"),
    },
  ];

  return (
    <main className="flex-1 mx-auto w-full max-w-6xl px-6 py-5">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
        <div>
          <p className="text-[11px] text-muted-foreground">Comprando en</p>
          <h2 className="text-[15px] font-bold">{store.name}</h2>
        </div>
        <div className="flex items-center gap-4">
          <StoreSelector stores={allStores} currentSlug={store.slug} />
          <CartToggle />
        </div>
      </div>
      <SubTabs tabs={tabs} pathname={pathname} />
      {children}
      <CartDrawer storeDeliveryFee={Number(store.delivery_fee)} />
    </main>
  );
}
