"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { fmtMoney, margen } from "@/lib/format";
import { emojiFor } from "@/lib/data/emojis";
import {
  updateProductAction,
  deleteProductAction,
} from "@/lib/admin/actions";

export type StockRow = {
  id: string;
  name: string;
  category: string;
  unit: string;
  unit_amount: string | null;
  price: number;
  cost: number;
  stock: number;
  stock_min: number;
  is_active: boolean;
  is_featured: boolean;
};

type StatusFilter = "all" | "ok" | "low" | "out" | "off";
type SortCol =
  | "name"
  | "cat"
  | "costo"
  | "venta"
  | "margen"
  | "stock"
  | "stockMin"
  | "status"
  | null;

const MARGEN_OBJ = 40;

function statusOf(r: StockRow): "ok" | "low" | "out" | "off" {
  if (!r.is_active) return "off";
  if (r.stock <= 0) return "out";
  if (r.stock <= r.stock_min) return "low";
  return "ok";
}

const STATUS_LABEL: Record<"ok" | "low" | "out" | "off", string> = {
  ok: "✓ OK",
  low: "⚠ Bajo",
  out: "✗ Sin stock",
  off: "○ Inactivo",
};

export function StockPanel({
  rows: initial,
  categories,
}: {
  rows: StockRow[];
  categories: string[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Local optimistic state (so inputs feel snappy). Synced to server on blur.
  const [rows, setRows] = useState(initial);

  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("Todas");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [bulkOpen, setBulkOpen] = useState(false);

  const [sortCol, setSortCol] = useState<SortCol>(null);
  const [sortDir, setSortDir] = useState<1 | -1>(1);

  const filtered = useMemo(() => {
    let out = rows;
    if (cat !== "Todas") out = out.filter((r) => r.category === cat);
    if (search) {
      const q = search.toLowerCase();
      out = out.filter((r) => r.name.toLowerCase().includes(q));
    }
    if (statusFilter !== "all") {
      out = out.filter((r) => statusOf(r) === statusFilter);
    }
    if (sortCol) {
      const dir = sortDir;
      out = [...out].sort((a, b) => {
        const va: string | number =
          sortCol === "name"
            ? a.name
            : sortCol === "cat"
              ? a.category
              : sortCol === "costo"
                ? a.cost
                : sortCol === "venta"
                  ? a.price
                  : sortCol === "margen"
                    ? margen(a.cost, a.price) ?? 0
                    : sortCol === "stock"
                      ? a.stock
                      : sortCol === "stockMin"
                        ? a.stock_min
                        : statusOf(a);
        const vb: string | number =
          sortCol === "name"
            ? b.name
            : sortCol === "cat"
              ? b.category
              : sortCol === "costo"
                ? b.cost
                : sortCol === "venta"
                  ? b.price
                  : sortCol === "margen"
                    ? margen(b.cost, b.price) ?? 0
                    : sortCol === "stock"
                      ? b.stock
                      : sortCol === "stockMin"
                        ? b.stock_min
                        : statusOf(b);
        if (typeof va === "string") return va.localeCompare(vb as string) * dir;
        return ((va as number) - (vb as number)) * dir;
      });
    }
    return out;
  }, [rows, cat, search, statusFilter, sortCol, sortDir]);

  // Summary stats (over ALL rows, not filtered)
  const summary = useMemo(() => {
    const activos = rows.filter((r) => r.is_active).length;
    const bajos = rows.filter((r) => statusOf(r) === "low").length;
    const sinStock = rows.filter((r) => statusOf(r) === "out").length;
    const valorTotal = rows.reduce(
      (a, r) => a + (r.is_active ? r.stock * r.cost : 0),
      0
    );
    const mgs = rows
      .filter((r) => r.is_active)
      .map((r) => margen(r.cost, r.price))
      .filter((m): m is number => m != null);
    const margProm = mgs.length ? mgs.reduce((a, b) => a + b, 0) / mgs.length : 0;
    return {
      activos,
      total: rows.length,
      bajos,
      sinStock,
      valorTotal,
      margProm,
    };
  }, [rows]);

  // Patch local + server
  const patchRow = (id: string, patch: Partial<StockRow>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const persist = (
    id: string,
    patch: Parameters<typeof updateProductAction>[0]["patch"]
  ) => {
    startTransition(async () => {
      const result = await updateProductAction({ id, patch });
      if (!result.ok) {
        toast.error(result.error);
        router.refresh();
      }
    });
  };

  const toggleSort = (col: SortCol) => {
    if (sortCol === col) {
      if (sortDir === 1) setSortDir(-1);
      else {
        setSortCol(null);
        setSortDir(1);
      }
    } else {
      setSortCol(col);
      setSortDir(1);
    }
  };

  const removeRow = (id: string, name: string) => {
    if (!confirm(`¿Borrar "${name}"?`)) return;
    startTransition(async () => {
      const result = await deleteProductAction(id);
      if (result.ok) {
        toast.success("Eliminado");
        setRows((prev) => prev.filter((r) => r.id !== id));
      } else {
        toast.error(result.error);
      }
    });
  };

  // Bulk operations (apply over CURRENT filter)
  const bulkActivate = (active: boolean) => {
    if (!confirm(`${active ? "Activar" : "Desactivar"} ${filtered.length} productos?`)) return;
    startTransition(async () => {
      for (const r of filtered) {
        if (r.is_active !== active) {
          await updateProductAction({ id: r.id, patch: { is_active: active } });
        }
      }
      toast.success(`${filtered.length} productos actualizados`);
      router.refresh();
    });
  };

  const bulkAdjustPrices = (pct: number) => {
    if (!confirm(`¿Aplicar ${pct >= 0 ? "+" : ""}${pct}% a ${filtered.length} productos?`)) return;
    startTransition(async () => {
      for (const r of filtered) {
        const newPrice = Math.round(r.price * (1 + pct / 100));
        await updateProductAction({ id: r.id, patch: { price: newPrice } });
      }
      toast.success(`Precios actualizados (${pct >= 0 ? "+" : ""}${pct}%)`);
      router.refresh();
    });
  };

  const bulkSetStockMin = (v: number) => {
    startTransition(async () => {
      for (const r of filtered) {
        await updateProductAction({ id: r.id, patch: { stock_min: v } });
      }
      toast.success(`Stock mínimo = ${v} para ${filtered.length} productos`);
      router.refresh();
    });
  };

  const bulkRestock = (v: number) => {
    startTransition(async () => {
      for (const r of filtered) {
        await updateProductAction({ id: r.id, patch: { stock: v } });
      }
      toast.success(`Stock repuesto a ${v}`);
      router.refresh();
    });
  };

  const exportCSV = () => {
    const headers = [
      "Producto",
      "Categoría",
      "Unidad",
      "Activo",
      "Costo",
      "Precio venta",
      "Margen %",
      "Stock",
      "Stock mín",
      "Estado",
    ];
    const lines = [headers.join(",")];
    for (const r of filtered) {
      const mg = margen(r.cost, r.price);
      lines.push(
        [
          `"${r.name}"`,
          r.category,
          r.unit,
          r.is_active ? "Sí" : "No",
          r.cost,
          r.price,
          mg ? Math.round(mg) : 0,
          r.stock,
          r.stock_min,
          STATUS_LABEL[statusOf(r)],
        ].join(",")
      );
    }
    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stock_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* SUMMARY BAR */}
      <ul className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        <SummaryCard
          label="Activos"
          value={`${summary.activos}/${summary.total}`}
          tone="ok"
        />
        <SummaryCard label="Stock bajo" value={summary.bajos} tone="warn" />
        <SummaryCard label="Sin stock" value={summary.sinStock} tone="bad" />
        <SummaryCard
          label="Valor stock"
          value={fmtMoney(summary.valorTotal)}
        />
        <SummaryCard
          label="Margen prom"
          value={`${Math.round(summary.margProm)}%`}
          tone={
            summary.margProm >= MARGEN_OBJ
              ? "ok"
              : summary.margProm >= 20
                ? "warn"
                : "bad"
          }
        />
      </ul>

      {/* TOOLBAR */}
      <div className="bg-card border rounded-xl p-3 flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar producto..."
          className="flex-1 min-w-[180px] h-8 px-2.5 text-xs border rounded bg-background"
        />
        <div className="flex gap-1.5 flex-wrap">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              className={`text-[11px] px-2.5 py-1 rounded-full border ${
                cat === c
                  ? "bg-foreground text-background border-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(
            [
              ["all", "Todos"],
              ["ok", "Con stock"],
              ["low", "Bajos"],
              ["out", "Sin stock"],
              ["off", "Inactivos"],
            ] as const
          ).map(([k, v]) => (
            <button
              key={k}
              type="button"
              onClick={() => setStatusFilter(k)}
              className={`text-[11px] px-2.5 py-1 rounded-full border ${
                statusFilter === k
                  ? "bg-foreground text-background border-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 ml-auto">
          <button
            type="button"
            onClick={() => bulkActivate(true)}
            disabled={isPending}
            className="h-7 px-2.5 text-[11px] font-semibold rounded bg-foreground text-background"
          >
            ✓ Activar
          </button>
          <button
            type="button"
            onClick={() => bulkActivate(false)}
            disabled={isPending}
            className="h-7 px-2.5 text-[11px] font-semibold rounded border text-[var(--destructive)] hover:bg-[var(--danger-bg)]"
          >
            ✗ Desactivar
          </button>
          <button
            type="button"
            onClick={() => setBulkOpen(!bulkOpen)}
            className="h-7 px-2.5 text-[11px] font-semibold rounded border bg-card hover:bg-muted"
          >
            ⚙ Acciones masivas
          </button>
          <button
            type="button"
            onClick={exportCSV}
            className="h-7 px-2.5 text-[11px] font-semibold rounded border bg-card hover:bg-muted"
          >
            ⬇ CSV
          </button>
        </div>
      </div>

      {/* BULK PANEL */}
      {bulkOpen && <BulkPanel
        count={filtered.length}
        onAdjustPrices={bulkAdjustPrices}
        onSetStockMin={bulkSetStockMin}
        onRestock={bulkRestock}
        disabled={isPending}
      />}

      {/* TABLE */}
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-xs min-w-[900px]">
          <thead className="bg-muted">
            <tr>
              <Th sortable col="name" cur={sortCol} dir={sortDir} onSort={toggleSort}>
                Producto
              </Th>
              <Th sortable col="cat" cur={sortCol} dir={sortDir} onSort={toggleSort}>
                Categoría
              </Th>
              <Th sortable col="costo" cur={sortCol} dir={sortDir} onSort={toggleSort} align="right">
                Costo
              </Th>
              <Th sortable col="venta" cur={sortCol} dir={sortDir} onSort={toggleSort} align="right">
                Precio venta
              </Th>
              <Th sortable col="margen" cur={sortCol} dir={sortDir} onSort={toggleSort} align="right">
                Margen
              </Th>
              <Th sortable col="stock" cur={sortCol} dir={sortDir} onSort={toggleSort} align="right">
                Stock
              </Th>
              <Th sortable col="stockMin" cur={sortCol} dir={sortDir} onSort={toggleSort} align="right">
                Mín
              </Th>
              <Th sortable col="status" cur={sortCol} dir={sortDir} onSort={toggleSort} align="center">
                Estado
              </Th>
              <Th align="center">Acciones</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center text-muted-foreground py-6">
                  Sin productos.
                </td>
              </tr>
            ) : (
              filtered.map((r) => {
                const st = statusOf(r);
                const mg = margen(r.cost, r.price);
                const mgClass =
                  mg == null
                    ? "text-muted-foreground"
                    : mg >= MARGEN_OBJ
                      ? "text-[var(--success)]"
                      : mg >= 20
                        ? "text-[var(--warning)]"
                        : "text-[var(--destructive)]";
                return (
                  <tr
                    key={r.id}
                    className={`border-t hover:bg-muted/50 ${
                      !r.is_active ? "opacity-50" : ""
                    }`}
                  >
                    <td className="px-2 py-1.5">
                      <input
                        type="checkbox"
                        checked={r.is_active}
                        onChange={(e) => {
                          patchRow(r.id, { is_active: e.target.checked });
                          persist(r.id, { is_active: e.target.checked });
                        }}
                        className="mr-2 align-middle"
                      />
                      <span className="text-base mr-1">{emojiFor(r.name)}</span>
                      <span className="font-semibold">{r.name}</span>
                      <div className="text-[10px] text-muted-foreground ml-7">
                        por {r.unit_amount ?? r.unit}
                      </div>
                    </td>
                    <td className="px-2 py-1.5 text-[11px] text-muted-foreground">
                      {r.category}
                    </td>
                    <td className="px-2 py-1.5 text-right">
                      <input
                        type="number"
                        value={r.cost}
                        onChange={(e) =>
                          patchRow(r.id, {
                            cost: parseFloat(e.target.value) || 0,
                          })
                        }
                        onBlur={() => persist(r.id, { cost: r.cost })}
                        className="w-20 h-7 px-1.5 text-right border rounded text-xs"
                      />
                    </td>
                    <td className="px-2 py-1.5 text-right">
                      <input
                        type="number"
                        value={r.price}
                        onChange={(e) =>
                          patchRow(r.id, {
                            price: parseFloat(e.target.value) || 0,
                          })
                        }
                        onBlur={() => persist(r.id, { price: r.price })}
                        className="w-20 h-7 px-1.5 text-right border rounded text-xs"
                      />
                    </td>
                    <td
                      className={`px-2 py-1.5 text-right font-bold tabular-nums ${mgClass}`}
                    >
                      {mg != null ? `${Math.round(mg)}%` : "—"}
                    </td>
                    <td className="px-2 py-1.5 text-right">
                      <input
                        type="number"
                        min={0}
                        value={r.stock}
                        onChange={(e) =>
                          patchRow(r.id, {
                            stock: Math.max(0, parseInt(e.target.value) || 0),
                          })
                        }
                        onBlur={() => persist(r.id, { stock: r.stock })}
                        className="w-16 h-7 px-1.5 text-right border rounded text-xs"
                      />
                    </td>
                    <td className="px-2 py-1.5 text-right">
                      <input
                        type="number"
                        min={0}
                        value={r.stock_min}
                        onChange={(e) =>
                          patchRow(r.id, {
                            stock_min: Math.max(
                              0,
                              parseInt(e.target.value) || 0
                            ),
                          })
                        }
                        onBlur={() => persist(r.id, { stock_min: r.stock_min })}
                        className="w-14 h-7 px-1.5 text-right border rounded text-xs"
                      />
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      <StatusBadge status={st} />
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      <div className="flex gap-1 justify-center">
                        <button
                          type="button"
                          title="Reponer +20"
                          onClick={() => {
                            patchRow(r.id, { stock: r.stock + 20 });
                            persist(r.id, { stock: r.stock + 20 });
                          }}
                          className="size-6 inline-flex items-center justify-center text-[10px] rounded border bg-card hover:bg-muted"
                        >
                          +20
                        </button>
                        <button
                          type="button"
                          title="Vaciar stock"
                          onClick={() => {
                            patchRow(r.id, { stock: 0 });
                            persist(r.id, { stock: 0 });
                          }}
                          className="size-6 inline-flex items-center justify-center text-xs rounded border bg-card hover:bg-muted"
                        >
                          ∅
                        </button>
                        <button
                          type="button"
                          title="Borrar"
                          onClick={() => removeRow(r.id, r.name)}
                          className="size-6 inline-flex items-center justify-center text-xs rounded border bg-card text-[var(--destructive)] hover:bg-[var(--danger-bg)]"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-muted-foreground">
        Tip: los cambios se reflejan en la Tienda y en Precios/Márgenes. Los
        inactivos no aparecen en el catálogo.
      </p>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone = "neu",
}: {
  label: string;
  value: string | number;
  tone?: "ok" | "warn" | "bad" | "neu";
}) {
  const cls =
    tone === "ok"
      ? "text-[var(--success)]"
      : tone === "warn"
        ? "text-[var(--warning)]"
        : tone === "bad"
          ? "text-[var(--destructive)]"
          : "";
  return (
    <li className="bg-card border rounded-lg p-2.5 text-center">
      <p className="text-[9px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className={`text-base font-bold mt-1 ${cls}`}>{value}</p>
    </li>
  );
}

function StatusBadge({ status }: { status: "ok" | "low" | "out" | "off" }) {
  const styles = {
    ok: { bg: "var(--success-bg)", color: "var(--success)" },
    low: { bg: "var(--warning-bg)", color: "var(--warning)" },
    out: { bg: "var(--danger-bg)", color: "#721c24" },
    off: { bg: "#e9ecef", color: "#666" },
  }[status];
  return (
    <span
      className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full"
      style={{ background: styles.bg, color: styles.color }}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

function Th({
  children,
  sortable,
  col,
  cur,
  dir,
  onSort,
  align = "left",
}: {
  children: React.ReactNode;
  sortable?: boolean;
  col?: SortCol;
  cur?: SortCol;
  dir?: 1 | -1;
  onSort?: (col: SortCol) => void;
  align?: "left" | "right" | "center";
}) {
  const isCur = sortable && col && cur === col;
  const arrow = !sortable ? "" : isCur ? (dir === 1 ? " ▲" : " ▼") : " ⇅";
  return (
    <th
      onClick={sortable && onSort && col ? () => onSort(col) : undefined}
      className={`px-2 py-2 font-semibold text-[10px] text-muted-foreground uppercase tracking-wide ${
        sortable ? "cursor-pointer hover:text-foreground" : ""
      } ${align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left"}`}
    >
      {children}
      {sortable && (
        <span className="ml-1 text-[8px] opacity-60">{arrow}</span>
      )}
    </th>
  );
}

function BulkPanel({
  count,
  onAdjustPrices,
  onSetStockMin,
  onRestock,
  disabled,
}: {
  count: number;
  onAdjustPrices: (pct: number) => void;
  onSetStockMin: (v: number) => void;
  onRestock: (v: number) => void;
  disabled: boolean;
}) {
  const [pricePct, setPricePct] = useState(10);
  const [stockMin, setStockMin] = useState(5);
  const [restock, setRestock] = useState(50);
  return (
    <div
      className="rounded-md p-3 flex flex-wrap items-center gap-2 text-xs"
      style={{ background: "#fffbe6", border: "1px solid #f0d060" }}
    >
      <span className="text-muted-foreground">
        Aplicar a los {count} filtrados:
      </span>

      <span>Ajustar precio</span>
      <input
        type="number"
        value={pricePct}
        onChange={(e) => setPricePct(parseFloat(e.target.value) || 0)}
        className="w-16 h-7 px-2 border rounded bg-background"
      />
      <span>%</span>
      <button
        disabled={disabled}
        onClick={() => onAdjustPrices(pricePct)}
        className="h-7 px-2.5 text-[11px] font-semibold rounded bg-foreground text-background"
      >
        Aplicar
      </button>

      <span className="ml-3">Stock mín</span>
      <input
        type="number"
        value={stockMin}
        onChange={(e) => setStockMin(parseInt(e.target.value) || 0)}
        className="w-16 h-7 px-2 border rounded bg-background"
      />
      <button
        disabled={disabled}
        onClick={() => onSetStockMin(stockMin)}
        className="h-7 px-2.5 text-[11px] font-semibold rounded bg-foreground text-background"
      >
        Aplicar
      </button>

      <span className="ml-3">Reponer stock</span>
      <input
        type="number"
        value={restock}
        onChange={(e) => setRestock(parseInt(e.target.value) || 0)}
        className="w-16 h-7 px-2 border rounded bg-background"
      />
      <button
        disabled={disabled}
        onClick={() => onRestock(restock)}
        className="h-7 px-2.5 text-[11px] font-semibold rounded bg-foreground text-background"
      >
        Aplicar
      </button>
    </div>
  );
}
