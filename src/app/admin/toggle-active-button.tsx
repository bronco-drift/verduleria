"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { toggleStoreActiveAction } from "@/lib/global-admin/actions";

export function ToggleActiveButton({
  storeId,
  isActive,
}: {
  storeId: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const toggle = () => {
    startTransition(async () => {
      const result = await toggleStoreActiveAction({
        storeId,
        isActive: !isActive,
      });
      if (result.ok) {
        toast.success(isActive ? "Pausada" : "Activada");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isPending}
      onClick={toggle}
    >
      {isActive ? "Pausar" : "Activar"}
    </Button>
  );
}
