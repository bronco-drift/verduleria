import Link from "next/link";
import { LoginForm } from "./login-form";

type SearchParams = Promise<{ redirectTo?: string }>;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { redirectTo } = await searchParams;

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Ingresar</h1>
        <p className="text-sm text-muted-foreground">
          Entrá con tu email y contraseña.
        </p>
      </header>

      <LoginForm redirectTo={redirectTo} />

      <p className="text-sm text-center text-muted-foreground">
        ¿No tenés cuenta?{" "}
        <Link href="/registro" className="text-foreground hover:underline">
          Registrate
        </Link>
      </p>
    </div>
  );
}
