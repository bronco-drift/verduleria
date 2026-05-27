"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  updateProductAction,
  deleteProductAction,
} from "@/lib/admin/actions";

type Product = {
  id: string;
  name: string;
  price: string;
  unit: string;
  unit_amount: string | null;
  is_active: boolean;
  is_featured: boolean;
  category_id: string | null;
};

export function ProductsTable({
  products,
  categories,
}: {
  products: Product[];
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const catById = new Map(categories.map((c) => [c.id, c.name]));

  const toggle = (id: string, field: "is_active" | "is_featured", value: boolean) => {
    startTransition(async () => {
      const result = await updateProductAction({
        id,
        patch: { [field]: !value },
      });
      if (!result.ok) toast.error(result.error);
      router.refresh();
    });
  };

  const remove = (id: string, name: string) => {
    if (!confirm(`¿Borrar "${name}"?`)) return;
    startTransition(async () => {
      const result = await deleteProductAction(id);
      if (result.ok) toast.success("Eliminado");
      else toast.error(result.error);
      router.refresh();
    });
  };

  if (products.length === 0) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        No hay productos. Cargá el primero desde el panel de la derecha.
      </Card>
    );
  }

  return (
    <Card className="divide-y p-0">
      {products.map((p) => (
        <div key={p.id} className="p-3 flex items-center gap-3 text-sm">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium">{p.name}</span>
              {!p.is_active && (
                <Badge variant="secondary" className="text-[10px]">
                  inactivo
                </Badge>
              )}
              {p.is_featured && (
                <Badge variant="outline" className="text-[10px]">
                  destacado
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {p.unit_amount && `${p.unit_amount} · `}
              {p.category_id ? catById.get(p.category_id) ?? "—" : "sin categoría"}
            </p>
          </div>

          <div className="w-20 text-right font-medium">
            ${Number(p.price).toLocaleString("es-AR")}
          </div>

          <Button
            variant="ghost"
            size="sm"
            disabled={isPending}
            onClick={() => toggle(p.id, "is_active", p.is_active)}
            title={p.is_active ? "Desactivar" : "Activar"}
          >
            {p.is_active ? "Pausar" : "Activar"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600"
            disabled={isPending}
            onClick={() => remove(p.id, p.name)}
          >
            Borrar
          </Button>
        </div>
      ))}
    </Card>
  );
}
