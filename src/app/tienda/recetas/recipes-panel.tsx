"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MinusIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { fmtMoney } from "@/lib/format";
import { emojiFor } from "@/lib/data/emojis";
import { type Receta, escalar } from "@/lib/data/recetas";
import { addToCartAction } from "@/lib/cart/actions";

type Product = {
  id: string;
  name: string;
  price: number;
  unit: string;
  unit_amount: string | null;
  stock: number;
};

export function RecipesPanel({
  recipes,
  productByName,
}: {
  recipes: Receta[];
  productByName: Record<string, Product>;
}) {
  const router = useRouter();
  const [selId, setSelId] = useState<string | null>(null);
  const [personas, setPersonas] = useState(2);
  const [isPending, startTransition] = useTransition();

  const selected = selId ? recipes.find((r) => r.id === selId) ?? null : null;

  const ingredientes = selected
    ? selected.ing.map((ing) => {
        const cantNeeded = escalar(ing.cantPorPersona, personas, ing.factor);
        const cantRound = Math.ceil(cantNeeded * 10) / 10;
        const product = productByName[ing.n] ?? null;
        const unidades = Math.ceil(cantRound);
        const subtotal = product ? product.price * unidades : 0;
        return { ing, cantRound, product, unidades, subtotal };
      })
    : [];

  const allAvailable =
    ingredientes.length > 0 && ingredientes.every((x) => x.product !== null);
  const totalCombo = ingredientes.reduce((s, x) => s + x.subtotal, 0);
  const descuento = allAvailable ? Math.round(totalCombo * 0.05) : 0;
  const totalFinal = totalCombo - descuento;

  const addCombo = () => {
    if (!selected || !allAvailable) return;
    startTransition(async () => {
      let errs = 0;
      for (const x of ingredientes) {
        if (!x.product) continue;
        const r = await addToCartAction({
          productId: x.product.id,
          quantity: x.unidades,
        });
        if (!r.ok) errs++;
      }
      if (errs === 0) {
        toast.success(`Combo "${selected.nombre}" agregado al carrito`);
        window.dispatchEvent(new CustomEvent("cart:updated"));
        window.dispatchEvent(new CustomEvent("cart:open"));
      } else {
        toast.error(`Se agregaron con ${errs} errores`);
      }
      router.refresh();
    });
  };

  return (
    <div className="space-y-5">
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {recipes.map((r) => {
          const isSel = selId === r.id;
          return (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => setSelId(isSel ? null : r.id)}
                className={`w-full text-left bg-card border rounded-xl p-3.5 flex flex-col gap-1.5 transition hover:border-foreground ${
                  isSel
                    ? "border-[var(--success)] bg-[var(--success-bg)]/30"
                    : ""
                }`}
              >
                <div className="text-3xl leading-none">{r.emoji}</div>
                <div className="text-sm font-bold">{r.nombre}</div>
                <div className="text-[11px] text-muted-foreground line-clamp-2 flex-1">
                  {r.desc}
                </div>
                <div className="flex gap-1.5 flex-wrap mt-1">
                  {r.veg && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded text-[var(--success)]" style={{ background: "var(--success-bg)" }}>
                      Vegetariana
                    </span>
                  )}
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-foreground/80">
                    ⏱ {r.tiempo}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded text-[var(--warning)]" style={{ background: "var(--warning-bg)" }}>
                    {r.dificultad}
                  </span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      {selected && (
        <div className="bg-card border rounded-xl p-4 space-y-4">
          <div className="flex items-start gap-3 flex-wrap">
            <div className="text-5xl leading-none">{selected.emoji}</div>
            <div className="flex-1 min-w-[200px]">
              <h3 className="text-base font-bold">{selected.nombre}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {selected.desc}
              </p>
            </div>
            <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-md">
              <span className="text-[11px] text-muted-foreground font-semibold">
                👥 Personas
              </span>
              <button
                type="button"
                onClick={() => setPersonas(Math.max(1, personas - 1))}
                className="size-7 rounded border bg-card font-bold hover:bg-muted/80"
              >
                <MinusIcon className="size-3.5 mx-auto" />
              </button>
              <span className="text-base font-bold min-w-6 text-center">
                {personas}
              </span>
              <button
                type="button"
                onClick={() => setPersonas(Math.min(20, personas + 1))}
                className="size-7 rounded border bg-card font-bold hover:bg-muted/80"
              >
                <PlusIcon className="size-3.5 mx-auto" />
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-[13px] font-bold mb-2">
              🛒 Ingredientes para {personas}{" "}
              {personas === 1 ? "persona" : "personas"}
            </h4>
            <div className="space-y-1.5">
              {ingredientes.map((x, i) => {
                if (!x.product) {
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-2.5 p-2 rounded-md border border-dashed"
                      style={{ background: "#fff5f5", borderColor: "#f5c6cb" }}
                    >
                      <div className="text-lg w-6 text-center">
                        {emojiFor(x.ing.n)}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold">{x.ing.n}</p>
                        <p className="text-[11px] italic text-[var(--destructive)]">
                          No disponible en el catálogo
                        </p>
                      </div>
                    </div>
                  );
                }
                return (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 p-2 rounded-md bg-muted"
                  >
                    <div className="text-lg w-6 text-center">
                      {emojiFor(x.ing.n)}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold">{x.ing.n}</p>
                      <p className="text-[11px] text-muted-foreground">
                        Necesitás: {x.cantRound} {x.ing.unidad} → comprar{" "}
                        {x.unidades} × {x.product.unit_amount ?? x.product.unit}
                      </p>
                    </div>
                    <p className="text-xs font-bold text-[var(--success)]">
                      {fmtMoney(x.subtotal)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            className="p-3 rounded-md border space-y-1"
            style={{ background: "#f7faf3", borderColor: "#d4e8c0" }}
          >
            <div className="flex justify-between text-[13px]">
              <span>Subtotal verduras</span>
              <span>{fmtMoney(totalCombo)}</span>
            </div>
            {descuento > 0 && (
              <div className="flex justify-between text-[13px] text-[var(--success)]">
                <span>Descuento combo (5%)</span>
                <span>−{fmtMoney(descuento)}</span>
              </div>
            )}
            <div className="flex justify-between text-[15px] font-bold pt-1.5 border-t border-[#c8dca8]">
              <span>Total combo</span>
              <span>{fmtMoney(totalFinal)}</span>
            </div>
          </div>

          <button
            type="button"
            disabled={!allAvailable || isPending}
            onClick={addCombo}
            className="w-full h-10 rounded-md text-white text-sm font-bold disabled:opacity-50"
            style={{
              background: allAvailable ? "var(--success)" : "var(--muted-foreground)",
            }}
          >
            {isPending
              ? "Agregando…"
              : allAvailable
                ? `🛒 Agregar combo al carrito (${fmtMoney(totalFinal)})`
                : "Algunos ingredientes no están disponibles"}
          </button>

          <div
            className="p-3 rounded-md border"
            style={{ background: "#fffbe6", borderColor: "#f0d060" }}
          >
            <h5 className="text-xs font-bold mb-1" style={{ color: "#7a6010" }}>
              📝 Preparación
            </h5>
            <ol
              className="pl-4 text-xs leading-relaxed list-decimal space-y-0.5"
              style={{ color: "#5a4a10" }}
            >
              {selected.prep.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
