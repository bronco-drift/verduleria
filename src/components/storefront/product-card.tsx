import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddToCartButton } from "./add-to-cart-button";

type Product = {
  id: string;
  name: string;
  price: string;
  unit_amount: string | null;
  is_featured: boolean;
};

export function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="p-4 flex flex-col h-full gap-3">
      <div className="flex-1 min-h-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-sm leading-tight">{product.name}</h3>
          {product.is_featured && (
            <Badge variant="secondary" className="shrink-0 text-[10px]">
              Destacado
            </Badge>
          )}
        </div>
        {product.unit_amount && (
          <p className="text-xs text-muted-foreground mt-1">
            {product.unit_amount}
          </p>
        )}
      </div>
      <p className="text-lg font-semibold">
        ${Number(product.price).toLocaleString("es-AR")}
      </p>
      <AddToCartButton productId={product.id} />
    </Card>
  );
}
