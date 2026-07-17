import { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import { useCartStore } from "@/store/cart";

interface ProductListItemProps {
  product: Product;
}

export function ProductListItem({ product }: ProductListItemProps) {
  const isOutOfStock = product.stockQuantity <= 0;
  const addItem = useCartStore(state => state.addItem);
  
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 bg-card/50 backdrop-blur-sm border border-border hover:border-white/20 transition-all duration-300 shadow-sm rounded-xl p-3 w-full group">
      {/* Image Area */}
      <div className="relative h-20 w-20 sm:h-24 sm:w-24 bg-white rounded-lg overflow-hidden flex items-center justify-center shrink-0 border border-border/50">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.nameHe || product.name}
            fill
            className="object-contain transition-transform duration-500 group-hover:scale-105 p-1"
          />
        ) : (
          <div className="text-muted-foreground/50 text-xs font-mono opacity-20">N/A</div>
        )}
      </div>

      {/* Details Area */}
      <div className="flex-1 flex flex-col justify-center min-w-0 w-full">
        <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider truncate mb-1">
          {product.brandHe || product.brand}
        </p>
        <h3 className="text-sm md:text-base font-semibold leading-tight mb-2 truncate" title={product.nameHe || product.name}>
          {product.nameHe || product.name}
        </h3>
        
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-1.5">
          {product.isOfficialImporter && <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px] px-2 h-5 shadow-none">יבואן רשמי</Badge>}
          {product.isOnSale && <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20 text-[10px] px-2 h-5 shadow-none">מבצע</Badge>}
          {product.isBackToStock && <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 border-purple-500/20 text-[10px] px-2 h-5 shadow-none">חזר למלאי</Badge>}
          {isOutOfStock ? (
            <Badge variant="destructive" className="shadow-none text-[10px] px-2 h-5">חסר במלאי</Badge>
          ) : product.stockQuantity < 10 ? (
            <Badge variant="secondary" className="bg-orange-500/10 text-orange-600 border-orange-500/20 text-[10px] px-2 h-5 shadow-none">מלאי נמוך</Badge>
          ) : null}
          
          {product.testerRatio && (
            <div className="text-[10px] text-pink-600 bg-pink-500/10 rounded-full px-2 py-0.5 font-medium flex items-center gap-1 border border-pink-500/20">
              <span>🎁</span> 1 טסטר ל-{product.testerRatio}
            </div>
          )}
        </div>
      </div>

      {/* Price and Action Area */}
      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 sm:gap-2 border-t sm:border-t-0 sm:border-r border-border/50 pt-3 sm:pt-0 sm:pr-4">
        <div className="flex flex-col sm:items-end">
          <span className="text-[10px] text-muted-foreground mb-0.5">מחיר יחידה</span>
          <div className="flex items-center gap-1.5">
            {product.priceDropPrice ? (
              <>
                <span className="text-sm md:text-lg font-bold font-mono tracking-tight text-red-500">
                  ₪{Number(product.priceDropPrice).toFixed(2)}
                </span>
                <span className="text-[10px] md:text-xs font-mono tracking-tight text-muted-foreground line-through">
                  ₪{Number(product.price).toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-sm md:text-lg font-bold font-mono tracking-tight text-foreground">
                ₪{Number(product.price).toFixed(2)}
              </span>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground mt-1 font-medium">במלאי: {product.stockQuantity} יח'</p>
        </div>
        
        <div className="flex gap-2 w-[140px]">
          <Input 
            type="number" 
            min={1} 
            defaultValue={1}
            className="w-16 h-9 px-2 text-center text-sm"
            id={`qty-list-${product.id}`}
          />
          <Button 
            className="flex-1 h-9 rounded-md font-medium text-sm px-2" 
            variant={isOutOfStock ? "secondary" : "default"}
            disabled={isOutOfStock}
            onClick={() => {
              const qtyInput = document.getElementById(`qty-list-${product.id}`) as HTMLInputElement;
              const qty = parseInt(qtyInput?.value || "1", 10);
              addItem(product, qty);
            }}
          >
            {isOutOfStock ? 'אזל' : 'הוסף'}
            <ShoppingCart className="mr-1.5 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
