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
  brandLogo?: string | null;
  onImageClick?: (url: string) => void;
}

export function ProductTableRow({ product, brandLogo, onImageClick }: ProductTableRowProps) {
  const isOutOfStock = product.stockQuantity <= 0;
  const addItem = useCartStore(state => state.addItem);
  const [qty, setQty] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const price = product.priceDropPrice ? Number(product.priceDropPrice) : Number(product.price);
  const total = (price * qty).toFixed(2);

  const handleAdd = () => {
    if (qty > 0) addItem(product, qty);
  }

  const toggleExpand = () => {
    if (window.innerWidth < 768) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <>
    <TableRow className="hover:bg-muted/50 group cursor-pointer md:cursor-default" onClick={toggleExpand}>
      <TableCell className="p-1 md:p-2 text-center w-[60px] md:w-[80px]">
        <div 
          className={`relative h-12 w-12 md:h-16 md:w-16 bg-white rounded-lg flex items-center justify-center overflow-hidden border border-border/50 mx-auto transition-transform hover:scale-105 ${onImageClick && product.imageUrl ? "cursor-pointer" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            if (onImageClick && product.imageUrl) onImageClick(product.imageUrl);
          }}
        >
          {product.imageUrl ? (
            <Image src={product.imageUrl} alt={product.name} fill className="object-contain p-1" />
          ) : (
            <div className="text-muted-foreground/50 text-[8px] font-mono opacity-20">N/A</div>
          )}
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell font-mono text-xs text-muted-foreground w-[120px] text-center">{product.barcode || "-"}</TableCell>
      <TableCell className="max-w-[150px] md:max-w-[200px] xl:max-w-[300px] text-center px-1 md:px-4">
        <div className="flex flex-col truncate pr-2 w-full max-w-[150px] sm:max-w-[200px] md:max-w-none">
          <span className="text-[10px] text-muted-foreground truncate w-full text-center" title={product.brandHe || product.brand || ""}>
            {product.brandHe || product.brand || "לא צוין מותג"}
          </span>
          <span className="font-semibold text-[11px] md:text-sm truncate w-full" title={product.nameHe || product.name}>
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
      <TableCell className="text-center font-mono text-xs w-[60px] md:w-[80px]">{product.size || "-"}</TableCell>
      <TableCell className="hidden md:table-cell px-1 md:px-4 text-center">
        {brandLogo ? (
          <div className="h-12 w-24 mx-auto relative flex items-center justify-center">
            <img src={brandLogo} alt={product.brand || "Brand"} className="max-h-full max-w-full object-contain" />
          </div>
        ) : (
          <span className="text-sm truncate max-w-[120px] inline-block">{product.brandHe || product.brand || '-'}</span>
        )}
      </TableCell>
      <TableCell className="text-center font-medium w-[60px] md:w-[80px] text-xs md:text-sm">{product.stockQuantity}</TableCell>
      <TableCell className="text-center w-[80px] md:w-[100px]">
        <div className="flex flex-col items-center">
          {product.priceDropPrice ? (
            <>
              <span className="font-bold text-red-500 text-xs md:text-base">₪{Number(product.priceDropPrice).toFixed(2)}</span>
              <span className="text-[9px] md:text-[10px] text-muted-foreground line-through">₪{Number(product.price).toFixed(2)}</span>
            </>
          ) : (
            <span className="font-bold text-xs md:text-base">₪{Number(product.price).toFixed(2)}</span>
          )}
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell w-[120px] text-center">
        <div className="flex items-center justify-center gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={(e) => { e.stopPropagation(); setQty(Math.max(1, qty - 1)); }} disabled={isOutOfStock}>
            <Minus className="h-3 w-3" />
          </Button>
          <Input 
            type="number" 
            min={1} 
            value={qty}
            onChange={(e) => setQty(parseInt(e.target.value) || 1)}
            onClick={(e) => e.stopPropagation()}
            className="w-14 h-8 px-1 text-center text-sm font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            disabled={isOutOfStock}
          />
          <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={(e) => { e.stopPropagation(); setQty(qty + 1); }} disabled={isOutOfStock}>
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell text-center font-bold text-primary w-[100px]">₪{total}</TableCell>
      <TableCell className="hidden md:table-cell text-center w-[120px]">
        <Button size="sm" className="h-8 px-4 text-xs w-full max-w-[100px] mx-auto" disabled={isOutOfStock || qty < 1} onClick={(e) => { e.stopPropagation(); handleAdd(); }}>
          {isOutOfStock ? 'אזל' : 'הוסף'}
          <ShoppingCart className="mr-1.5 h-3 w-3" />
        </Button>
      </TableCell>
    </TableRow>
    
    {isExpanded && (
      <TableRow className="md:hidden bg-muted/20 border-b border-border">
        <TableCell colSpan={5} className="p-0">
          <div className="flex flex-col divide-y divide-border/50 text-sm">
            <div className="flex justify-between py-2 px-4">
              <span className="font-semibold">מותג</span>
              <span className="text-muted-foreground">{product.brandHe || product.brand || "-"}</span>
            </div>
            <div className="flex justify-between py-2 px-4">
              <span className="font-semibold">ברקוד</span>
              <span className="text-muted-foreground font-mono text-xs">{product.barcode || "-"}</span>
            </div>
            <div className="flex justify-between items-center py-2 px-4">
              <span className="font-semibold">כמות</span>
              <div className="flex items-center gap-1 bg-background rounded-md border border-border p-0.5">
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-sm shrink-0" onClick={(e) => { e.stopPropagation(); setQty(Math.max(1, qty - 1)); }} disabled={isOutOfStock}>
                  <Minus className="h-3 w-3" />
                </Button>
                <Input 
                  type="number" 
                  min={1} 
                  value={qty}
                  onChange={(e) => setQty(parseInt(e.target.value) || 1)}
                  className="w-10 h-7 border-0 px-1 text-center text-xs font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  disabled={isOutOfStock}
                />
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-sm shrink-0" onClick={(e) => { e.stopPropagation(); setQty(qty + 1); }} disabled={isOutOfStock}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="flex justify-between py-2 px-4 items-center">
              <span className="font-semibold">סה"כ</span>
              <span className="font-bold text-primary">₪{total}</span>
            </div>
            <div className="p-4 bg-background/50">
              <Button className="w-full font-semibold rounded-xl h-12 shadow-sm" disabled={isOutOfStock || qty < 1} onClick={(e) => { e.stopPropagation(); handleAdd(); }}>
                {isOutOfStock ? 'אזל במלאי' : 'הוסף לעגלה'}
                <ShoppingCart className="mr-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </TableCell>
      </TableRow>
    )}
    </>
  )
}
