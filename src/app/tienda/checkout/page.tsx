import Link from "next/link";
import { getDemoStore } from "@/lib/tenant";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { DEMO_USER_ID } from "@/lib/demo";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { CheckoutForm } from "./checkout-form";

export default async function CheckoutPage() {
  const store = await getDemoStore();
  const supabase = createSupabaseAdminClient();

  const { data: cart } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", DEMO_USER_ID)
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

  const validItems = (items ?? []).filter(
    (it) => it.product !== null
  ) as (Row & { product: NonNullable<Row["product"]> })[];

  if (validItems.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-muted-foreground">Tu carrito está vacío.</p>
        <Link href="/tienda" className={buttonVariants()}>
          Ver catálogo
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
        <h3 className="text-lg font-semibold">Confirmar pedido</h3>
        <p className="text-sm text-muted-foreground">
          Decinos a dónde lo llevamos.
        </p>
        <CheckoutForm />
      </section>

      <aside>
        <Card className="p-4 space-y-3 sticky top-20">
          <h4 className="font-semibold">Resumen</h4>
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
