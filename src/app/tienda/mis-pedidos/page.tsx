import Link from "next/link";
import { getDemoStore } from "@/lib/tenant";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { DEMO_USER_ID } from "@/lib/demo";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/storefront/order-status-badge";

type SP = Promise<{ just?: string }>;

export default async function MisPedidosPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  const { just } = await searchParams;
  const store = await getDemoStore();
  const supabase = createSupabaseAdminClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("id, status, total, created_at, delivery_address")
    .eq("store_id", store.id)
    .eq("user_id", DEMO_USER_ID)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      {just && (
        <Card className="p-4 bg-green-50 border-green-200">
          <p className="text-sm font-medium text-green-900">
            ✓ Pedido confirmado. La verdulería ya lo ve.
          </p>
        </Card>
      )}

      {!orders || orders.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <p className="text-muted-foreground">Todavía no hiciste pedidos.</p>
          <Link href="/tienda" className={buttonVariants()}>
            Ver catálogo
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li key={o.id}>
              <Card className="p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">
                      #{o.id.slice(0, 8)}
                    </span>
                    <OrderStatusBadge status={o.status} />
                  </div>
                  <p className="text-sm truncate mt-1">{o.delivery_address}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(o.created_at).toLocaleString("es-AR")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    ${Number(o.total).toLocaleString("es-AR")}
                  </p>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
