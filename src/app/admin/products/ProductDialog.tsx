"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { createProduct, updateProduct } from "./actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductRow {
  id: string;
  name: string;
  brand: string | null;
  model: string | null;
  barcode: string | null;
  price: string | number;
  stockQuantity: number;
  imageUrl: string | null;
  nameHe?: string | null;
  brandHe?: string | null;
  modelHe?: string | null;
  isBackToStock?: boolean;
  isOnSale?: boolean;
  isOfficialImporter?: boolean;
  priceDropPrice?: string | null;
  testerRatio?: number | null;
  size?: string | null;
  isDraft?: boolean;
}

interface ProductDialogProps {
  product?: ProductRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brands?: any[];
}

export function ProductDialog({ product, open, onOpenChange, brands = [] }: ProductDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [isOnSale, setIsOnSale] = useState(product?.isOnSale || false);
  const [selectedBrand, setSelectedBrand] = useState<string>(product?.brand || "no_brand");

  useEffect(() => {
    setIsOnSale(product?.isOnSale || false);
    setSelectedBrand(product?.brand || "no_brand");
  }, [product, open]);

  const isEditing = !!product;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBase64Image(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setBase64Image(null);
    }
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    if (base64Image) {
      formData.set("imageUrl", base64Image);
    } else if (product?.imageUrl) {
      formData.set("imageUrl", product.imageUrl);
    }

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
      setBase64Image(null);
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] bg-card border-border rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "ערוך מוצר" : "הוסף מוצר חדש"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "ערוך את פרטי המוצר כאן. לחץ על שמור כשתסיים." : "הזן את פרטי המוצר החדש. לחץ על שמור כשתסיים."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            
            {/* Right Column (General) */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-muted-foreground border-b pb-1">פרטים בסיסיים</h4>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right font-medium text-xs">שם (אנגלית)</Label>
                <Input id="name" name="name" defaultValue={product?.name || ""} className="col-span-3 rounded-xl border-border bg-background" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nameHe" className="text-right font-medium text-xs">שם (עברית)</Label>
                <Input id="nameHe" name="nameHe" defaultValue={product?.nameHe || ""} className="col-span-3 rounded-xl border-border bg-background" />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="brandSelect" className="text-right font-medium text-xs mt-3">מותג</Label>
                <div className="col-span-3 space-y-2">
                  <Select value={selectedBrand} onValueChange={(val) => setSelectedBrand(val || "no_brand")}>
                    <SelectTrigger className="w-full rounded-xl border-border bg-background" dir="rtl">
                      <SelectValue placeholder="בחר מותג...">
                        {selectedBrand === "no_brand" ? "בחר מותג" : selectedBrand === "new_brand" ? "מותג חדש" : (brands.find(b => b.name === selectedBrand)?.nameHe ? `${brands.find(b => b.name === selectedBrand)?.nameHe} (${selectedBrand})` : selectedBrand)}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no_brand">בחר מותג</SelectItem>
                      {brands.map((b) => (
                        <SelectItem key={b.id} value={b.name}>
                          {b.nameHe ? `${b.nameHe} (${b.name})` : b.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="new_brand" className="text-primary font-medium">
                        מותג חדש
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {selectedBrand === "new_brand" ? (
                    <div className="bg-muted/30 p-3 rounded-lg border border-border/50 space-y-3 mt-2">
                      <div>
                        <Label htmlFor="newBrandName" className="text-xs mb-1 block">שם מותג חדש (אנגלית) *</Label>
                        <Input id="newBrandName" name="newBrandName" placeholder="לדוגמה: L'Oreal" required className="h-8 text-sm" />
                      </div>
                      <div>
                        <Label htmlFor="newBrandNameHe" className="text-xs mb-1 block">שם מותג (עברית)</Label>
                        <Input id="newBrandNameHe" name="newBrandNameHe" placeholder="לדוגמה: לוריאל" className="h-8 text-sm" />
                      </div>
                    </div>
                  ) : (
                    <>
                      <input type="hidden" name="brand" value={selectedBrand === "no_brand" ? "" : selectedBrand} />
                      <input type="hidden" name="brandHe" value={selectedBrand === "no_brand" ? "" : (brands.find(b => b.name === selectedBrand)?.nameHe || "")} />
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="size" className="text-right font-medium text-xs">גודל (Size)</Label>
                <Input id="size" name="size" defaultValue={product?.size || ""} className="col-span-3 rounded-xl border-border bg-background" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="barcode" className="text-right font-medium text-xs">מק״ט/ברקוד</Label>
                <Input id="barcode" name="barcode" defaultValue={product?.barcode || ""} className="col-span-3 rounded-xl border-border bg-background" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-medium text-xs">העלאת תמונה</Label>
                <div className="col-span-3 flex items-center gap-3">
                  <Input id="imageUpload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  <Label 
                    htmlFor="imageUpload" 
                    className="cursor-pointer bg-black text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-black/80 transition-colors shadow-sm"
                  >
                    בחר תמונה
                  </Label>
                  <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                    {base64Image ? "תמונה נבחרה" : product?.imageUrl ? "תמונה קיימת" : "לא נבחרה תמונה"}
                  </span>
                </div>
              </div>
              {(base64Image || product?.imageUrl) && (
                <div className="flex justify-center mt-2">
                  <div className="h-24 w-24 bg-white rounded-xl border flex items-center justify-center overflow-hidden shadow-sm">
                    <img src={base64Image || product?.imageUrl || ""} alt="Preview" className="max-h-full max-w-full object-contain" />
                  </div>
                </div>
              )}
            </div>

            {/* Left Column (Pricing & Badges) */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-muted-foreground border-b pb-1">תמחור ומלאי</h4>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right font-medium text-xs">מחיר רגיל</Label>
                <Input id="price" name="price" type="number" step="0.01" defaultValue={product?.price || ""} className="col-span-3 rounded-xl border-border bg-background" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="priceDropPrice" className="text-right font-medium text-xs text-red-500">מחיר מבצע</Label>
                <Input 
                  id="priceDropPrice" 
                  name="priceDropPrice" 
                  type="number" 
                  step="0.01" 
                  defaultValue={product?.priceDropPrice || ""} 
                  onChange={(e) => {
                    if (e.target.value && Number(e.target.value) > 0) {
                      setIsOnSale(true);
                    } else if (!e.target.value) {
                      setIsOnSale(false);
                    }
                  }}
                  className="col-span-3 rounded-xl border-border bg-background" 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="stockQuantity" className="text-right font-medium text-xs">מלאי זמין</Label>
                <Input id="stockQuantity" name="stockQuantity" type="number" defaultValue={product?.stockQuantity || 0} className="col-span-3 rounded-xl border-border bg-background" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="testerRatio" className="text-right font-medium text-xs text-pink-600">יחס טסטרים</Label>
                <Input id="testerRatio" name="testerRatio" type="number" placeholder="לדוגמה: 6 (1 ל-6)" defaultValue={product?.testerRatio || ""} className="col-span-3 rounded-xl border-border bg-background" />
              </div>

              <h4 className="font-semibold text-sm text-muted-foreground border-b pb-1 mt-6 pt-2">תגיות ותצוגה</h4>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between bg-muted/30 p-2 rounded-lg border border-border/50">
                  <Label htmlFor="isOnSale" className="font-medium">מוצר במבצע</Label>
                  <Switch id="isOnSale" name="isOnSale" value="true" checked={isOnSale} onCheckedChange={setIsOnSale} />
                </div>
                <div className="flex items-center justify-between bg-muted/30 p-2 rounded-lg border border-border/50">
                  <Label htmlFor="isBackToStock" className="font-medium">חזר למלאי</Label>
                  <Switch id="isBackToStock" name="isBackToStock" value="true" defaultChecked={product?.isBackToStock} />
                </div>
                <div className="flex items-center justify-between bg-muted/30 p-2 rounded-lg border border-border/50">
                  <Label htmlFor="isOfficialImporter" className="font-medium">יבואן רשמי</Label>
                  <Switch id="isOfficialImporter" name="isOfficialImporter" value="true" defaultChecked={product?.isOfficialImporter} />
                </div>
                <div className="flex items-center justify-between bg-muted/30 p-2 rounded-lg border border-border/50">
                  <Label htmlFor="isDraft" className="font-medium text-muted-foreground">מצב טיוטה</Label>
                  <Switch id="isDraft" name="isDraft" value="true" defaultChecked={product?.isDraft} />
                </div>
              </div>
            </div>

          </div>

          {error && <p className="text-sm text-destructive font-medium mb-4 text-center">{error}</p>}
          <DialogFooter className="mt-4 pt-4 border-t border-border">
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
