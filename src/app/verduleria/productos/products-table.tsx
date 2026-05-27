"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { fmtMoney, margen } from "@/lib/format";
import { emojiFor } from "@/lib/data/emojis";
import {
  updateProductAction,
  deleteProductAction,
} from "@/lib/admin/actions";

type Product = {
  id: string;
  name: string;
  price: number;
  cost: number;
  stock: number;
  stock_min: number;
  unit: string;
  unit_amount: string | null;
  is_active: boolean;
  is_featured: boolean;
  category_id: string | null;
};

export function ProductsTable({
  products,
  categories,
}: {
  products: Product[];
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const catById = new Map(categories.map((c) => [c.id, c.name]));

  const update = (id: string, patch: Parameters<typeof updateProductAction>[0]["patch"]) => {
    startTransition(async () => {
      const result = await updateProductAction({ id, patch });
      if (!result.ok) toast.error(result.error);
      router.refresh();
    });
  };

  const remove = (id: string, name: string) => {
    if (!confirm(`¿Borrar "${name}"?`)) return;
    startTransition(async () => {
      const result = await deleteProductAction(id);
      if (result.ok) toast.success("Eliminado");
      else toast.error(result.error);
      router.refresh();
    });
  };

  if (products.length === 0) {
    return (
      <div className="bg-card border rounded-xl p-8 text-center text-muted-foreground text-sm">
        No hay productos. Cargá el primero desde el panel.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-muted text-left">
            <Th>Producto</Th>
            <Th className="text-right">Costo</Th>
            <Th className="text-right">Venta</Th>
            <Th className="text-right">Margen</Th>
            <Th className="text-right">Stock</Th>
            <Th className="text-right">Mín</Th>
            <Th className="text-center">Estado</Th>
            <Th />
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const mg = margen(p.cost, p.price);
            const mgPct = mg != null ? Math.round(mg) : null;
            const mgColor =
              mgPct == null
                ? ""
                : mgPct >= 40
                  ? "text-[var(--success)]"
                  : mgPct >= 20
                    ? "text-[var(--warning)]"
                    : "text-[var(--destructive)]";
            const sinStock = p.stock <= 0;
            const stockBajo = p.stock > 0 && p.stock <= p.stock_min;
            return (
              <tr
                key={p.id}
                className={`border-t hover:bg-muted/50 ${
                  !p.is_active ? "opacity-50" : ""
                }`}
              >
                <td className="p-2">
                  <div className="flex items-start gap-2">
                    <span className="text-base">{emojiFor(p.name)}</span>
                    <div>
                      <div className="font-semibold">{p.name}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {p.unit_amount ?? p.unit}
                        {p.category_id && ` · ${catById.get(p.category_id)}`}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-2 text-right">
                  <input
                    type="number"
                    defaultValue={p.cost}
                    onBlur={(e) => {
                      const v = parseFloat(e.target.value);
                      if (!Number.isNaN(v) && v !== p.cost)
                        update(p.id, { cost: v });
                    }}
                    className="w-20 h-7 px-1.5 text-right border rounded text-xs"
                  />
                </td>
                <td className="p-2 text-right">
                  <input
                    type="number"
                    defaultValue={p.price}
                    onBlur={(e) => {
                      const v = parseFloat(e.target.value);
                      if (v !== p.price) update(p.id, { price: v });
                    }}
                    className="w-20 h-7 px-1.5 text-right border rounded text-xs"
                  />
                </td>
                <td className={`p-2 text-right font-semibold ${mgColor}`}>
                  {mgPct != null ? `${mgPct}%` : "—"}
                </td>
                <td className="p-2 text-right">
                  <input
                    type="number"
                    defaultValue={p.stock}
                    min={0}
                    onBlur={(e) => {
                      const v = parseInt(e.target.value);
                      if (v !== p.stock) update(p.id, { stock: v });
                    }}
                    className="w-16 h-7 px-1.5 text-right border rounded text-xs"
                  />
                </td>
                <td className="p-2 text-right text-muted-foreground">
                  {p.stock_min}
                </td>
                <td className="p-2 text-center">
                  <span
                    className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={
                      !p.is_active
                        ? { background: "#e9ecef", color: "#666" }
                        : sinStock
                          ? { background: "var(--danger-bg)", color: "#721c24" }
                          : stockBajo
                            ? { background: "var(--warning-bg)", color: "var(--warning)" }
                            : { background: "var(--success-bg)", color: "var(--success)" }
                    }
                  >
                    {!p.is_active
                      ? "Inactivo"
                      : sinStock
                        ? "Sin stock"
                        : stockBajo
                          ? "Bajo"
                          : "OK"}
                  </span>
                </td>
                <td className="p-2 whitespace-nowrap text-right">
                  <button
                    onClick={() => update(p.id, { is_active: !p.is_active })}
                    disabled={isPending}
                    className="text-[11px] px-2 py-1 hover:text-foreground text-muted-foreground"
                  >
                    {p.is_active ? "Pausar" : "Activar"}
                  </button>
                  <button
                    onClick={() => remove(p.id, p.name)}
                    disabled={isPending}
                    className="text-[11px] px-2 py-1 text-[var(--destructive)]"
                  >
                    ✕
                  </button>
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
      className={`px-2 py-2 font-semibold text-[11px] text-muted-foreground uppercase tracking-wide ${className}`}
    >
      {children}
    </th>
  );
}
