"use client";

import { useEffect, useState } from "react";
import { ShoppingCartIcon } from "lucide-react";
import type { CartResponse } from "@/app/api/cart/route";

export function CartToggle() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchCount = () => {
      fetch("/api/cart")
        .then((r) => r.json() as Promise<CartResponse>)
        .then((d) => setCount(d.count))
        .catch(() => {});
    };
    fetchCount();
    const onUpdate = () => fetchCount();
    window.addEventListener("cart:updated", onUpdate);
    return () => window.removeEventListener("cart:updated", onUpdate);
  }, []);

  const openCart = () => {
    window.dispatchEvent(new CustomEvent("cart:open"));
  };

  return (
    <button
      type="button"
      onClick={openCart}
      className="relative inline-flex items-center gap-2 h-9 px-4 rounded-md bg-foreground text-background text-xs font-semibold hover:opacity-90"
    >
      <ShoppingCartIcon className="size-4" />
      <span>Carrito</span>
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] inline-flex items-center justify-center text-[10px] font-bold rounded-full bg-[var(--destructive)] text-white px-1">
          {count}
        </span>
      )}
    </button>
  );
}
