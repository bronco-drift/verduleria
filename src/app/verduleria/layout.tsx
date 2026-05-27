import { headers } from "next/headers";
import { SubTabs } from "@/components/layout/sub-tabs";
import { getDemoStore } from "@/lib/tenant";

export default async function VerduleriaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const h = await headers();
  const pathname = h.get("x-next-pathname") ?? "/verduleria";

  const store = await getDemoStore();

  const tabs = [
    {
      href: "/verduleria",
      label: "Inicio",
      match: (p: string) => p === "/verduleria",
    },
    {
      href: "/verduleria/pedidos",
      label: "Pedidos",
      match: (p: string) =>
        p === "/verduleria/pedidos" || p.startsWith("/verduleria/pedidos/"),
    },
    {
      href: "/verduleria/productos",
      label: "Productos",
      match: (p: string) => p === "/verduleria/productos",
    },
    {
      href: "/verduleria/repartidores",
      label: "Repartidores",
      match: (p: string) => p === "/verduleria/repartidores",
    },
  ];

  return (
    <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-6">
      <div className="mb-2">
        <p className="text-xs text-muted-foreground">Gestionando</p>
        <h2 className="text-lg font-semibold">{store.name}</h2>
      </div>
      <SubTabs tabs={tabs} pathname={pathname} />
      {children}
    </main>
  );
}
