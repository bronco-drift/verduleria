"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addDriverAction, type ActionResult } from "@/lib/admin/actions";

export function AddDriverForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState<
    ActionResult | null,
    FormData
  >(addDriverAction, null);

  useEffect(() => {
    if (state?.ok) {
      toast.success("Repartidor agregado");
      formRef.current?.reset();
      router.refresh();
    }
  }, [state, router]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>

      {state && !state.ok && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Agregando…" : "Agregar"}
      </Button>
    </form>
  );
}
