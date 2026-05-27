"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminContext } from "./auth";
import { nextStatuses } from "./order-flow";
import type { OrderStatus, ProductUnit } from "@/db/schema";

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string };

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
  const ctx = await requireAdminContext();

  // Fetch order, verify it belongs to admin's store
  const { data: order } = await ctx.admin
    .from("orders")
    .select("status, store_id")
    .eq("id", orderId)
    .single();

  if (!order) return { ok: false, error: "Pedido no encontrado" };
  if (order.store_id !== ctx.store.id) {
    return { ok: false, error: "Sin permisos sobre este pedido" };
  }

  const allowed = nextStatuses(order.status as OrderStatus);
  if (!allowed.includes(newStatus)) {
    return { ok: false, error: `No se puede pasar de ${order.status} a ${newStatus}` };
  }

  const { error } = await ctx.admin
    .from("orders")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  if (error) return { ok: false, error: error.message };

  await ctx.admin.from("order_status_history").insert({
    order_id: orderId,
    status: newStatus,
    changed_by: ctx.user.id,
  });

  // Side effects on delivery
  if (newStatus === "in_delivery") {
    await ctx.admin
      .from("deliveries")
      .update({
        status: "picked_up",
        picked_up_at: new Date().toISOString(),
      })
      .eq("order_id", orderId);
  } else if (newStatus === "delivered") {
    await ctx.admin
      .from("deliveries")
      .update({
        status: "delivered",
        delivered_at: new Date().toISOString(),
      })
      .eq("order_id", orderId);
  }

  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function assignDriverAction({
  orderId,
  driverId,
}: {
  orderId: string;
  driverId: string;
}): Promise<ActionResult> {
  const ctx = await requireAdminContext();

  // Verify order belongs to store
  const { data: order } = await ctx.admin
    .from("orders")
    .select("store_id")
    .eq("id", orderId)
    .single();
  if (!order || order.store_id !== ctx.store.id) {
    return { ok: false, error: "Sin permisos" };
  }

  // Verify driver is a member of this store
  const { data: member } = await ctx.admin
    .from("store_members")
    .select("user_id")
    .eq("store_id", ctx.store.id)
    .eq("user_id", driverId)
    .eq("role", "driver")
    .maybeSingle();
  if (!member) return { ok: false, error: "Repartidor no encontrado en tu store" };

  const { error } = await ctx.admin
    .from("deliveries")
    .update({
      driver_id: driverId,
      status: "assigned",
      assigned_at: new Date().toISOString(),
    })
    .eq("order_id", orderId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin", "layout");
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
  const ctx = await requireAdminContext();

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

  const { error } = await ctx.admin.from("products").insert({
    store_id: ctx.store.id,
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

  revalidatePath("/admin/productos");
  revalidatePath(`/${ctx.store.slug}`);
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
  const ctx = await requireAdminContext();

  const update: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (patch.name !== undefined) update.name = patch.name;
  if (patch.price !== undefined) update.price = patch.price.toFixed(2);
  if (patch.unit_amount !== undefined) update.unit_amount = patch.unit_amount;
  if (patch.is_active !== undefined) update.is_active = patch.is_active;
  if (patch.is_featured !== undefined) update.is_featured = patch.is_featured;
  if (patch.stock !== undefined) update.stock = patch.stock;

  const { error } = await ctx.admin
    .from("products")
    .update(update)
    .eq("id", id)
    .eq("store_id", ctx.store.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/productos");
  revalidatePath(`/${ctx.store.slug}`);
  return { ok: true };
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  const ctx = await requireAdminContext();
  const { error } = await ctx.admin
    .from("products")
    .delete()
    .eq("id", id)
    .eq("store_id", ctx.store.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/productos");
  revalidatePath(`/${ctx.store.slug}`);
  return { ok: true };
}

// ============================================================================
// DRIVERS (store members con role='driver')
// ============================================================================

const addDriverSchema = z.object({
  email: z.string().email("Email inválido"),
});

export async function addDriverAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const ctx = await requireAdminContext();

  const parsed = addDriverSchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  // Find user by email
  const { data: usersData, error: usersErr } =
    await ctx.admin.auth.admin.listUsers();
  if (usersErr) return { ok: false, error: usersErr.message };

  const target = usersData.users.find((u) => u.email === parsed.data.email);
  if (!target) {
    return {
      ok: false,
      error: "No existe un usuario con ese email. Que se registre primero.",
    };
  }

  // Upsert membership
  const { error: memberErr } = await ctx.admin.from("store_members").upsert(
    {
      store_id: ctx.store.id,
      user_id: target.id,
      role: "driver",
    },
    { onConflict: "store_id,user_id" }
  );

  if (memberErr) return { ok: false, error: memberErr.message };

  revalidatePath("/admin/repartidores");
  return { ok: true };
}

export async function removeDriverAction(
  userId: string
): Promise<ActionResult> {
  const ctx = await requireAdminContext();
  const { error } = await ctx.admin
    .from("store_members")
    .delete()
    .eq("store_id", ctx.store.id)
    .eq("user_id", userId)
    .eq("role", "driver");
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/repartidores");
  return { ok: true };
}
