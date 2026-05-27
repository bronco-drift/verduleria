"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUpAction, type ActionResult } from "@/lib/auth/actions";

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState<
    ActionResult | null,
    FormData
  >(signUpAction, null);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Nombre completo</Label>
        <Input
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          required
          minLength={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Teléfono (opcional)</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="+54 9 11 ..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
        />
      </div>

      {state && !state.ok && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Creando…" : "Crear cuenta"}
      </Button>
    </form>
  );
}
