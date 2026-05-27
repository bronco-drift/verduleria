import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getStoreBySlug } from "@/lib/tenant";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/storefront/order-status-badge";

type Params = Promise<{ storeSlug: string }>;
type SP = Promise<{ just?: string }>;

export default async function MisPedidosPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SP;
}) {
  const { storeSlug } = await params;
  const { just } = await searchParams;
  const store = await getStoreBySlug(storeSlug);
  if (!store) notFound();

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(
      `/login?redirectTo=${encodeURIComponent(`/${storeSlug}/mis-pedidos`)}`
    );
  }

  const { data: orders } = await supabase
    .from("orders")
    .select("id, status, total, created_at, delivery_address")
    .eq("store_id", store.id)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Mis pedidos</h1>

      {just && (
        <Card className="p-4 bg-green-50 border-green-200">
          <p className="text-sm font-medium text-green-900">
            ✓ Pedido confirmado. Te avisamos cuando esté en camino.
          </p>
        </Card>
      )}

      {!orders || orders.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <p className="text-muted-foreground">Todavía no hiciste pedidos.</p>
          <Link href={`/${storeSlug}`} className={buttonVariants()}>
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
