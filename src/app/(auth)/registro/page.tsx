import Link from "next/link";
import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Crear cuenta</h1>
        <p className="text-sm text-muted-foreground">
          Te registrás como cliente. Si sos verdulería, contactanos.
        </p>
      </header>

      <RegisterForm />

      <p className="text-sm text-center text-muted-foreground">
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" className="text-foreground hover:underline">
          Ingresá
        </Link>
      </p>
    </div>
  );
}
