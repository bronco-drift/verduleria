import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const { data: stores } = await supabase
    .from("stores")
    .select("slug, name, address, phone")
    .eq("is_active", true)
    .order("name");

  return (
    <main className="flex-1 mx-auto w-full max-w-3xl px-6 py-16">
      <header className="mb-12">
        <h1 className="text-3xl font-semibold tracking-tight">
          Verdulerías cerca de ti
        </h1>
        <p className="mt-2 text-muted-foreground">
          Elegí una verdulería para empezar a comprar.
        </p>
      </header>

      {!stores || stores.length === 0 ? (
        <p className="text-muted-foreground">
          Todavía no hay verdulerías cargadas.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {stores.map((store) => (
            <li key={store.slug}>
              <Link href={`/${store.slug}`} className="block">
                <Card className="transition hover:border-foreground">
                  <CardHeader>
                    <CardTitle>{store.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground space-y-1">
                    {store.address && <p>{store.address}</p>}
                    {store.phone && <p>{store.phone}</p>}
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <footer className="mt-16 pt-6 border-t text-sm text-muted-foreground flex gap-4">
        <Link href="/login" className="hover:text-foreground">
          Soy verdulería: ingresar
        </Link>
        <span>·</span>
        <Link href="/registro" className="hover:text-foreground">
          Crear cuenta
        </Link>
      </footer>
    </main>
  );
}
