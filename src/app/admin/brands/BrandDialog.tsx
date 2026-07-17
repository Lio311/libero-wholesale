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
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { createBrand, updateBrand } from "./actions";

interface BrandDialogProps {
  brand?: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BrandDialog({ brand, open, onOpenChange }: BrandDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);

  const isEditing = !!brand;

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
      formData.set("logoUrl", base64Image);
    } else if (brand?.logoUrl) {
      formData.set("logoUrl", brand.logoUrl);
    }

    let res;
    if (isEditing && brand) {
      res = await updateBrand(brand.id, formData);
    } else {
      res = await createBrand(formData);
    }

    setIsLoading(false);

    if (res?.error) {
      setError(res.error);
    } else {
      setBase64Image(null);
      onOpenChange(false);
      window.location.reload(); // Refresh the page to get the updated DB data
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border rounded-2xl shadow-xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "ערוך מותג" : "הוסף מותג חדש"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "ערוך את פרטי המותג כאן." : "הזן את פרטי המותג החדש."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-6 py-4">
          
          <div className="space-y-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right font-medium text-sm">שם (אנגלית)</Label>
              <Input id="name" name="name" defaultValue={brand?.name || ""} className="col-span-3 rounded-xl border-border bg-background" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nameHe" className="text-right font-medium text-sm">שם (עברית)</Label>
              <Input id="nameHe" name="nameHe" defaultValue={brand?.nameHe || ""} className="col-span-3 rounded-xl border-border bg-background" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium text-sm">לוגו מותג</Label>
              <div className="col-span-3 flex items-center gap-3">
                <Input id="imageUpload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                <Label 
                  htmlFor="imageUpload" 
                  className="cursor-pointer bg-black text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-black/80 transition-colors shadow-sm"
                >
                  בחר לוגו
                </Label>
                <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                  {base64Image ? "לוגו נבחר" : brand?.logoUrl ? "לוגו קיים" : "לא נבחר לוגו"}
                </span>
              </div>
            </div>
            {(base64Image || brand?.logoUrl) && (
              <div className="flex justify-center mt-2">
                <div className="h-24 w-24 bg-white rounded-xl border flex items-center justify-center overflow-hidden shadow-sm p-2">
                  <img src={base64Image || brand?.logoUrl || ""} alt="Preview" className="max-h-full max-w-full object-contain" />
                </div>
              </div>
            )}
          </div>

          {error && <p className="text-sm text-destructive font-medium mb-4 text-center">{error}</p>}
          <DialogFooter className="mt-4 border-t border-border pt-4">
            <Button type="submit" disabled={isLoading} className="rounded-full w-full sm:w-auto font-semibold shadow-sm">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "שמור מותג" : "הוסף מותג"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
