"use client";

import { useState } from "react";
import { fmtMoney } from "@/lib/format";
import { PROVEEDORES_LIST, type Proveedor } from "@/lib/data/proveedores";

type Row = {
  id: string;
  name: string;
  unit: string;
  cost: number;
  proveedor: Proveedor;
  ultimaActualizacion: string;
};

function diasSinActualizar(fecha: string): number {
  const d = new Date(fecha);
  const hoy = new Date();
  return Math.floor((hoy.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}

export function SuppliersTable({ rows: initialRows }: { rows: Row[] }) {
  const [rows, setRows] = useState(initialRows);

  const update = (id: string, patch: Partial<Row>) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="w-full text-xs">
        <thead className="bg-muted">
          <tr>
            <Th>Producto</Th>
            <Th>Proveedor</Th>
            <Th className="text-right">Precio mayorista</Th>
            <Th>Última actualización</Th>
            <Th className="text-right">Días</Th>
            <Th className="text-center">Estado</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const dias = diasSinActualizar(r.ultimaActualizacion);
            const cls = dias > 14 ? "bad" : dias > 7 ? "warn" : "ok";
            const txt = dias > 14 ? "Desactualizado" : dias > 7 ? "Revisar" : "Al día";
            return (
              <tr key={r.id} className="border-t hover:bg-muted/30">
                <td className="px-2 py-1.5 text-left">
                  {r.name}
                  <div className="text-[10px] text-muted-foreground">{r.unit}</div>
                </td>
                <td className="px-2 py-1.5">
                  <select
                    value={r.proveedor}
                    onChange={(e) =>
                      update(r.id, { proveedor: e.target.value as Proveedor })
                    }
                    className="h-7 px-1.5 text-[11px] border rounded bg-card"
                  >
                    {PROVEEDORES_LIST.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-2 py-1.5 text-right">
                  <input
                    type="number"
                    value={r.cost}
                    onChange={(e) =>
                      update(r.id, {
                        cost: parseFloat(e.target.value) || 0,
                        ultimaActualizacion: new Date().toISOString().slice(0, 10),
                      })
                    }
                    className="w-20 h-7 px-1.5 text-right border rounded text-xs"
                  />
                  <div className="text-[10px] text-muted-foreground">
                    {fmtMoney(r.cost)}
                  </div>
                </td>
                <td className="px-2 py-1.5">
                  <input
                    type="date"
                    value={r.ultimaActualizacion}
                    onChange={(e) =>
                      update(r.id, { ultimaActualizacion: e.target.value })
                    }
                    className="h-7 px-1.5 border rounded text-[11px]"
                  />
                </td>
                <td className="px-2 py-1.5 text-right tabular-nums">{dias}d</td>
                <td className="px-2 py-1.5 text-center">
                  <span
                    className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={
                      cls === "ok"
                        ? { background: "var(--success-bg)", color: "var(--success)" }
                        : cls === "warn"
                          ? { background: "var(--warning-bg)", color: "var(--warning)" }
                          : { background: "var(--danger-bg)", color: "#721c24" }
                    }
                  >
                    {txt}
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

function Th({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-2 py-2 font-semibold text-[11px] text-muted-foreground uppercase tracking-wide text-left ${className}`}
    >
      {children}
    </th>
  );
}
