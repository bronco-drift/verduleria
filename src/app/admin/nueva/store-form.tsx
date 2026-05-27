"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createStoreAction,
  type ActionResult,
} from "@/lib/global-admin/actions";

export function StoreForm() {
  const [state, formAction, isPending] = useActionState<
    ActionResult | null,
    FormData
  >(createStoreAction, null);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          name="name"
          required
          placeholder="ej: Verdulería La Esquina"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="slug">Slug (URL)</Label>
        <Input
          id="slug"
          name="slug"
          required
          placeholder="la-esquina"
          pattern="[a-z0-9\-]+"
        />
        <p className="text-xs text-muted-foreground">
          Solo minúsculas, números y guiones. Aparece en la URL.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="address">Dirección</Label>
        <Input
          id="address"
          name="address"
          placeholder="Av. Cabildo 1234, CABA"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phone">Teléfono</Label>
        <Input id="phone" name="phone" placeholder="+54 9 11 ..." />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="delivery_fee">Costo de envío</Label>
        <Input
          id="delivery_fee"
          name="delivery_fee"
          type="number"
          step="0.01"
          min="0"
          defaultValue="0"
        />
      </div>

      {state && !state.ok && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Creando…" : "Crear verdulería"}
      </Button>
    </form>
  );
}
