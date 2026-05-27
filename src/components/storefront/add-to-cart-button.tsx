"use client";

import { useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { addToCartAction } from "@/lib/cart/actions";

export function AddToCartButton({ productId }: { productId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      const result = await addToCartAction({ productId, quantity: 1 });
      if (result.ok) {
        toast.success("Agregado al carrito");
        router.refresh();
      } else if (result.needsAuth) {
        router.push(`/login?redirectTo=${encodeURIComponent(pathname)}`);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isPending}
      size="sm"
      className="w-full"
    >
      {isPending ? "…" : "Agregar"}
    </Button>
  );
}
