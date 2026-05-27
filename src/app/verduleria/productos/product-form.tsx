"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createProductAction, type ActionResult } from "@/lib/admin/actions";

const UNITS = [
  "unidad",
  "kg",
  "g",
  "atado",
  "bandeja",
  "paquete",
  "docena",
  "litro",
  "ml",
] as const;

export function ProductForm({
  categories,
}: {
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState<
    ActionResult | null,
    FormData
  >(createProductAction, null);

  useEffect(() => {
    if (state?.ok) {
      toast.success("Producto creado");
      formRef.current?.reset();
      router.refresh();
    }
  }, [state, router]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" name="name" required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="price">Precio</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="unit">Unidad</Label>
          <Select name="unit" defaultValue="unidad">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {UNITS.map((u) => (
                <SelectItem key={u} value={u}>
                  {u}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="unit_amount">Cantidad / presentación</Label>
        <Input
          id="unit_amount"
          name="unit_amount"
          placeholder="ej: 500 g, 1 atado, 2 u"
        />
      </div>

      {categories.length > 0 && (
        <div className="space-y-1.5">
          <Label htmlFor="category_id">Categoría</Label>
          <Select name="category_id">
            <SelectTrigger>
              <SelectValue placeholder="(ninguna)" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_featured" className="rounded" />
        Destacado
      </label>

      {state && !state.ok && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Creando…" : "Crear producto"}
      </Button>
    </form>
  );
}
