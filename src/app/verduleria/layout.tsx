import { headers } from "next/headers";
import { SubTabs } from "@/components/layout/sub-tabs";
import { StoreSelector } from "@/components/layout/store-selector";
import { getActiveStore, listActiveStores } from "@/lib/active-store";

export default async function VerduleriaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const h = await headers();
  const pathname = h.get("x-next-pathname") ?? "/verduleria";

  const [store, allStores] = await Promise.all([
    getActiveStore(),
    listActiveStores(),
  ]);

  const tabs = [
    {
      href: "/verduleria",
      label: "Mi verdulería",
      match: (p: string) => p === "/verduleria",
    },
    {
      href: "/verduleria/pedidos",
      label: "Pedidos",
      match: (p: string) => p.startsWith("/verduleria/pedidos"),
    },
    {
      href: "/verduleria/productos",
      label: "Productos y stock",
      match: (p: string) => p.startsWith("/verduleria/productos"),
    },
    {
      href: "/verduleria/precios",
      label: "Precios y márgenes",
      match: (p: string) => p.startsWith("/verduleria/precios"),
    },
    {
      href: "/verduleria/estacionalidad",
      label: "Estacionalidad",
      match: (p: string) => p.startsWith("/verduleria/estacionalidad"),
    },
    {
      href: "/verduleria/proveedores",
      label: "Proveedores",
      match: (p: string) => p.startsWith("/verduleria/proveedores"),
    },
    {
      href: "/verduleria/envios",
      label: "Envíos",
      match: (p: string) => p.startsWith("/verduleria/envios"),
    },
    {
      href: "/verduleria/repartidores",
      label: "Repartidores",
      match: (p: string) => p.startsWith("/verduleria/repartidores"),
    },
  ];

  return (
    <main className="flex-1 mx-auto w-full max-w-6xl px-6 py-5">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
        <div>
          <p className="text-[11px] text-muted-foreground">Gestionando</p>
          <h2 className="text-[15px] font-bold">{store.name}</h2>
        </div>
        <StoreSelector stores={allStores} currentSlug={store.slug} />
      </div>
      <SubTabs tabs={tabs} pathname={pathname} />
      {children}
    </main>
  );
}
