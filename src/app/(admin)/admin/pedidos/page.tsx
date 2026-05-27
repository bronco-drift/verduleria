import Link from "next/link";
import { requireAdminContext } from "@/lib/admin/auth";
import { Card } from "@/components/ui/card";
import { OrderStatusBadge } from "@/components/storefront/order-status-badge";
import { Badge } from "@/components/ui/badge";

type SP = Promise<{ status?: string }>;

const STATUS_FILTERS = [
  { value: "", label: "Todos" },
  { value: "pending", label: "Pendientes" },
  { value: "preparing", label: "Preparando" },
  { value: "ready", label: "Listos" },
  { value: "in_delivery", label: "En camino" },
  { value: "delivered", label: "Entregados" },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  const ctx = await requireAdminContext();
  const { status } = await searchParams;

  let query = ctx.admin
    .from("orders")
    .select(
      `id, status, total, created_at, delivery_address, customer_phone,
       delivery:deliveries(status, driver_id)`
    )
    .eq("store_id", ctx.store.id)
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data: orders } = await query;

  return (
    <div className="space-y-6">
      <header className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">Pedidos</h1>
        <span className="text-sm text-muted-foreground">
          {orders?.length ?? 0} resultados
        </span>
      </header>

      <nav className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map((f) => (
          <Link
            key={f.value}
            href={f.value ? `/admin/pedidos?status=${f.value}` : "/admin/pedidos"}
            className={`px-3 py-1 rounded-full text-sm border ${
              (status ?? "") === f.value
                ? "bg-foreground text-background border-foreground"
                : "hover:bg-accent"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </nav>

      {!orders || orders.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin pedidos en este filtro.</p>
      ) : (
        <ul className="space-y-2">
          {orders.map((o) => {
            const delivery = Array.isArray(o.delivery)
              ? o.delivery[0]
              : o.delivery;
            return (
              <li key={o.id}>
                <Link href={`/admin/pedidos/${o.id}`}>
                  <Card className="p-4 hover:border-foreground space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-muted-foreground">
                        #{o.id.slice(0, 8)}
                      </span>
                      <OrderStatusBadge status={o.status} />
                      {delivery?.status && (
                        <Badge variant="outline" className="text-xs">
                          envío: {delivery.status}
                        </Badge>
                      )}
                      <span className="ml-auto text-xs text-muted-foreground">
                        {new Date(o.created_at).toLocaleString("es-AR")}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="truncate flex-1">{o.delivery_address}</span>
                      <span className="font-medium">
                        ${Number(o.total).toLocaleString("es-AR")}
                      </span>
                    </div>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
