"use client";

import { useState } from "react";
import { MESES_NAMES } from "@/lib/data/estacionalidad";

type Row = { id: string; name: string; meses: number[] };

export function SeasonalityGrid({ products }: { products: Row[] }) {
  const [state, setState] = useState<Record<string, number[]>>(
    Object.fromEntries(products.map((p) => [p.id, [...p.meses]]))
  );
  const curMes = new Date().getMonth();

  const toggle = (id: string, mes: number) => {
    setState((prev) => {
      const arr = prev[id] ?? [];
      const idx = arr.indexOf(mes);
      const next = idx >= 0 ? arr.filter((m) => m !== mes) : [...arr, mes].sort((a, b) => a - b);
      return { ...prev, [id]: next };
    });
  };

  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="w-full text-xs min-w-[700px]">
        <thead>
          <tr className="bg-muted">
            <th className="px-3 py-2 text-left font-semibold text-[11px] text-muted-foreground uppercase">
              Producto
            </th>
            {MESES_NAMES.map((m, i) => (
              <th
                key={m}
                className={`px-1 py-2 font-semibold text-[10px] uppercase ${
                  i === curMes
                    ? "bg-blue-50 text-blue-700"
                    : "text-muted-foreground"
                }`}
              >
                {m}
              </th>
            ))}
            <th className="px-2 py-2 text-left font-semibold text-[11px] text-muted-foreground uppercase">
              Disp. hoy
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const meses = state[p.id] ?? [];
            const dispHoy = meses.includes(curMes);
            return (
              <tr key={p.id} className="border-t hover:bg-muted/30">
                <td className="px-3 py-1.5 font-medium">{p.name}</td>
                {MESES_NAMES.map((_, i) => {
                  const on = meses.includes(i);
                  return (
                    <td
                      key={i}
                      className={`px-1 py-1 text-center ${
                        i === curMes ? "bg-blue-50/50" : ""
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggle(p.id, i)}
                        className="size-6 inline-flex items-center justify-center rounded text-[9px] font-bold border transition-colors"
                        style={
                          on
                            ? {
                                background: "var(--success)",
                                color: "white",
                                borderColor: "var(--success)",
                              }
                            : {
                                background: "var(--muted)",
                                color: "var(--muted-foreground)",
                              }
                        }
                      >
                        {MESES_NAMES[i][0]}
                      </button>
                    </td>
                  );
                })}
                <td className="px-2 py-1.5">
                  <span
                    className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={
                      dispHoy
                        ? { background: "var(--success-bg)", color: "var(--success)" }
                        : { background: "var(--danger-bg)", color: "#721c24" }
                    }
                  >
                    {dispHoy ? `✓ ${meses.length} m` : `✗ no hoy (${meses.length} m)`}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
