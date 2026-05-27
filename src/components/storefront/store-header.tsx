import Link from "next/link";
import { ShoppingCartIcon } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/lib/auth/actions";

export async function StoreHeader({
  store,
}: {
  store: { slug: string; name: string };
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Cart count (only if logged in)
  let cartCount = 0;
  if (user) {
    const { data: storeRow } = await supabase
      .from("stores")
      .select("id")
      .eq("slug", store.slug)
      .single();
    if (storeRow) {
      const { data: cart } = await supabase
        .from("carts")
        .select("id")
        .eq("user_id", user.id)
        .eq("store_id", storeRow.id)
        .maybeSingle();
      if (cart) {
        const { data: items } = await supabase
          .from("cart_items")
          .select("quantity")
          .eq("cart_id", cart.id);
        cartCount = items?.reduce((sum, it) => sum + it.quantity, 0) ?? 0;
      }
    }
  }

  return (
    <header className="border-b sticky top-0 bg-background z-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3 flex items-center gap-4">
        <Link href={`/${store.slug}`} className="font-semibold">
          {store.name}
        </Link>

        <nav className="ml-auto flex items-center gap-3 text-sm">
          {user ? (
            <>
              <Link
                href={`/${store.slug}/mis-pedidos`}
                className="text-muted-foreground hover:text-foreground"
              >
                Mis pedidos
              </Link>
              <form action={signOutAction}>
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                >
                  Salir
                </Button>
              </form>
            </>
          ) : (
            <Link href="/login" className="text-muted-foreground hover:text-foreground">
              Ingresar
            </Link>
          )}

          <Link
            href={`/${store.slug}/carrito`}
            className="relative inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 hover:bg-accent"
          >
            <ShoppingCartIcon className="size-4" />
            <span>Carrito</span>
            {cartCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center min-w-5 h-5 px-1 text-xs rounded-full bg-foreground text-background">
                {cartCount}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
