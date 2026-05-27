import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getStoreBySlug } from "@/lib/tenant";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { CheckoutForm } from "./checkout-form";

type Params = Promise<{ storeSlug: string }>;

export default async function CheckoutPage({ params }: { params: Params }) {
  const { storeSlug } = await params;
  const store = await getStoreBySlug(storeSlug);
  if (!store) notFound();

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/login?redirectTo=${encodeURIComponent(`/${storeSlug}/checkout`)}`
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("phone")
    .eq("id", user.id)
    .maybeSingle();

  const { data: cart } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", user.id)
    .eq("store_id", store.id)
    .maybeSingle();

  type Row = {
    quantity: number;
    product: { name: string; price: string; unit_amount: string | null } | null;
  };

  const { data: items } = cart
    ? await supabase
        .from("cart_items")
        .select(`quantity, product:products(name, price, unit_amount)`)
        .eq("cart_id", cart.id)
        .returns<Row[]>()
    : { data: [] as Row[] };

  const validItems = (items ?? []).filter((it) => it.product !== null) as (Row & {
    product: NonNullable<Row["product"]>;
  })[];

  if (validItems.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-muted-foreground">Tu carrito está vacío.</p>
        <Link href={`/${storeSlug}`} className={buttonVariants()}>
          Volver al catálogo
        </Link>
      </div>
    );
  }

  const subtotal = validItems.reduce(
    (sum, it) => sum + Number(it.product.price) * it.quantity,
    0
  );
  const deliveryFee = Number(store.delivery_fee);
  const total = subtotal + deliveryFee;

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_320px]">
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">Confirmar pedido</h1>
        <p className="text-sm text-muted-foreground">
          Decinos a dónde lo llevamos.
        </p>
        <CheckoutForm
          storeSlug={storeSlug}
          defaultPhone={profile?.phone ?? ""}
        />
      </section>

      <aside>
        <Card className="p-4 space-y-3 sticky top-20">
          <h2 className="font-semibold">Resumen</h2>
          <ul className="space-y-1.5 text-sm">
            {validItems.map((it, i) => (
              <li key={i} className="flex justify-between gap-2">
                <span className="text-muted-foreground truncate">
                  {it.quantity}× {it.product.name}
                </span>
                <span>
                  $
                  {(Number(it.product.price) * it.quantity).toLocaleString(
                    "es-AR"
                  )}
                </span>
              </li>
            ))}
          </ul>
          <hr />
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${subtotal.toLocaleString("es-AR")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Envío</span>
              <span>${deliveryFee.toLocaleString("es-AR")}</span>
            </div>
            <div className="flex justify-between pt-2 border-t font-semibold">
              <span>Total</span>
              <span>${total.toLocaleString("es-AR")}</span>
            </div>
          </div>
        </Card>
      </aside>
    </div>
  );
}
