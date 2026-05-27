"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MinusIcon, PlusIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { fmtMoney } from "@/lib/format";
import { emojiFor } from "@/lib/data/emojis";
import { ZONAS_ENVIO } from "@/lib/data/zonas-envio";
import { updateCartItemAction } from "@/lib/cart/actions";
import type { CartResponse, CartItemRow } from "@/app/api/cart/route";

export function CartDrawer({
  storeDeliveryFee,
}: {
  storeDeliveryFee: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<CartItemRow[]>([]);
  const [zonaIdx, setZonaIdx] = useState(0);
  const [isPending, startTransition] = useTransition();

  const refresh = () => {
    fetch("/api/cart")
      .then((r) => r.json() as Promise<CartResponse>)
      .then((d) => setItems(d.items))
      .catch(() => {});
  };

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    const onOpen = () => setOpen(true);
    window.addEventListener("cart:updated", onUpdate);
    window.addEventListener("cart:open", onOpen);
    return () => {
      window.removeEventListener("cart:updated", onUpdate);
      window.removeEventListener("cart:open", onOpen);
    };
  }, []);

  const update = (itemId: string, qty: number) => {
    startTransition(async () => {
      const result = await updateCartItemAction({ itemId, quantity: qty });
      if (!result.ok) toast.error(result.error);
      refresh();
      window.dispatchEvent(new CustomEvent("cart:updated"));
      router.refresh();
    });
  };

  const subtotal = items.reduce((s, it) => s + it.line_total, 0);
  const zona = ZONAS_ENVIO[zonaIdx];
  const gratis = zona ? subtotal >= zona.freeMin : false;
  const costoEnvio = gratis ? 0 : zona?.costoFijo ?? storeDeliveryFee;
  const total = subtotal + costoEnvio;

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/35 z-40 transition-opacity ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
      />
      <aside
        className={`fixed top-0 right-0 h-screen w-[340px] max-w-[95vw] bg-card z-50 flex flex-col shadow-2xl transition-transform duration-200 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between p-4 border-b">
          <h2 className="text-[15px] font-bold">Tu carrito</h2>
          <button
            onClick={() => setOpen(false)}
            className="size-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
          >
            <XIcon className="size-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {items.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <div className="text-3xl mb-2">🛒</div>
              <p className="text-sm">Tu carrito está vacío</p>
            </div>
          ) : (
            <ul className="divide-y">
              {items.map((it) => (
                <li
                  key={it.id}
                  className="flex items-start gap-2.5 py-2.5"
                >
                  <div className="text-2xl w-8 text-center shrink-0">
                    {emojiFor(it.product_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold truncate">
                      {it.product_name}
                    </p>
                    {it.unit_amount && (
                      <p className="text-[11px] text-muted-foreground">
                        {it.unit_amount}
                      </p>
                    )}
                    <div className="flex items-center gap-1 mt-1">
                      <button
                        onClick={() => update(it.id, it.quantity - 1)}
                        disabled={isPending}
                        className="size-[22px] inline-flex items-center justify-center rounded border text-xs font-bold hover:bg-muted"
                      >
                        <MinusIcon className="size-3" />
                      </button>
                      <span className="text-xs font-semibold min-w-5 text-center">
                        {it.quantity}
                      </span>
                      <button
                        onClick={() => update(it.id, it.quantity + 1)}
                        disabled={isPending}
                        className="size-[22px] inline-flex items-center justify-center rounded border text-xs font-bold hover:bg-muted"
                      >
                        <PlusIcon className="size-3" />
                      </button>
                      <button
                        onClick={() => update(it.id, 0)}
                        disabled={isPending}
                        className="size-[22px] ml-1 inline-flex items-center justify-center rounded border text-[var(--destructive)] hover:bg-[var(--danger-bg)]"
                      >
                        <XIcon className="size-3" />
                      </button>
                    </div>
                  </div>
                  <div className="text-[13px] font-bold text-[var(--success)] whitespace-nowrap">
                    {fmtMoney(it.line_total)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <footer className="p-4 border-t space-y-2.5">
            <div className="flex justify-between text-[13px] text-muted-foreground">
              <span>Subtotal</span>
              <span>{fmtMoney(subtotal)}</span>
            </div>
            <select
              value={zonaIdx}
              onChange={(e) => setZonaIdx(parseInt(e.target.value))}
              className="w-full h-8 px-2 text-xs border rounded-md bg-background"
            >
              {ZONAS_ENVIO.map((z, i) => (
                <option key={z.id} value={i}>
                  {z.nombre}
                </option>
              ))}
            </select>
            <div
              className="text-[11px] px-2.5 py-2 rounded-md leading-snug"
              style={{
                background: gratis
                  ? "var(--success-bg)"
                  : "var(--danger-bg)",
                color: gratis ? "var(--success)" : "#721c24",
              }}
            >
              {gratis
                ? "✓ Envío GRATIS incluido"
                : `Envío: ${fmtMoney(costoEnvio)}. Agregá ${fmtMoney(
                    zona.freeMin - subtotal
                  )} más para envío gratis.`}
            </div>
            <div className="flex justify-between font-bold text-[15px]">
              <span>Total</span>
              <span>{fmtMoney(total)}</span>
            </div>
            <a
              href="/tienda/checkout"
              className="block text-center h-10 leading-10 rounded-md bg-foreground text-background text-sm font-bold"
            >
              Confirmar pedido ↗
            </a>
          </footer>
        )}
      </aside>
    </>
  );
}
