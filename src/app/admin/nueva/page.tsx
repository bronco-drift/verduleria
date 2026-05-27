import { Card } from "@/components/ui/card";
import { StoreForm } from "./store-form";

export default function NewStorePage() {
  return (
    <div className="max-w-xl">
      <Card className="p-6 space-y-4">
        <header>
          <h3 className="font-semibold">Crear nueva verdulería</h3>
          <p className="text-sm text-muted-foreground">
            Una vez creada, va a aparecer en la lista y se va a poder gestionar
            desde "Mi verdulería" (próximamente con selector).
          </p>
        </header>
        <StoreForm />
      </Card>
    </div>
  );
}
