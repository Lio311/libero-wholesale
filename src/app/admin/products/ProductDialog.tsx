"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { createProduct, updateProduct } from "./actions";

interface ProductRow {
  id: string;
  name: string;
  brand: string | null;
  model: string | null;
  barcode: string | null;
  price: string | number;
  stockQuantity: number;
}

interface ProductDialogProps {
  product?: ProductRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductDialog({ product, open, onOpenChange }: ProductDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!product;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    let res;
    if (isEditing && product) {
      res = await updateProduct(product.id, formData);
    } else {
      res = await createProduct(formData);
    }

    setIsLoading(false);

    if (res?.error) {
      setError(res.error);
    } else {
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card border-border rounded-2xl shadow-xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "ערוך מוצר" : "הוסף מוצר חדש"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "ערוך את פרטי המוצר כאן. לחץ על שמור כשתסיים." : "הזן את פרטי המוצר החדש. לחץ על שמור כשתסיים."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right font-medium">שם מוצר</Label>
              <Input id="name" name="name" defaultValue={product?.name || ""} className="col-span-3 rounded-xl border-border bg-background" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="brand" className="text-right font-medium">מותג</Label>
              <Input id="brand" name="brand" defaultValue={product?.brand || ""} className="col-span-3 rounded-xl border-border bg-background" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="model" className="text-right font-medium">דגם/וריאציה</Label>
              <Input id="model" name="model" defaultValue={product?.model || ""} className="col-span-3 rounded-xl border-border bg-background" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="barcode" className="text-right font-medium">מק״ט/ברקוד</Label>
              <Input id="barcode" name="barcode" defaultValue={product?.barcode || ""} className="col-span-3 rounded-xl border-border bg-background" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right font-medium">מחיר סיטונאי</Label>
              <Input id="price" name="price" type="number" step="0.01" defaultValue={product?.price || ""} className="col-span-3 rounded-xl border-border bg-background" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stockQuantity" className="text-right font-medium">מלאי זמין</Label>
              <Input id="stockQuantity" name="stockQuantity" type="number" defaultValue={product?.stockQuantity || 0} className="col-span-3 rounded-xl border-border bg-background" required />
            </div>
          </div>
          {error && <p className="text-sm text-destructive font-medium mb-4">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={isLoading} className="rounded-full w-full sm:w-auto font-semibold shadow-sm">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "שמור שינויים" : "הוסף מוצר"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
