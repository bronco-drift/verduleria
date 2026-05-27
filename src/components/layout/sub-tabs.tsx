import Link from "next/link";

export type SubTab = {
  href: string;
  label: string;
  /** Optional custom match. Defaults to exact href match. */
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
    <nav className="flex gap-1 border-b mb-6">
      {tabs.map((t) => {
        const active = t.match ? t.match(pathname) : pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`px-3 py-2 text-sm -mb-px border-b-2 transition-colors ${
              active
                ? "border-foreground text-foreground font-medium"
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
