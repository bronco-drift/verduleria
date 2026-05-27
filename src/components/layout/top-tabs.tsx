import Link from "next/link";

const TABS = [
  {
    href: "/tienda",
    label: "Tienda",
    emoji: "🛒",
    match: (p: string) => p === "/tienda" || p.startsWith("/tienda/"),
  },
  {
    href: "/verduleria",
    label: "Mi verdulería",
    emoji: "🥦",
    match: (p: string) => p === "/verduleria" || p.startsWith("/verduleria/"),
  },
  {
    href: "/admin",
    label: "Admin",
    emoji: "⚙️",
    match: (p: string) => p === "/admin" || p.startsWith("/admin/"),
  },
];

export function TopTabs({ pathname }: { pathname: string }) {
  return (
    <header className="bg-background">
      <div className="mx-auto max-w-6xl px-6 pt-5 pb-0">
        <h1 className="text-base font-bold mb-0.5">
          🥦 Verdulería Online — Panel
        </h1>
        <p className="text-xs text-muted-foreground mb-4">
          Gestión, análisis y tienda online
        </p>
        <nav className="flex gap-0 border-b-2 border-border overflow-x-auto">
          {TABS.map((t) => {
            const active = t.match(pathname);
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`px-4 py-2 text-xs font-medium border-b-2 -mb-0.5 whitespace-nowrap transition-colors ${
                  active
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="mr-1">{t.emoji}</span>
                {t.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
