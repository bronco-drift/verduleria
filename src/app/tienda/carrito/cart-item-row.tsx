"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { MinusIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateCartItemAction } from "@/lib/cart/actions";

export function CartItemRow({
  itemId,
  name,
  unitAmount,
  unitPrice,
  quantity,
}: {
  itemId: string;
  name: string;
  unitAmount: string | null;
  unitPrice: number;
  quantity: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const update = (newQty: number) => {
    startTransition(async () => {
      const result = await updateCartItemAction({ itemId, quantity: newQty });
      if (!result.ok) toast.error(result.error);
      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-3 p-4">
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{name}</p>
        {unitAmount && (
          <p className="text-xs text-muted-foreground">
            {unitAmount} · ${unitPrice.toLocaleString("es-AR")}
          </p>
        )}
      </div>

      <div className="inline-flex items-center rounded-md border">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          disabled={isPending}
          onClick={() => update(quantity - 1)}
          aria-label="Restar"
        >
          <MinusIcon className="size-4" />
        </Button>
        <span className="w-8 text-center text-sm tabular-nums">{quantity}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          disabled={isPending}
          onClick={() => update(quantity + 1)}
          aria-label="Sumar"
        >
          <PlusIcon className="size-4" />
        </Button>
      </div>

      <div className="text-right w-20 font-medium text-sm">
        ${(unitPrice * quantity).toLocaleString("es-AR")}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground"
        disabled={isPending}
        onClick={() => update(0)}
        aria-label="Eliminar"
      >
        <Trash2Icon className="size-4" />
      </Button>
    </div>
  );
}
