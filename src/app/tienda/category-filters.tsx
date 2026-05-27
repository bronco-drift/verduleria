"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CategoryFilters({
  categories,
  activeCat,
  activeQ,
}: {
  categories: string[];
  activeCat: string;
  activeQ: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(activeQ);

  const updateUrl = (newCat: string, newQ: string) => {
    const params = new URLSearchParams();
    if (newCat && newCat !== "Todas") params.set("cat", newCat);
    if (newQ) params.set("q", newQ);
    const qs = params.toString();
    router.push(qs ? `/tienda?${qs}` : "/tienda");
  };

  return (
    <div className="space-y-3">
      <input
        type="text"
        placeholder="Buscar productos..."
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          updateUrl(activeCat, e.target.value);
        }}
        className="h-9 px-3 text-[13px] border rounded-md bg-card w-full sm:max-w-xs"
      />
      <div className="flex gap-1.5 flex-wrap">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => updateUrl(c, q)}
            className={`text-[11px] px-3 py-1 rounded-full border transition ${
              activeCat === c
                ? "bg-foreground text-background border-foreground font-medium"
                : "bg-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
