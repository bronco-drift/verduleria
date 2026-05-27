import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ToggleActiveButton } from "./toggle-active-button";

export default async function AdminStoresPage() {
  const supabase = createSupabaseAdminClient();

  const { data: stores } = await supabase
    .from("stores")
    .select("id, slug, name, address, phone, delivery_fee, is_active")
    .order("name");

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between">
        <p className="text-sm text-muted-foreground">
          {stores?.length ?? 0} verdulerías en el sistema.
        </p>
        <Link
          href="/admin/nueva"
          className={buttonVariants({ size: "sm" })}
        >
          + Nueva verdulería
        </Link>
      </div>

      {!stores || stores.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          No hay verdulerías cargadas todavía.
        </Card>
      ) : (
        <ul className="space-y-2">
          {stores.map((s) => (
            <li key={s.id}>
              <Card className="p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{s.name}</span>
                    <span className="font-mono text-xs text-muted-foreground">
                      /{s.slug}
                    </span>
                    {!s.is_active && (
                      <Badge variant="secondary" className="text-[10px]">
                        inactiva
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {s.address ?? "Sin dirección"}
                    {s.phone && ` · ${s.phone}`}
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  Envío: ${Number(s.delivery_fee).toLocaleString("es-AR")}
                </div>
                <ToggleActiveButton storeId={s.id} isActive={s.is_active} />
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
