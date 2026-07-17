import { Product } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import { useCartStore } from "@/store/cart";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const isOutOfStock = product.stockQuantity <= 0;
  const addItem = useCartStore(state => state.addItem);
  
  return (
    <Card className="flex flex-col h-full bg-card/50 backdrop-blur-sm border-border hover:border-white/20 transition-all duration-300 shadow-xl overflow-hidden group">
      {/* Image Area */}
      <div className="relative aspect-square bg-muted/30 w-full overflow-hidden flex items-center justify-center p-4">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.nameHe || product.name}
            fill
            className="object-contain transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="text-muted-foreground/50 text-4xl font-mono opacity-20">N/A</div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isOutOfStock ? (
            <Badge variant="destructive" className="shadow-lg">חסר במלאי</Badge>
          ) : product.stockQuantity < 10 ? (
            <Badge variant="secondary" className="bg-orange-500/20 text-orange-400 border-orange-500/50">מלאי נמוך</Badge>
          ) : null}
        </div>
      </div>

      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start gap-2">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{product.brandHe || product.brand}</p>
            <CardTitle className="text-base font-semibold leading-tight mt-1 line-clamp-2">
              {product.nameHe || product.name}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 flex-1 flex flex-col justify-end">
        <p className="text-xs text-muted-foreground mb-3 font-mono">{product.barcode || product.modelHe || product.model}</p>
        <div className="flex items-end justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground mb-1">מחיר סיטונאי</span>
            <span className="text-2xl font-bold font-mono tracking-tight text-white/90">
              ₪{Number(product.price).toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full font-medium" 
          variant={isOutOfStock ? "secondary" : "default"}
          disabled={isOutOfStock}
          onClick={() => addItem(product)}
        >
          <ShoppingCart className="ml-2 h-4 w-4" />
          {isOutOfStock ? 'אזל המלאי' : 'הוסף לעגלה'}
        </Button>
      </CardFooter>
    </Card>
  );
}
