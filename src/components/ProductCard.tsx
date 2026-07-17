import { Product } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
      <div className="relative aspect-square bg-muted/10 w-full overflow-hidden flex items-center justify-center p-2">
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

      <CardHeader className="p-2 pb-1">
        <div className="flex justify-between items-start gap-1">
          <div className="w-full">
            <p className="text-[9px] md:text-[10px] text-muted-foreground uppercase tracking-wider truncate">{product.brandHe || product.brand}</p>
            <CardTitle className="text-xs md:text-sm font-semibold leading-tight mt-0.5 line-clamp-2" title={product.nameHe || product.name}>
              {product.nameHe || product.name}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-2 pt-0 flex-1 flex flex-col justify-end">
        <p className="text-[10px] text-muted-foreground mb-1 font-mono truncate">{product.barcode || product.modelHe || product.model}</p>
        <div className="flex items-end justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground mb-0.5">מחיר</span>
            <span className="text-sm md:text-base font-bold font-mono tracking-tight text-foreground">
              ₪{Number(product.price).toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-2 pt-0 flex gap-1">
        <Input 
          type="number" 
          min={1} 
          defaultValue={1}
          className="w-12 h-8 px-1 text-center text-xs"
          id={`qty-${product.id}`}
        />
        <Button 
          className="flex-1 h-8 rounded-md font-medium text-xs px-2" 
          variant={isOutOfStock ? "secondary" : "default"}
          disabled={isOutOfStock}
          onClick={() => {
            const qtyInput = document.getElementById(`qty-${product.id}`) as HTMLInputElement;
            const qty = parseInt(qtyInput?.value || "1", 10);
            addItem(product, qty);
          }}
        >
          {isOutOfStock ? 'אזל' : 'הוסף'}
          <ShoppingCart className="md:mr-1 h-3 w-3 hidden md:inline-block" />
        </Button>
      </CardFooter>
    </Card>
  );
}
