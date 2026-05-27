"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createOrderFromCartAction,
  type CheckoutResult,
} from "@/lib/orders/actions";

export function CheckoutForm({
  storeSlug,
  defaultPhone,
}: {
  storeSlug: string;
  defaultPhone: string;
}) {
  const [state, formAction, isPending] = useActionState<
    CheckoutResult | null,
    FormData
  >(createOrderFromCartAction, null);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="storeSlug" value={storeSlug} />

      <div className="space-y-2">
        <Label htmlFor="deliveryAddress">Dirección de entrega</Label>
        <Input
          id="deliveryAddress"
          name="deliveryAddress"
          required
          placeholder="Calle, número, piso, depto"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="customerPhone">Teléfono</Label>
        <Input
          id="customerPhone"
          name="customerPhone"
          type="tel"
          required
          defaultValue={defaultPhone}
          placeholder="+54 9 11 ..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="customerNotes">Notas (opcional)</Label>
        <Textarea
          id="customerNotes"
          name="customerNotes"
          placeholder="Tocar timbre 2, dejar con portero, etc."
          rows={3}
        />
      </div>

      {state && !state.ok && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Procesando…" : "Confirmar pedido"}
      </Button>
    </form>
  );
}
