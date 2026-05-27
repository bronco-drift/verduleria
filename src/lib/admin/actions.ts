"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { nextStatuses } from "./order-flow";
import { DEMO_USER_ID, DEMO_STORE_SLUG } from "@/lib/demo";
import type { OrderStatus, ProductUnit } from "@/db/schema";

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string };

async function getActiveStore() {
  const supabase = createSupabaseAdminClient();
  const { data: store } = await supabase
    .from("stores")
    .select("id, slug")
    .eq("slug", DEMO_STORE_SLUG)
    .single();
  if (!store) throw new Error("Demo store not found");
  return store;
}

// ============================================================================
// ORDERS
// ============================================================================

export async function updateOrderStatusAction({
  orderId,
  newStatus,
}: {
  orderId: string;
  newStatus: OrderStatus;
}): Promise<ActionResult> {
  const supabase = createSupabaseAdminClient();
  const store = await getActiveStore();

  const { data: order } = await supabase
    .from("orders")
    .select("status, store_id")
    .eq("id", orderId)
    .single();
  if (!order) return { ok: false, error: "Pedido no encontrado" };
  if (order.store_id !== store.id) {
    return { ok: false, error: "Pedido de otra verdulería" };
  }

  const allowed = nextStatuses(order.status as OrderStatus);
  if (!allowed.includes(newStatus)) {
    return {
      ok: false,
      error: `No se puede pasar de ${order.status} a ${newStatus}`,
    };
  }

  const { error } = await supabase
    .from("orders")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", orderId);
  if (error) return { ok: false, error: error.message };

  await supabase.from("order_status_history").insert({
    order_id: orderId,
    status: newStatus,
    changed_by: DEMO_USER_ID,
  });

  if (newStatus === "in_delivery") {
    await supabase
      .from("deliveries")
      .update({
        status: "picked_up",
        picked_up_at: new Date().toISOString(),
      })
      .eq("order_id", orderId);
  } else if (newStatus === "delivered") {
    await supabase
      .from("deliveries")
      .update({
        status: "delivered",
        delivered_at: new Date().toISOString(),
      })
      .eq("order_id", orderId);
  }

  revalidatePath("/verduleria", "layout");
  revalidatePath("/tienda", "layout");
  return { ok: true };
}

export async function assignDriverAction({
  orderId,
  driverId,
}: {
  orderId: string;
  driverId: string;
}): Promise<ActionResult> {
  const supabase = createSupabaseAdminClient();
  const store = await getActiveStore();

  const { data: order } = await supabase
    .from("orders")
    .select("store_id")
    .eq("id", orderId)
    .single();
  if (!order || order.store_id !== store.id) {
    return { ok: false, error: "Pedido de otra verdulería" };
  }

  const { data: member } = await supabase
    .from("store_members")
    .select("user_id")
    .eq("store_id", store.id)
    .eq("user_id", driverId)
    .eq("role", "driver")
    .maybeSingle();
  if (!member)
    return { ok: false, error: "Repartidor no encontrado en tu verdulería" };

  const { error } = await supabase
    .from("deliveries")
    .update({
      driver_id: driverId,
      status: "assigned",
      assigned_at: new Date().toISOString(),
    })
    .eq("order_id", orderId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/verduleria", "layout");
  return { ok: true };
}

// ============================================================================
// PRODUCTS
// ============================================================================

const productSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  description: z.string().optional(),
  price: z.coerce.number().positive("Precio debe ser positivo"),
  unit: z.enum([
    "kg",
    "g",
    "unidad",
    "atado",
    "bandeja",
    "paquete",
    "docena",
    "litro",
    "ml",
  ]),
  unit_amount: z.string().optional(),
  category_id: z.string().uuid().nullable().optional(),
  is_featured: z.coerce.boolean().optional(),
});

export async function createProductAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const supabase = createSupabaseAdminClient();
  const store = await getActiveStore();

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    price: formData.get("price"),
    unit: formData.get("unit"),
    unit_amount: formData.get("unit_amount") || undefined,
    category_id: formData.get("category_id") || null,
    is_featured: formData.get("is_featured") === "on",
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const { error } = await supabase.from("products").insert({
    store_id: store.id,
    name: parsed.data.name,
    description: parsed.data.description ?? null,
    price: parsed.data.price.toFixed(2),
    unit: parsed.data.unit as ProductUnit,
    unit_amount: parsed.data.unit_amount ?? null,
    category_id: parsed.data.category_id ?? null,
    is_featured: parsed.data.is_featured ?? false,
    is_active: true,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/verduleria/productos");
  revalidatePath("/tienda");
  return { ok: true };
}

export async function updateProductAction({
  id,
  patch,
}: {
  id: string;
  patch: Partial<{
    name: string;
    price: number;
    unit_amount: string | null;
    is_active: boolean;
    is_featured: boolean;
    stock: number | null;
  }>;
}): Promise<ActionResult> {
  const supabase = createSupabaseAdminClient();
  const store = await getActiveStore();

  const update: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (patch.name !== undefined) update.name = patch.name;
  if (patch.price !== undefined) update.price = patch.price.toFixed(2);
  if (patch.unit_amount !== undefined) update.unit_amount = patch.unit_amount;
  if (patch.is_active !== undefined) update.is_active = patch.is_active;
  if (patch.is_featured !== undefined) update.is_featured = patch.is_featured;
  if (patch.stock !== undefined) update.stock = patch.stock;

  const { error } = await supabase
    .from("products")
    .update(update)
    .eq("id", id)
    .eq("store_id", store.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/verduleria/productos");
  revalidatePath("/tienda");
  return { ok: true };
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  const supabase = createSupabaseAdminClient();
  const store = await getActiveStore();
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)
    .eq("store_id", store.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/verduleria/productos");
  revalidatePath("/tienda");
  return { ok: true };
}

// ============================================================================
// DRIVERS (store_members con role='driver')
// ============================================================================

const addDriverSchema = z.object({
  fullName: z.string().min(2, "Ingresá un nombre"),
  phone: z.string().optional(),
});

export async function addDriverAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const supabase = createSupabaseAdminClient();
  const store = await getActiveStore();

  const parsed = addDriverSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone") || undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  // Create a synthetic profile for the driver (no auth in this phase)
  const driverId = crypto.randomUUID();
  const { error: profErr } = await supabase.from("profiles").insert({
    id: driverId,
    full_name: parsed.data.fullName,
    phone: parsed.data.phone ?? null,
  });
  if (profErr) return { ok: false, error: profErr.message };

  const { error: memberErr } = await supabase.from("store_members").insert({
    store_id: store.id,
    user_id: driverId,
    role: "driver",
  });
  if (memberErr) {
    // Roll back the profile
    await supabase.from("profiles").delete().eq("id", driverId);
    return { ok: false, error: memberErr.message };
  }

  revalidatePath("/verduleria/repartidores");
  return { ok: true };
}

export async function removeDriverAction(userId: string): Promise<ActionResult> {
  const supabase = createSupabaseAdminClient();
  const store = await getActiveStore();
  const { error } = await supabase
    .from("store_members")
    .delete()
    .eq("store_id", store.id)
    .eq("user_id", userId)
    .eq("role", "driver");
  if (error) return { ok: false, error: error.message };
  // Also delete the synthetic profile
  await supabase.from("profiles").delete().eq("id", userId);
  revalidatePath("/verduleria/repartidores");
  return { ok: true };
}
