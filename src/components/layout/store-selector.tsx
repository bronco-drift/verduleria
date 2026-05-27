"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { STORE_COOKIE } from "@/lib/store-cookie";

const LS_KEY = "verduleria:store";

export function StoreSelector({
  stores,
  currentSlug,
}: {
  stores: { slug: string; name: string }[];
  currentSlug: string;
}) {
  const router = useRouter();

  // First-visit sync: if localStorage has a slug but cookie is different, sync.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const local = localStorage.getItem(LS_KEY);
    if (
      local &&
      local !== currentSlug &&
      stores.some((s) => s.slug === local)
    ) {
      document.cookie = `${STORE_COOKIE}=${local}; path=/; max-age=31536000; SameSite=Lax`;
      router.refresh();
    } else if (!local) {
      localStorage.setItem(LS_KEY, currentSlug);
    }
  }, [currentSlug, stores, router]);

  const onChange = (newSlug: string) => {
    localStorage.setItem(LS_KEY, newSlug);
    document.cookie = `${STORE_COOKIE}=${newSlug}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  };

  if (stores.length <= 1) {
    // No need for a selector with a single store
    return null;
  }

  return (
    <label className="inline-flex items-center gap-2 text-[11px] text-muted-foreground">
      <span>Verdulería:</span>
      <select
        value={currentSlug}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 px-2 text-xs border rounded bg-background font-medium text-foreground"
      >
        {stores.map((s) => (
          <option key={s.slug} value={s.slug}>
            {s.name}
          </option>
        ))}
      </select>
    </label>
  );
}
