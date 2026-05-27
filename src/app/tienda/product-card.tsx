"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MinusIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { emojiFor } from "@/lib/data/emojis";
import { fmtMoney } from "@/lib/format";
import { PRECIOS_COMPETENCIA, statsOf } from "@/lib/data/competidores";
import { addToCartAction } from "@/lib/cart/actions";

type Product = {
  id: string;
  name: string;
  price: number;
  unit: string;
  unit_amount: string | null;
  stock: number;
  stock_min: number;
  is_featured: boolean;
};

export function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [isPending, startTransition] = useTransition();

  const sinStock = product.stock <= 0;
  const stockBajo = product.stock > 0 && product.stock <= product.stock_min;

  const comp = PRECIOS_COMPETENCIA[product.name];
  const stats = comp ? statsOf(comp.precios) : null;
  let compLabel = "";
  if (stats && stats.mn != null) {
    if (product.price <= stats.mn)
      compLabel = "✓ Mejor precio";
    else if (stats.mx != null && product.price >= stats.mx)
      compLabel = "Más caro del mercado";
    else
      compLabel = `Comp: ${fmtMoney(stats.mn)}–${fmtMoney(stats.mx ?? 0)}`;
  }

  const add = () => {
    startTransition(async () => {
      const result = await addToCartAction({
        productId: product.id,
        quantity: qty,
      });
      if (result.ok) {
        toast.success("Agregado al carrito");
        setQty(1);
        window.dispatchEvent(new CustomEvent("cart:updated"));
        window.dispatchEvent(new CustomEvent("cart:open"));
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div
      className="bg-card border rounded-xl p-3 flex flex-col gap-2 relative h-full"
      style={{ opacity: sinStock ? 0.55 : 1 }}
    >
      {sinStock && (
        <div className="absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: "var(--danger-bg)", color: "#721c24" }}>
          SIN STOCK
        </div>
      )}
      {!sinStock && stockBajo && (
        <div className="absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: "var(--warning-bg)", color: "var(--warning)" }}>
          {product.stock} restantes
        </div>
      )}
      <div className="w-full h-16 flex items-center justify-center text-4xl bg-muted rounded-lg">
        {emojiFor(product.name)}
      </div>
      <div>
        <p className="text-[13px] font-semibold leading-tight">
          {product.name}
        </p>
        <p className="text-[11px] text-muted-foreground">
          por {product.unit_amount ?? product.unit}
        </p>
      </div>
      <p className="text-[16px] font-bold text-[var(--success)]">
        {fmtMoney(product.price)}
      </p>
      {compLabel && (
        <p className="text-[10px] text-muted-foreground">{compLabel}</p>
      )}
      <div className="flex items-center gap-1.5 mt-auto">
        <button
          type="button"
          disabled={sinStock || qty <= 1}
          onClick={() => setQty(Math.max(1, qty - 1))}
          className="size-[26px] rounded border bg-card text-base font-bold inline-flex items-center justify-center hover:bg-muted disabled:opacity-40"
        >
          <MinusIcon className="size-3.5" />
        </button>
        <div className="flex-1 text-center text-[13px] font-semibold">{qty}</div>
        <button
          type="button"
          disabled={sinStock}
          onClick={() => setQty(qty + 1)}
          className="size-[26px] rounded border bg-card text-base font-bold inline-flex items-center justify-center hover:bg-muted disabled:opacity-40"
        >
          <PlusIcon className="size-3.5" />
        </button>
      </div>
      <button
        type="button"
        disabled={sinStock || isPending}
        onClick={add}
        className="w-full h-[30px] rounded-md bg-foreground text-background text-xs font-semibold hover:opacity-90 disabled:bg-muted-foreground"
      >
        {sinStock ? "Sin stock" : isPending ? "…" : "Agregar al carrito"}
      </button>
    </div>
  );
}
