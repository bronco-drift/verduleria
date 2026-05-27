"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  updateOrderStatusAction,
  assignDriverAction,
} from "@/lib/admin/actions";
import type { OrderStatus } from "@/db/schema";

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pendiente",
  confirmed: "Confirmar",
  preparing: "En preparación",
  ready: "Marcar listo",
  in_delivery: "Salió a entregar",
  delivered: "Entregado",
  cancelled: "Cancelar",
};

export function OrderActions({
  orderId,
  currentStatus,
  nextOptions,
  drivers,
  currentDriverId,
  currentDriverName,
}: {
  orderId: string;
  currentStatus: OrderStatus;
  nextOptions: OrderStatus[];
  drivers: { id: string; name: string; phone: string | null }[];
  currentDriverId: string | null;
  currentDriverName: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedDriver, setSelectedDriver] = useState<string>(
    currentDriverId ?? ""
  );

  const handleStatusChange = (newStatus: OrderStatus) => {
    startTransition(async () => {
      const result = await updateOrderStatusAction({ orderId, newStatus });
      if (result.ok) {
        toast.success(`Pedido pasó a ${STATUS_LABELS[newStatus]}`);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleAssign = () => {
    if (!selectedDriver) return;
    startTransition(async () => {
      const result = await assignDriverAction({
        orderId,
        driverId: selectedDriver,
      });
      if (result.ok) {
        toast.success("Repartidor asignado");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <h4 className="font-semibold mb-2">Estado del pedido</h4>
        <p className="text-xs text-muted-foreground mb-3">
          Actual: <strong>{STATUS_LABELS[currentStatus]}</strong>
        </p>
        {nextOptions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Sin transiciones disponibles.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {nextOptions.map((s) => (
              <Button
                key={s}
                variant={s === "cancelled" ? "outline" : "default"}
                size="sm"
                disabled={isPending}
                onClick={() => handleStatusChange(s)}
                className={s === "cancelled" ? "text-red-600" : ""}
              >
                {STATUS_LABELS[s]}
              </Button>
            ))}
          </div>
        )}
      </div>

      <div className="pt-4 border-t space-y-2">
        <h4 className="font-semibold">Repartidor</h4>
        {currentDriverName && (
          <p className="text-xs text-muted-foreground">
            Actual: <strong>{currentDriverName}</strong>
          </p>
        )}
        {drivers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay repartidores cargados.
          </p>
        ) : (
          <>
            <Select
              value={selectedDriver}
              onValueChange={(v) => setSelectedDriver(v ?? "")}
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Elegir repartidor" />
              </SelectTrigger>
              <SelectContent>
                {drivers.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name} {d.phone ? `· ${d.phone}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              disabled={isPending || !selectedDriver}
              onClick={handleAssign}
              className="w-full"
            >
              {currentDriverId ? "Reasignar" : "Asignar"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
