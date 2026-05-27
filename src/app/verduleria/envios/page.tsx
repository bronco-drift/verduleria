import { ZONAS_ENVIO } from "@/lib/data/zonas-envio";
import { ZonesPanel } from "./zones-panel";

export default function EnviosPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[15px] font-bold mb-1">Zonas y costos de envío</h2>
        <p className="text-xs text-muted-foreground">
          Configurá cada zona de entrega. El simulador muestra cuánto cobrar
          según el monto del pedido. (Cambios locales, no persistidos todavía).
        </p>
      </div>
      <ZonesPanel initial={ZONAS_ENVIO} />
    </div>
  );
}
