"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cart";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export function CheckoutForm({ store }: { store: any }) {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (items.length === 0) {
    return (
      <div className="text-center py-32 bg-card rounded-3xl border border-border shadow-sm">
        <h2 className="text-2xl font-bold mb-4">העגלה שלך ריקה</h2>
        <p className="text-muted-foreground mb-8">לא ניתן להמשיך לקופה עם עגלה ריקה.</p>
        <Button size="lg" className="rounded-full" onClick={() => router.push("/catalog")}>חזרה לקטלוג</Button>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    const customerDetails = {
      businessName: store.name,
      customerName: formData.get("customerName"),
      customerPhone: formData.get("customerPhone"),
      customerEmail: store.email,
      deliveryAddress: formData.get("deliveryAddress"),
      notes: formData.get("notes"),
    };

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          customerDetails,
          storeId: store.id === "admin-store" ? null : store.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to process checkout");
      }

      clearCart();
      router.push(`/checkout/success`);
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Checkout Form */}
      <div className="lg:col-span-2 bg-card p-6 md:p-10 rounded-[2.5rem] border border-border shadow-sm">
        <h2 className="text-2xl font-bold mb-8">פרטי משלוח ויצירת קשר</h2>
        <form id="checkout-form" onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="businessName">שם העסק (קריאה בלבד)</Label>
              <Input id="businessName" name="businessName" defaultValue={store.name} readOnly className="bg-muted h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerName">איש קשר</Label>
              <Input id="customerName" name="customerName" defaultValue={store.contactName} required className="h-12 rounded-xl" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="customerPhone">טלפון נייד</Label>
              <Input id="customerPhone" name="customerPhone" defaultValue={store.phone} required dir="ltr" className="text-right h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerEmail">אימייל (קריאה בלבד)</Label>
              <Input id="customerEmail" name="customerEmail" defaultValue={store.email} readOnly className="bg-muted text-right h-12 rounded-xl" dir="ltr" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deliveryAddress">כתובת משלוח</Label>
            <Input id="deliveryAddress" name="deliveryAddress" defaultValue={store.address} required className="h-12 rounded-xl" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">הערות להזמנה (אופציונלי)</Label>
            <Input id="notes" name="notes" placeholder="הוראות הגעה מיוחדות, שעות פתיחה וכו'" className="h-12 rounded-xl" />
          </div>

          {error && <p className="text-destructive font-medium">{error}</p>}
        </form>
      </div>

      {/* Order Summary */}
      <div className="bg-card p-6 md:p-8 rounded-[2.5rem] border border-border shadow-sm h-fit sticky top-6">
        <h2 className="text-2xl font-bold mb-8">סיכום הזמנה</h2>
        
        <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 mb-8">
          {items.map((item) => (
            <div key={item.product.id} className="flex gap-4 items-center">
              <div className="relative h-16 w-16 bg-muted/50 rounded-xl border border-border/50 flex-shrink-0">
                {item.product.imageUrl && (
                  <Image src={item.product.imageUrl} alt={item.product.name} fill className="object-contain p-2" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold line-clamp-2 leading-tight">{item.product.nameHe || item.product.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.quantity} יחידות</p>
              </div>
              <div className="text-sm font-bold font-mono">
                ₪{(Number(item.product.price) * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <Separator className="mb-6 bg-border/60" />

        <div className="flex justify-between items-center mb-8">
          <span className="font-bold text-lg">סה״כ לתשלום</span>
          <span className="text-3xl font-bold font-mono text-primary">₪{getTotalPrice().toFixed(2)}</span>
        </div>

        <Button 
          type="submit" 
          form="checkout-form" 
          disabled={isLoading} 
          className="w-full h-14 text-lg font-bold rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl transition-all"
        >
          {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          סיום ושליחת הזמנה
        </Button>
      </div>
    </div>
  );
}
