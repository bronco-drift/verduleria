import Link from "next/link";
import { notFound } from "next/navigation";
import { getDemoStore } from "@/lib/tenant";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { nextStatuses } from "@/lib/admin/order-flow";
import { Card } from "@/components/ui/card";
import { OrderStatusBadge } from "@/components/storefront/order-status-badge";
import { OrderActions } from "./order-actions";
import type { OrderStatus } from "@/db/schema";

type Params = Promise<{ id: string }>;

export default async function OrderDetailPage({
  params,
}: {
  params: Params;
}) {
  const store = await getDemoStore();
  const supabase = createSupabaseAdminClient();
  const { id } = await params;

  const { data: order } = await supabase
    .from("orders")
    .select(
      `id, status, subtotal, delivery_fee, total, delivery_address,
       customer_phone, customer_notes, created_at,
       items:order_items(id, product_name, unit_amount, unit_price, quantity, line_total),
       delivery:deliveries(id, status, driver_id, assigned_at, picked_up_at, delivered_at),
       history:order_status_history(id, status, created_at)`
    )
    .eq("id", id)
    .eq("store_id", store.id)
    .maybeSingle();

  if (!order) notFound();

  const { data: drivers } = await supabase
    .from("store_members")
    .select(`user_id, profiles(full_name, phone)`)
    .eq("store_id", store.id)
    .eq("role", "driver");

  type DriverRow = {
    user_id: string;
    profiles: { full_name: string | null; phone: string | null } | null;
  };

  const driverList = ((drivers ?? []) as unknown as DriverRow[]).map((d) => ({
    id: d.user_id,
    name: d.profiles?.full_name ?? d.user_id.slice(0, 8),
    phone: d.profiles?.phone ?? null,
  }));

  const delivery = Array.isArray(order.delivery)
    ? order.delivery[0]
    : order.delivery;
  const currentDriver = delivery?.driver_id
    ? driverList.find((d) => d.id === delivery.driver_id) ?? null
    : null;

  const sortedHistory = [...(order.history ?? [])].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/verduleria/pedidos"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Volver
        </Link>
      </div>

      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-xl font-semibold">
            Pedido{" "}
            <span className="font-mono text-base text-muted-foreground">
              #{order.id.slice(0, 8)}
            </span>
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {new Date(order.created_at).toLocaleString("es-AR")}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </header>

      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card className="p-4 space-y-3">
            <h4 className="font-semibold">Items</h4>
            <ul className="space-y-2">
              {order.items.map((it) => (
                <li key={it.id} className="flex items-baseline gap-3 text-sm">
                  <span className="font-mono w-8 text-muted-foreground">
                    {it.quantity}×
                  </span>
                  <span className="flex-1">
                    {it.product_name}
                    {it.unit_amount && (
                      <span className="text-muted-foreground ml-1">
                        ({it.unit_amount})
                      </span>
                    )}
                  </span>
                  <span className="font-medium tabular-nums">
                    ${Number(it.line_total).toLocaleString("es-AR")}
                  </span>
                </li>
              ))}
            </ul>
            <div className="pt-3 border-t space-y-1 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>${Number(order.subtotal).toLocaleString("es-AR")}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Envío</span>
                <span>
                  ${Number(order.delivery_fee).toLocaleString("es-AR")}
                </span>
              </div>
              <div className="flex justify-between font-semibold pt-1 border-t">
                <span>Total</span>
                <span>${Number(order.total).toLocaleString("es-AR")}</span>
              </div>
            </div>
          </Card>

          <Card className="p-4 space-y-2">
            <h4 className="font-semibold">Entrega</h4>
            <p className="text-sm">{order.delivery_address}</p>
            <p className="text-sm text-muted-foreground">
              📞 {order.customer_phone}
            </p>
            {order.customer_notes && (
              <p className="text-sm bg-muted p-2 rounded mt-2">
                <span className="font-medium">Notas:</span>{" "}
                {order.customer_notes}
              </p>
            )}
          </Card>

          <Card className="p-4">
            <h4 className="font-semibold mb-3">Historial</h4>
            <ol className="space-y-2">
              {sortedHistory.map((h) => (
                <li key={h.id} className="flex items-center gap-3 text-sm">
                  <OrderStatusBadge status={h.status} />
                  <span className="text-xs text-muted-foreground">
                    {new Date(h.created_at).toLocaleString("es-AR")}
                  </span>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <aside>
          <Card className="p-4 space-y-4 sticky top-4">
            <OrderActions
              orderId={order.id}
              currentStatus={order.status as OrderStatus}
              nextOptions={nextStatuses(order.status as OrderStatus)}
              drivers={driverList}
              currentDriverId={delivery?.driver_id ?? null}
              currentDriverName={currentDriver?.name ?? null}
            />
          </Card>
        </aside>
      </div>
    </div>
  );
}
