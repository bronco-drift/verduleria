import { Badge } from "@/components/ui/badge";

const LABELS: Record<string, { text: string; className: string }> = {
  pending: { text: "Pendiente", className: "bg-gray-100 text-gray-800" },
  confirmed: { text: "Confirmado", className: "bg-blue-100 text-blue-800" },
  preparing: { text: "Preparando", className: "bg-amber-100 text-amber-800" },
  ready: { text: "Listo", className: "bg-indigo-100 text-indigo-800" },
  in_delivery: {
    text: "En camino",
    className: "bg-purple-100 text-purple-800",
  },
  delivered: { text: "Entregado", className: "bg-green-100 text-green-800" },
  cancelled: { text: "Cancelado", className: "bg-red-100 text-red-800" },
};

export function OrderStatusBadge({ status }: { status: string }) {
  const config = LABELS[status] ?? { text: status, className: "" };
  return (
    <Badge variant="secondary" className={config.className}>
      {config.text}
    </Badge>
  );
}
