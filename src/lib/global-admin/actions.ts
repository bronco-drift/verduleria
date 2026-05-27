"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string };

const storeSchema = z.object({
  slug: z
    .string()
    .min(2, "Slug muy corto")
    .max(40, "Slug muy largo")
    .regex(
      /^[a-z0-9-]+$/,
      "Solo minúsculas, números y guiones (sin espacios ni acentos)"
    ),
  name: z.string().min(2, "Nombre requerido"),
  address: z.string().optional(),
  phone: z.string().optional(),
  delivery_fee: z.coerce.number().min(0).default(0),
});

export async function createStoreAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = storeSchema.safeParse({
    slug: formData.get("slug"),
    name: formData.get("name"),
    address: formData.get("address") || undefined,
    phone: formData.get("phone") || undefined,
    delivery_fee: formData.get("delivery_fee") || 0,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("stores").insert({
    slug: parsed.data.slug,
    name: parsed.data.name,
    address: parsed.data.address ?? null,
    phone: parsed.data.phone ?? null,
    delivery_fee: parsed.data.delivery_fee.toFixed(2),
    is_active: true,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin");
  revalidatePath("/", "layout");
  redirect("/admin");
}

export async function toggleStoreActiveAction({
  storeId,
  isActive,
}: {
  storeId: string;
  isActive: boolean;
}): Promise<ActionResult> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("stores")
    .update({ is_active: isActive })
    .eq("id", storeId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin");
  revalidatePath("/", "layout");
  return { ok: true };
}

const updateStoreSchema = z.object({
  storeId: z.string().uuid(),
  name: z.string().min(2, "Nombre requerido"),
  address: z.string().optional(),
  phone: z.string().optional(),
  delivery_fee: z.coerce.number().min(0),
});

export async function updateStoreAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = updateStoreSchema.safeParse({
    storeId: formData.get("storeId"),
    name: formData.get("name"),
    address: formData.get("address") || undefined,
    phone: formData.get("phone") || undefined,
    delivery_fee: formData.get("delivery_fee") || 0,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("stores")
    .update({
      name: parsed.data.name,
      address: parsed.data.address ?? null,
      phone: parsed.data.phone ?? null,
      delivery_fee: parsed.data.delivery_fee.toFixed(2),
    })
    .eq("id", parsed.data.storeId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}
