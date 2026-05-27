import type { OrderStatus } from "@/db/schema";

export const ORDER_FLOW: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["in_delivery", "cancelled"],
  in_delivery: ["delivered"],
  delivered: [],
  cancelled: [],
};

export function nextStatuses(status: OrderStatus): OrderStatus[] {
  return ORDER_FLOW[status] ?? [];
}
