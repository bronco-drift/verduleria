"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { removeDriverAction } from "@/lib/admin/actions";

export function DriverRow({
  userId,
  name,
  phone,
}: {
  userId: string;
  name: string;
  phone: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const remove = () => {
    if (!confirm(`¿Quitar a "${name}" como repartidor?`)) return;
    startTransition(async () => {
      const result = await removeDriverAction(userId);
      if (result.ok) toast.success("Repartidor removido");
      else toast.error(result.error);
      router.refresh();
    });
  };

  return (
    <div className="p-3 flex items-center gap-3 text-sm">
      <div className="flex-1 min-w-0">
        <p className="font-medium">{name}</p>
        {phone && <p className="text-xs text-muted-foreground">{phone}</p>}
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="text-red-600"
        disabled={isPending}
        onClick={remove}
      >
        Quitar
      </Button>
    </div>
  );
}
