"use client";

import { useState } from "react";
import { fmtMoney, margen, markup, precioSugerido } from "@/lib/format";
import {
  COMPETIDORES,
  PRECIOS_COMPETENCIA,
  statsOf,
} from "@/lib/data/competidores";

type Row = {
  id: string;
  name: string;
  unit: string;
  unit_amount: string | null;
  price: number;
  cost: number;
  category: string;
};

type TabKey = "ref" | "kg" | "margen" | "sugeridos";

export function PreciosTabs({ products }: { products: Row[] }) {
  const [tab, setTab] = useState<TabKey>("ref");
  const [margenObj, setMargenObj] = useState(40);

  const TABS: { key: TabKey; label: string }[] = [
    { key: "ref", label: "Precios referencia" },
    { key: "kg", label: "Por kg" },
    { key: "margen", label: "Margen bruto" },
    { key: "sugeridos", label: "Precios sugeridos" },
  ];

  return (
    <div className="space-y-4">
      <nav className="flex gap-1.5 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`text-[11px] px-3 py-1 rounded-full border ${
              tab === t.key
                ? "bg-foreground text-background border-foreground font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === "ref" && <TabReferencia products={products} />}
      {tab === "kg" && <TabPorKg products={products} />}
      {tab === "margen" && (
        <TabMargen
          products={products}
          margenObj={margenObj}
          setMargenObj={setMargenObj}
        />
      )}
      {tab === "sugeridos" && (
        <TabSugeridos
          products={products}
          margenObj={margenObj}
          setMargenObj={setMargenObj}
        />
      )}
    </div>
  );
}

