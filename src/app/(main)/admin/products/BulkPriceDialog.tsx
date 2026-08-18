import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { bulkUpdatePrices } from "./actions";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface BulkPriceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
  onSuccess: () => void;
}

export function BulkPriceDialog({ open, onOpenChange, selectedIds, onSuccess }: BulkPriceDialogProps) {
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!price || isNaN(Number(price))) {
      toast.error("נא להזין מחיר תקין");
      return;
    }

    setLoading(true);
    try {
      const result = await bulkUpdatePrices(selectedIds, Number(price));
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`עודכן מחיר ל-${selectedIds.length} מוצרים בהצלחה`);
        setPrice("");
        onSuccess();
        onOpenChange(false);
      }
    } catch (error) {
      toast.error("שגיאה בעדכון מחירים");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-sm">
        <DialogHeader>
          <DialogTitle>עדכון מחיר גורף</DialogTitle>
          <DialogDescription>
            מעדכן את המחיר עבור {selectedIds.length} המוצרים שנבחרו.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="bulk-price">מחיר סיטונאי חדש (₪)</Label>
            <Input
              id="bulk-price"
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              required
              autoFocus
            />
          </div>
          <DialogFooter className="sm:justify-start">
            <Button type="submit" disabled={loading} className="w-full">
              {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              עדכן מחיר לכולם
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
