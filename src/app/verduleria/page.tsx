import Link from "next/link";
import { getDemoStore } from "@/lib/tenant";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui/card";
import { OrderStatusBadge } from "@/components/storefront/order-status-badge";

export default async function VerduleriaDashboardPage() {
  const store = await getDemoStore();
  const supabase = createSupabaseAdminClient();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    { count: pendingCount },
    { count: todayCount },
    { count: productCount },
    { count: driverCount },
    { data: recentOrders },
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("store_id", store.id)
      .eq("status", "pending"),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("store_id", store.id)
      .gte("created_at", today.toISOString()),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("store_id", store.id)
      .eq("is_active", true),
    supabase
      .from("store_members")
      .select("user_id", { count: "exact", head: true })
      .eq("store_id", store.id)
      .eq("role", "driver"),
    supabase
      .from("orders")
      .select("id, status, total, created_at, delivery_address")
      .eq("store_id", store.id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return (
    <div className="space-y-8">
      <ul className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat
          label="Pendientes"
          value={pendingCount ?? 0}
          href="/verduleria/pedidos?status=pending"
        />
        <Stat
          label="Pedidos hoy"
          value={todayCount ?? 0}
          href="/verduleria/pedidos"
        />
        <Stat
          label="Productos activos"
          value={productCount ?? 0}
          href="/verduleria/productos"
        />
        <Stat
          label="Repartidores"
          value={driverCount ?? 0}
          href="/verduleria/repartidores"
        />
      </ul>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Últimos pedidos</h3>
          <Link
            href="/verduleria/pedidos"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Ver todos →
          </Link>
        </div>
        {!recentOrders || recentOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin pedidos todavía.</p>
        ) : (
          <ul className="space-y-2">
            {recentOrders.map((o) => (
              <li key={o.id}>
                <Link href={`/verduleria/pedidos/${o.id}`}>
                  <Card className="p-3 flex items-center gap-3 hover:border-foreground">
                    <span className="font-mono text-xs text-muted-foreground w-20">
                      #{o.id.slice(0, 8)}
                    </span>
                    <OrderStatusBadge status={o.status} />
                    <span className="text-sm truncate flex-1">
                      {o.delivery_address}
                    </span>
                    <span className="font-medium">
                      ${Number(o.total).toLocaleString("es-AR")}
                    </span>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href: string;
}) {
  return (
    <li>
      <Link href={href}>
        <Card className="p-4 hover:border-foreground">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            {label}
          </p>
          <p className="text-2xl font-semibold mt-1">{value}</p>
        </Card>
      </Link>
    </li>
  );
}
