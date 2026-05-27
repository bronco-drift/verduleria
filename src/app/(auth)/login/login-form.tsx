"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInAction, type ActionResult } from "@/lib/auth/actions";

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [state, formAction, isPending] = useActionState<
    ActionResult | null,
    FormData
  >(signInAction, null);

  return (
    <form action={formAction} className="space-y-4">
      {redirectTo && (
        <input type="hidden" name="redirectTo" value={redirectTo} />
      )}

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
          autoComplete="current-password"
          required
          minLength={6}
        />
      </div>

      {state && !state.ok && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Ingresando…" : "Ingresar"}
      </Button>
    </form>
  );
}
