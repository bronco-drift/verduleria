"use client";

import { useState } from "react";
import { fmtMoney } from "@/lib/format";
import type { Zona } from "@/lib/data/zonas-envio";

export function ZonesPanel({ initial }: { initial: Zona[] }) {
  const [zonas, setZonas] = useState<Zona[]>(initial);
  const [monto, setMonto] = useState(10000);

  const update = (i: number, patch: Partial<Zona>) =>
    setZonas((prev) =>
      prev.map((z, idx) => (idx === i ? { ...z, ...patch } : z))
    );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {zonas.map((z, i) => {
          const prom = Math.round((z.tiempoMin + z.tiempoMax) / 2);
          return (
            <div key={z.id} className="bg-card border rounded-xl p-4 space-y-2.5">
              <h3 className="text-[13px] font-bold flex items-center gap-1.5">
                📍 {z.nombre}
              </h3>
              <Field label="Costo fijo ($)">
                <input
                  type="number"
                  value={z.costoFijo}
                  onChange={(e) =>
                    update(i, { costoFijo: parseInt(e.target.value) || 0 })
                  }
                  className="w-full h-7 px-2 text-xs border rounded bg-background"
                />
              </Field>
              <Field label="Mínimo para envío gratis ($)">
                <input
                  type="number"
                  value={z.freeMin}
                  onChange={(e) =>
                    update(i, { freeMin: parseInt(e.target.value) || 0 })
                  }
                  className="w-full h-7 px-2 text-xs border rounded bg-background"
                />
              </Field>
              <Field label="Tiempo estimado (min)">
                <div className="flex gap-1.5">
                  <input
                    type="number"
                    value={z.tiempoMin}
                    onChange={(e) =>
                      update(i, { tiempoMin: parseInt(e.target.value) || 0 })
                    }
                    className="w-full h-7 px-2 text-xs border rounded bg-background"
                  />
                  <input
                    type="number"
                    value={z.tiempoMax}
                    onChange={(e) =>
                      update(i, { tiempoMax: parseInt(e.target.value) || 0 })
                    }
                    className="w-full h-7 px-2 text-xs border rounded bg-background"
                  />
                </div>
              </Field>
              <div className="text-[11px] text-muted-foreground bg-muted rounded p-2 leading-relaxed">
                <strong>Envío gratis desde:</strong> {fmtMoney(z.freeMin)}
                <br />
                <strong>Costo:</strong> {fmtMoney(z.costoFijo)}
                <br />
                <strong>Entrega:</strong> {z.tiempoMin}–{z.tiempoMax} min (prom.{" "}
                {prom})
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-card border rounded-xl p-4 space-y-3">
        <h3 className="text-[13px] font-bold">Simulador de pedido</h3>
        <div>
          <label className="text-[11px] text-muted-foreground block mb-1">
            Monto del pedido ($)
          </label>
          <input
            type="number"
            value={monto}
            onChange={(e) => setMonto(parseInt(e.target.value) || 0)}
            className="w-40 h-8 px-2 text-sm border rounded bg-background"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {zonas.map((z) => {
            const gratis = monto >= z.freeMin;
            const costo = gratis ? 0 : z.costoFijo;
            const faltan = gratis ? 0 : z.freeMin - monto;
            return (
              <div
                key={z.id}
                className="rounded-md p-3"
                style={{
                  background: gratis ? "var(--success-bg)" : "var(--danger-bg)",
                }}
              >
                <div className="text-[12px] font-semibold mb-1">{z.nombre}</div>
                <div
                  className="text-[13px] font-bold"
                  style={{
                    color: gratis ? "var(--success)" : "var(--destructive)",
                  }}
                >
                  {gratis ? "✓ Envío GRATIS" : "Envío: " + fmtMoney(z.costoFijo)}
                </div>
                <div className="text-[11px] text-foreground/70 mt-1">
                  {gratis
                    ? "Supera el mínimo"
                    : `Faltan ${fmtMoney(faltan)} para envío gratis`}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Total con envío: {fmtMoney(monto + costo)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-[11px] text-muted-foreground block mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}
