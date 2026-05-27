"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  updateStoreAction,
  type ActionResult,
} from "@/lib/global-admin/actions";

export function StoreInfoForm({
  storeId,
  defaults,
}: {
  storeId: string;
  defaults: {
    name: string;
    address: string;
    phone: string;
    delivery_fee: number;
  };
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<
    ActionResult | null,
    FormData
  >(updateStoreAction, null);

  useEffect(() => {
    if (state?.ok) {
      toast.success("Guardado");
      router.refresh();
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="storeId" value={storeId} />

      <div className="space-y-1">
        <Label htmlFor="name" className="text-[11px]">
          Nombre
        </Label>
        <Input
          id="name"
          name="name"
          defaultValue={defaults.name}
          required
          className="h-8 text-xs"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="address" className="text-[11px]">
          Dirección
        </Label>
        <Input
          id="address"
          name="address"
          defaultValue={defaults.address}
          placeholder="Av. Cabildo 1234, CABA"
          className="h-8 text-xs"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="phone" className="text-[11px]">
          Teléfono
        </Label>
        <Input
          id="phone"
          name="phone"
          defaultValue={defaults.phone}
          placeholder="+54 9 11 ..."
          className="h-8 text-xs"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="delivery_fee" className="text-[11px]">
          Costo de envío
        </Label>
        <Input
          id="delivery_fee"
          name="delivery_fee"
          type="number"
          step="0.01"
          min="0"
          defaultValue={defaults.delivery_fee}
          className="h-8 text-xs"
        />
      </div>

      {state && !state.ok && (
        <p className="text-[11px] text-[var(--destructive)]">{state.error}</p>
      )}

      <Button
        type="submit"
        disabled={isPending}
        size="sm"
        className="w-full"
      >
        {isPending ? "Guardando…" : "Guardar cambios"}
      </Button>
    </form>
  );
}
