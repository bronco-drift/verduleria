import { headers } from "next/headers";
import { SubTabs } from "@/components/layout/sub-tabs";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const h = await headers();
  const pathname = h.get("x-next-pathname") ?? "/admin";

  const tabs = [
    {
      href: "/admin",
      label: "Verdulerías",
      match: (p: string) => p === "/admin",
    },
    {
      href: "/admin/nueva",
      label: "Nueva",
      match: (p: string) => p === "/admin/nueva",
    },
  ];

  return (
    <main className="flex-1 mx-auto w-full max-w-5xl px-4 sm:px-6 py-6">
      <div className="mb-2">
        <p className="text-xs text-muted-foreground">Sistema</p>
        <h2 className="text-lg font-semibold">Admin global</h2>
      </div>
      <SubTabs tabs={tabs} pathname={pathname} />
      {children}
    </main>
  );
}
