"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

const registerSchema = loginSchema.extend({
  fullName: z.string().min(2, "Ingresá tu nombre"),
  phone: z.string().optional(),
});

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function signInAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { ok: false, error: error.message };
  }

  const redirectTo = (formData.get("redirectTo") as string) || "/";
  revalidatePath("/", "layout");
  redirect(redirectTo);
}

export async function signUpAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    fullName: formData.get("fullName"),
    phone: formData.get("phone") || undefined,
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
        phone: parsed.data.phone,
      },
    },
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