function CompetenciaTable({
  products,
  pricesFor,
  unitLabel,
}: {
  products: Row[];
  pricesFor: (row: Row) => { precios: (number | null)[]; unitOf: string } | null;
  unitLabel: string;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="w-full text-xs min-w-[640px]">
        <thead>
          <tr className="bg-muted text-center">
            <th className="px-2 py-2 text-left font-semibold text-[11px] text-muted-foreground uppercase">
              Producto
            </th>
            {COMPETIDORES.map((c) => (
              <th
                key={c.id}
                className="px-2 py-2 font-semibold text-[11px] text-muted-foreground uppercase"
              >
                {c.nombre}
              </th>
            ))}
            <th className="px-2 py-2 font-semibold text-[11px] text-muted-foreground uppercase border-l-2 border-border">
              Promedio
            </th>
            <th className="px-2 py-2 font-semibold text-[11px] text-muted-foreground uppercase">
              % min→max
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const data = pricesFor(p);
            if (!data) return null;
            const st = statsOf(data.precios);
            return (
              <tr key={p.id} className="border-t hover:bg-muted/50">
                <td className="px-2 py-1.5 text-left">{p.name}</td>
                {data.precios.map((v, i) => (
                  <td key={i} className="px-2 py-1.5 text-center">
                    {v == null ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      <span
                        className={
                          v === st.mn && st.mn !== st.mx
                            ? "px-1.5 py-0.5 rounded font-bold text-[var(--success)]"
                            : "font-semibold"
                        }
                        style={
                          v === st.mn && st.mn !== st.mx
                            ? { background: "var(--success-bg)" }
                            : undefined
                        }
                      >
                        {fmtMoney(v)}
                      </span>
                    )}
                  </td>
                ))}
                <td className="px-2 py-1.5 text-center border-l-2 border-border font-semibold">
                  {st.avg != null ? fmtMoney(st.avg) : "—"}
                </td>
                <td className="px-2 py-1.5 text-center font-bold text-[var(--destructive)]">
                  {st.spreadPct != null ? `${st.spreadPct}%` : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="px-3 py-2 text-[11px] text-muted-foreground border-t">
        {unitLabel}
      </p>
    </div>
  );
}

function TabReferencia({ products }: { products: Row[] }) {
  return (
    <CompetenciaTable
      products={products}
      pricesFor={(p) => {
        const comp = PRECIOS_COMPETENCIA[p.name];
        if (!comp) return null;
        return { precios: comp.precios, unitOf: comp.unit };
      }}
      unitLabel="Precios en la unidad original de cada tienda. Productos sin datos de competencia se omiten."
    />
  );
}

function TabPorKg({ products }: { products: Row[] }) {
  return (
    <CompetenciaTable
      products={products}
      pricesFor={(p) => {
        const comp = PRECIOS_COMPETENCIA[p.name];
        if (!comp || !comp.pesoGramos) return null;
        const factor = 1000 / comp.pesoGramos;
        return {
          precios: comp.precios.map((v) =>
            v == null ? null : Math.round(v * factor)
          ),
          unitOf: "kg",
        };
      }}
      unitLabel="Precios normalizados a $/kg usando peso estimado por unidad."
    />
  );
}

function TabMargen({
  products,
  margenObj,
  setMargenObj,
}: {
  products: Row[];
  margenObj: number;
  setMargenObj: (n: number) => void;
}) {
  const margenes = products
    .map((p) => margen(p.cost, p.price))
    .filter((m): m is number => m != null);
  const avg = margenes.length
    ? margenes.reduce((a, b) => a + b, 0) / margenes.length
    : 0;
  const buenos = margenes.filter((m) => m >= margenObj).length;
  const bajos = margenes.filter((m) => m < 20).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Margen promedio" value={`${Math.round(avg)}%`} color={avg >= margenObj ? "ok" : avg < 20 ? "bad" : "warn"} />
        <StatCard label={`Sobre objetivo (${margenObj}%)`} value={`${buenos}`} color="ok" />
        <StatCard label="Margen bajo (<20%)" value={`${bajos}`} color="bad" />
        <div className="bg-card border rounded-xl p-3.5">
          <p className="text-[11px] text-muted-foreground mb-1">
            Objetivo margen
          </p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={margenObj}
              onChange={(e) =>
                setMargenObj(Math.max(1, Math.min(99, parseInt(e.target.value) || 40)))
              }
              className="w-16 h-8 text-lg font-bold border-b-2 bg-transparent"
            />
            <span className="text-sm">%</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-xs">
          <thead className="bg-muted">
            <tr>
              <Th>Producto</Th>
              <Th className="text-right">Costo</Th>
              <Th className="text-right">Venta</Th>
              <Th className="text-right">Ganancia</Th>
              <Th className="text-right">Margen %</Th>
              <Th className="text-right">Markup %</Th>
              <Th className="text-center">Estado</Th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const mg = margen(p.cost, p.price);
              const mk = markup(p.cost, p.price);
              const ganancia = p.price - p.cost;
              const mgR = mg != null ? Math.round(mg) : null;
              const badge =
                mgR == null
                  ? null
                  : mgR >= margenObj
                    ? { txt: "✓ Bueno", cls: "ok" as const }
                    : mgR >= 20
                      ? { txt: "~ Ajustado", cls: "warn" as const }
                      : { txt: "✗ Bajo", cls: "bad" as const };
              return (
                <tr key={p.id} className="border-t hover:bg-muted/50">
                  <td className="px-2 py-1.5 text-left">{p.name}</td>
                  <td className="px-2 py-1.5 text-right">{fmtMoney(p.cost)}</td>
                  <td className="px-2 py-1.5 text-right font-semibold">
                    {fmtMoney(p.price)}
                  </td>
                  <td
                    className={`px-2 py-1.5 text-right font-semibold ${
                      ganancia >= 0
                        ? "text-[var(--success)]"
                        : "text-[var(--destructive)]"
                    }`}
                  >
                    {fmtMoney(ganancia)}
                  </td>
                  <td className="px-2 py-1.5 text-right">
                    {mgR != null ? (
                      <div className="flex items-center gap-2 justify-end">
                        <div className="flex-1 max-w-[80px] h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full"
                            style={{
                              width: `${Math.min(mgR, 100)}%`,
                              background:
                                mgR >= margenObj
                                  ? "var(--success)"
                                  : mgR >= 20
                                    ? "var(--warning)"
                                    : "var(--destructive)",
                            }}
                          />
                        </div>
                        <span className="font-semibold tabular-nums">
                          {mgR}%
                        </span>
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-2 py-1.5 text-right">
                    {mk != null ? `${Math.round(mk)}%` : "—"}
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    {badge && <Badge cls={badge.cls}>{badge.txt}</Badge>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TabSugeridos({
  products,
  margenObj,
  setMargenObj,
}: {
  products: Row[];
  margenObj: number;
  setMargenObj: (n: number) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="bg-card border rounded-xl p-4 flex items-center gap-3 flex-wrap">
        <span className="text-xs text-muted-foreground">Margen objetivo:</span>
        <input
          type="number"
          value={margenObj}
          onChange={(e) =>
            setMargenObj(Math.max(1, Math.min(99, parseInt(e.target.value) || 40)))
          }
          className="w-16 h-8 text-base font-bold border rounded px-2"
        />
        <span className="text-xs">%</span>
        <p className="text-xs text-muted-foreground ml-auto">
          Dado tu costo y el margen objetivo, calculamos el precio sugerido y lo
          comparamos con la competencia.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-xs">
          <thead className="bg-muted">
            <tr>
              <Th>Producto</Th>
              <Th className="text-right">Tu costo</Th>
              <Th className="text-right">Tu precio actual</Th>
              <Th className="text-right">Sugerido ({margenObj}%)</Th>
              <Th className="text-right">Comp. mínimo</Th>
              <Th className="text-right">Comp. máximo</Th>
              <Th className="text-center">Posición</Th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const sug = precioSugerido(p.cost, margenObj);
              const comp = PRECIOS_COMPETENCIA[p.name];
              const st = comp ? statsOf(comp.precios) : null;
              let pos: { txt: string; cls: "ok" | "warn" | "bad" | "neu" } = {
                txt: "Sin datos",
                cls: "neu",
              };
              if (st && st.mn != null && p.price > 0) {
                if (p.price <= st.mn) pos = { txt: "Más barato", cls: "ok" };
                else if (st.mx != null && p.price >= st.mx)
                  pos = { txt: "Más caro", cls: "bad" };
                else pos = { txt: "En rango", cls: "warn" };
              }
              const difSug =
                sug != null && p.price > 0
                  ? Math.round(((p.price - sug) / sug) * 100)
                  : null;
              return (
                <tr key={p.id} className="border-t hover:bg-muted/50">
                  <td className="px-2 py-1.5 text-left">{p.name}</td>
                  <td className="px-2 py-1.5 text-right">{fmtMoney(p.cost)}</td>
                  <td className="px-2 py-1.5 text-right">
                    <div className="font-semibold">{fmtMoney(p.price)}</div>
                    {difSug != null && (
                      <div
                        className="text-[10px]"
                        style={{
                          color:
                            difSug > 0
                              ? "var(--success)"
                              : difSug < 0
                                ? "var(--destructive)"
                                : "var(--muted-foreground)",
                        }}
                      >
                        {difSug > 0 ? "+" : ""}
                        {difSug}% vs sugerido
                      </div>
                    )}
                  </td>
                  <td className="px-2 py-1.5 text-right">
                    <span
                      className="font-bold px-1.5 py-0.5 rounded text-[var(--success)]"
                      style={{ background: "var(--success-bg)" }}
                    >
                      {fmtMoney(sug)}
                    </span>
                  </td>
                  <td className="px-2 py-1.5 text-right text-muted-foreground">
                    {st && st.mn != null ? fmtMoney(st.mn) : "—"}
                  </td>
                  <td className="px-2 py-1.5 text-right text-muted-foreground">
                    {st && st.mx != null ? fmtMoney(st.mx) : "—"}
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <Badge cls={pos.cls}>{pos.txt}</Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
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

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: "ok" | "warn" | "bad";
}) {
  const colorClass =
    color === "ok"
      ? "text-[var(--success)]"
      : color === "warn"
        ? "text-[var(--warning)]"
        : "text-[var(--destructive)]";
  return (
    <div className="bg-card border rounded-xl p-3.5">
      <p className="text-[11px] text-muted-foreground mb-1">{label}</p>
      <p className={`text-xl font-bold ${colorClass}`}>{value}</p>
    </div>
  );
}

function Badge({
  cls,
  children,
}: {
  cls: "ok" | "warn" | "bad" | "neu";
  children: React.ReactNode;
}) {
  const styles =
    cls === "ok"
      ? { background: "var(--success-bg)", color: "var(--success)" }
      : cls === "warn"
        ? { background: "var(--warning-bg)", color: "var(--warning)" }
        : cls === "bad"
          ? { background: "var(--danger-bg)", color: "#721c24" }
          : { background: "#e9ecef", color: "#555" };
  return (
    <span
      className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full"
      style={styles}
    >
      {children}
    </span>
  );
}
