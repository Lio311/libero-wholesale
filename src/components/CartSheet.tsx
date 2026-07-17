"use client";

import { useCartStore } from "@/store/cart";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { Separator } from "./ui/separator";

export function CartSheet() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, getTotalPrice, getTotalItems } = useCartStore();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0 border-l border-white/10 bg-background/95 backdrop-blur-xl">
        <SheetHeader className="p-6 pb-4 border-b border-white/5">
          <SheetTitle className="flex items-center gap-2 text-2xl font-bold">
            <ShoppingBag className="h-6 w-6" />
            עגלת הזמנות
            <span className="text-sm font-normal text-muted-foreground bg-white/10 px-2 py-0.5 rounded-full ml-auto">
              {getTotalItems()} פריטים
            </span>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-70 gap-4">
              <ShoppingBag className="h-16 w-16" />
              <p className="text-lg">העגלה שלך ריקה</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.product.id} className="flex gap-4 items-start group">
                <div className="relative h-20 w-20 rounded-md bg-muted/30 border border-white/5 overflow-hidden flex-shrink-0">
                  {item.product.imageUrl ? (
                    <Image
                      src={item.product.imageUrl}
                      alt={item.product.nameHe || item.product.name}
                      fill
                      className="object-contain p-2"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-xs text-muted-foreground">N/A</div>
                  )}
                </div>
                
                <div className="flex flex-col flex-1 gap-1">
                  <h4 className="text-sm font-semibold line-clamp-2 leading-tight">
                    {item.product.nameHe || item.product.name}
                  </h4>
                  <p className="text-xs text-muted-foreground font-mono">
                    {item.product.barcode || item.product.modelHe || item.product.model}
                  </p>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center bg-black/40 border border-white/10 rounded-md">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-none"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        disabled={item.quantity <= (item.product.minOrderQty || 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm w-8 text-center font-mono">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-none"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="text-sm font-bold font-mono">
                      ₪{(Number(item.product.price) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeItem(item.product.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <SheetFooter className="p-6 border-t border-white/5 bg-card/30 flex-col gap-4 sm:flex-col">
            <div className="flex justify-between items-center w-full">
              <span className="text-muted-foreground">סה״כ לתשלום</span>
              <span className="text-2xl font-bold font-mono tracking-tight">₪{getTotalPrice().toFixed(2)}</span>
            </div>
            <Separator className="bg-white/5" />
            <Button size="lg" className="w-full text-lg font-semibold h-12 shadow-lg shadow-primary/20">
              המשך לקופה
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
