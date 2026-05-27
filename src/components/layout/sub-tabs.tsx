import Link from "next/link";

export type SubTab = {
  href: string;
  label: string;
  match?: (pathname: string) => boolean;
};

export function SubTabs({
  tabs,
  pathname,
}: {
  tabs: SubTab[];
  pathname: string;
}) {
  return (
    <nav className="flex gap-0 border-b-2 border-border mb-5 overflow-x-auto">
      {tabs.map((t) => {
        const active = t.match ? t.match(pathname) : pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`px-3 py-2 text-xs font-medium border-b-2 -mb-0.5 whitespace-nowrap transition-colors ${
              active
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
