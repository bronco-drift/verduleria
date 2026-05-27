import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getStoreBySlug } from "@/lib/tenant";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CartItemRow } from "./cart-item-row";

type Params = Promise<{ storeSlug: string }>;

export default async function CartPage({ params }: { params: Params }) {
  const { storeSlug } = await params;
  const store = await getStoreBySlug(storeSlug);
  if (!store) notFound();

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirectTo=${encodeURIComponent(`/${storeSlug}/carrito`)}`);
  }

  const { data: cart } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", user.id)
    .eq("store_id", store.id)
    .maybeSingle();

  type Row = {
    id: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      price: string;
      unit_amount: string | null;
    } | null;
  };

  const { data: items } = cart
    ? await supabase
        .from("cart_items")
        .select(
          `id, quantity, product:products(id, name, price, unit_amount)`
        )
        .eq("cart_id", cart.id)
        .order("created_at")
        .returns<Row[]>()
    : { data: [] as Row[] };

  const validItems = (items ?? []).filter((it) => it.product !== null) as (Row & {
    product: NonNullable<Row["product"]>;
  })[];

  const subtotal = validItems.reduce(
    (sum, it) => sum + Number(it.product.price) * it.quantity,
    0
  );
  const deliveryFee = Number(store.delivery_fee);
  const total = subtotal + deliveryFee;

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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Tu carrito</h1>

      <Card className="divide-y p-0">
        {validItems.map((it) => (
          <CartItemRow
            key={it.id}
            itemId={it.id}
            name={it.product.name}
            unitAmount={it.product.unit_amount}
            unitPrice={Number(it.product.price)}
            quantity={it.quantity}
          />
        ))}
      </Card>

      <Card className="p-4 space-y-2">
        <Row label="Subtotal" value={subtotal} />
        <Row label="Envío" value={deliveryFee} />
        <div className="pt-2 border-t flex justify-between font-semibold text-lg">
          <span>Total</span>
          <span>${total.toLocaleString("es-AR")}</span>
        </div>
      </Card>

      <div className="flex gap-3 justify-end">
        <Link
          href={`/${storeSlug}`}
          className={buttonVariants({ variant: "outline" })}
        >
          Seguir comprando
        </Link>
        <Link href={`/${storeSlug}/checkout`} className={buttonVariants()}>
          Ir al checkout
        </Link>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span>${value.toLocaleString("es-AR")}</span>
    </div>
  );
}
