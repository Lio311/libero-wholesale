import { Product } from "@/lib/types";
import { TableCell, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import Image from "next/image";
import { useCartStore } from "@/store/cart";
import { useState } from "react";

interface ProductTableRowProps {
  product: Product;
}

export function ProductTableRow({ product }: ProductTableRowProps) {
  const isOutOfStock = product.stockQuantity <= 0;
  const addItem = useCartStore(state => state.addItem);
  const [qty, setQty] = useState(1);
  
  const price = product.priceDropPrice ? Number(product.priceDropPrice) : Number(product.price);
  const total = (price * qty).toFixed(2);

  const handleAdd = () => {
    if (qty > 0) addItem(product, qty);
  }

  return (
    <TableRow className="hover:bg-muted/50 group">
      <TableCell className="p-2 w-[60px] text-center">
        <div className="relative h-12 w-12 bg-white rounded flex items-center justify-center overflow-hidden border border-border/50 mx-auto">
          {product.imageUrl ? (
            <Image src={product.imageUrl} alt={product.nameHe || product.name} fill className="object-contain p-0.5" />
          ) : (
            <div className="text-muted-foreground/50 text-[8px] font-mono opacity-20">N/A</div>
          )}
        </div>
      </TableCell>
      <TableCell className="font-mono text-xs text-muted-foreground w-[120px] text-center">{product.barcode || "-"}</TableCell>
      <TableCell className="max-w-[200px] xl:max-w-[300px] text-center">
        <div className="flex flex-col gap-1 items-center">
          <span className="font-semibold text-sm truncate w-full" title={product.nameHe || product.name}>
            {product.nameHe || product.name}
          </span>
          <div className="flex flex-wrap items-center justify-center gap-1">
            {product.isOfficialImporter && <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[9px] px-1 h-4 shadow-none">יבואן רשמי</Badge>}
            {product.isOnSale && <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20 text-[9px] px-1 h-4 shadow-none">מבצע</Badge>}
            {product.isBackToStock && <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 border-purple-500/20 text-[9px] px-1 h-4 shadow-none">חזר למלאי</Badge>}
            {product.testerRatio && (
              <span className="text-[9px] text-pink-600 bg-pink-500/10 rounded px-1 py-0.5 font-medium border border-pink-500/20 whitespace-nowrap">
                1 טסטר ל-{product.testerRatio}
              </span>
            )}
            {isOutOfStock ? (
              <Badge variant="destructive" className="shadow-none text-[9px] px-1 h-4">חסר במלאי</Badge>
            ) : product.stockQuantity < 10 ? (
              <Badge variant="secondary" className="bg-orange-500/10 text-orange-600 border-orange-500/20 text-[9px] px-1 h-4 shadow-none">מלאי נמוך</Badge>
            ) : null}
          </div>
        </div>
      </TableCell>
      <TableCell className="text-xs text-muted-foreground w-[120px] text-center">{product.brandHe || product.brand || "-"}</TableCell>
      <TableCell className="text-center font-medium w-[80px]">{product.stockQuantity}</TableCell>
      <TableCell className="text-center w-[100px]">
        <div className="flex flex-col items-center">
          {product.priceDropPrice ? (
            <>
              <span className="font-bold text-red-500">₪{Number(product.priceDropPrice).toFixed(2)}</span>
              <span className="text-[10px] text-muted-foreground line-through">₪{Number(product.price).toFixed(2)}</span>
            </>
          ) : (
            <span className="font-bold">₪{Number(product.price).toFixed(2)}</span>
          )}
        </div>
      </TableCell>
      <TableCell className="w-[120px] text-center">
        <div className="flex items-center justify-center gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={() => setQty(Math.max(1, qty - 1))} disabled={isOutOfStock}>
            <Minus className="h-3 w-3" />
          </Button>
          <Input 
            type="number" 
            min={1} 
            value={qty}
            onChange={(e) => setQty(parseInt(e.target.value) || 1)}
            className="w-14 h-8 px-1 text-center text-sm font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            disabled={isOutOfStock}
          />
          <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={() => setQty(qty + 1)} disabled={isOutOfStock}>
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </TableCell>
      <TableCell className="text-center font-bold text-primary w-[100px]">₪{total}</TableCell>
      <TableCell className="text-center w-[120px]">
        <Button size="sm" className="h-8 px-4 text-xs w-full max-w-[100px] mx-auto" disabled={isOutOfStock || qty < 1} onClick={handleAdd}>
          {isOutOfStock ? 'אזל' : 'הוסף'}
          <ShoppingCart className="mr-1.5 h-3 w-3" />
        </Button>
      </TableCell>
    </TableRow>
  )
}
