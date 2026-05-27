"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SettingsIcon, CheckIcon, PlusIcon } from "lucide-react";
import { STORE_COOKIE } from "@/lib/store-cookie";

const LS_KEY = "verduleria:store";

export function AdminMenu({
  stores,
  currentSlug,
}: {
  stores: { slug: string; name: string }[];
  currentSlug: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Hydrate cookie from localStorage on mount if mismatched
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

  // Click outside to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const selectStore = (slug: string) => {
    if (slug === currentSlug) {
      setOpen(false);
      return;
    }
    localStorage.setItem(LS_KEY, slug);
    document.cookie = `${STORE_COOKIE}=${slug}; path=/; max-age=31536000; SameSite=Lax`;
    setOpen(false);
    router.refresh();
  };

  const current = stores.find((s) => s.slug === currentSlug);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 h-8 px-3 rounded-md border bg-card text-xs font-medium hover:bg-muted"
      >
        <SettingsIcon className="size-3.5" />
        <span>{current?.name ?? "Admin"}</span>
        <span className="text-muted-foreground">▾</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-64 bg-card border rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="p-2.5 border-b">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold mb-1">
              Verdulería activa
            </p>
            <ul className="space-y-0.5">
              {stores.length === 0 ? (
                <li className="text-xs text-muted-foreground italic px-2 py-1">
                  Sin verdulerías. Creá una abajo.
                </li>
              ) : (
                stores.map((s) => {
                  const isCurrent = s.slug === currentSlug;
                  return (
                    <li key={s.slug}>
                      <button
                        type="button"
                        onClick={() => selectStore(s.slug)}
                        className={`w-full flex items-center justify-between text-left text-xs px-2 py-1.5 rounded hover:bg-muted ${
                          isCurrent ? "font-semibold" : ""
                        }`}
                      >
                        <span className="truncate">{s.name}</span>
                        {isCurrent && (
                          <CheckIcon className="size-3.5 text-[var(--success)] shrink-0" />
                        )}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>

          <div className="p-1.5">
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 text-xs px-2.5 py-1.5 rounded hover:bg-muted"
            >
              <SettingsIcon className="size-3.5" />
              Gestionar verdulerías
            </Link>
            <Link
              href="/admin/nueva"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 text-xs px-2.5 py-1.5 rounded hover:bg-muted"
            >
              <PlusIcon className="size-3.5" />
              Nueva verdulería
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
