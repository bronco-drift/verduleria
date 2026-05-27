import Link from "next/link";
import { getAdminContext } from "@/lib/admin/auth";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/lib/auth/actions";
import { Card } from "@/components/ui/card";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getAdminContext();

  if (!ctx) {
    return (
      <main className="flex-1 mx-auto max-w-md px-6 py-16 text-center space-y-4">
        <h1 className="text-xl font-semibold">Sin permisos de administrador</h1>
        <p className="text-sm text-muted-foreground">
          Tu cuenta está logueada pero no es miembro (owner/admin) de ninguna
          verdulería.
        </p>
        <p className="text-xs text-muted-foreground">
          Pedile al owner que te invite, o ejecutá <code>npm run db:make-admin -- tu@email.com</code>{" "}
          desde la consola del proyecto.
        </p>
        <form action={signOutAction}>
          <Button type="submit" variant="outline">
            Cerrar sesión
          </Button>
        </form>
      </main>
    );
  }

  return (
    <>
      <header className="border-b bg-background">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 flex items-center gap-6">
          <Link href="/admin" className="font-semibold">
            {ctx.store.name}
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <NavLink href="/admin">Inicio</NavLink>
            <NavLink href="/admin/pedidos">Pedidos</NavLink>
            <NavLink href="/admin/productos">Productos</NavLink>
            <NavLink href="/admin/repartidores">Repartidores</NavLink>
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <span className="text-muted-foreground hidden sm:inline">
              {ctx.user.email}
            </span>
            <form action={signOutAction}>
              <Button type="submit" variant="ghost" size="sm">
                Salir
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-6">
        {children}
      </main>
    </>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"
    >
      {children}
    </Link>
  );
}
