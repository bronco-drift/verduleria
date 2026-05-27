import Link from "next/link";
import { ShoppingBagIcon, StoreIcon, SettingsIcon } from "lucide-react";

const TABS = [
  {
    href: "/tienda",
    label: "Tienda",
    desc: "Vista del cliente",
    Icon: ShoppingBagIcon,
    match: (p: string) => p === "/tienda" || p.startsWith("/tienda/"),
  },
  {
    href: "/verduleria",
    label: "Mi verdulería",
    desc: "Gestión de la tienda",
    Icon: StoreIcon,
    match: (p: string) => p === "/verduleria" || p.startsWith("/verduleria/"),
  },
  {
    href: "/admin",
    label: "Admin",
    desc: "Gestionar verdulerías",
    Icon: SettingsIcon,
    match: (p: string) => p === "/admin" || p.startsWith("/admin/"),
  },
];

export function TopTabs({ pathname }: { pathname: string }) {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <nav className="flex gap-1">
          {TABS.map((t) => {
            const active = t.match(pathname);
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`inline-flex items-center gap-2 px-4 py-3 border-b-2 -mb-px transition-colors ${
                  active
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <t.Icon className="size-4" />
                <span className="font-medium text-sm">{t.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
