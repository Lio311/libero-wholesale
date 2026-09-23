"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cart";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export function CheckoutForm({ store }: { store: any }) {
  const { items, getSubtotalPrice, getVatAmount, getTotalPrice, clearCart } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  
  const hasInitialDetails = Boolean(store.contactName && store.phone && store.address);
  const [isEditingDetails, setIsEditingDetails] = useState(!hasInitialDetails);

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
      router.push(`/checkout/success?orderId=${data.orderId}`);
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col-reverse lg:grid lg:grid-cols-3 gap-8">
      {/* Checkout Form */}
      <div className="lg:col-span-2 bg-card p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] border border-border shadow-sm">
        <h2 className="text-2xl font-bold mb-8">פרטי משלוח ויצירת קשר</h2>
        <form id="checkout-form" onSubmit={onSubmit} className="space-y-6">
          {!isEditingDetails ? (
            <div className="bg-muted/30 border border-border rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">פרטי העסק והמשלוח</h3>
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditingDetails(true)}>
                  עריכה
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">שם העסק</p>
                  <p className="font-medium">{store.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">איש קשר</p>
                  <p className="font-medium">{store.contactName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">טלפון</p>
                  <p className="font-medium" dir="ltr" style={{ textAlign: 'right' }}>{store.phone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">אימייל</p>
                  <p className="font-medium">{store.email}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground mb-1">כתובת משלוח</p>
                  <p className="font-medium">{store.address}</p>
                </div>
              </div>
              
              <input type="hidden" name="customerName" value={store.contactName} />
              <input type="hidden" name="customerPhone" value={store.phone} />
              <input type="hidden" name="deliveryAddress" value={store.address} />
            </div>
          ) : (
            <div className="space-y-6 border border-border rounded-2xl p-5 bg-card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">עריכת פרטי משלוח</h3>
                {hasInitialDetails && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditingDetails(false)}>
                    ביטול
                  </Button>
                )}
              </div>
              <div className="flex flex-col gap-1.5 sm:grid sm:grid-cols-2 sm:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="businessName">שם העסק (קריאה בלבד)</Label>
                  <Input id="businessName" name="businessName" defaultValue={store.name} readOnly className="bg-muted h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerName">איש קשר</Label>
                  <Input id="customerName" name="customerName" defaultValue={store.contactName} required className="h-12 rounded-xl" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 sm:grid sm:grid-cols-2 sm:gap-6">
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
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">הערות להזמנה (אופציונלי)</Label>
            <Input id="notes" name="notes" placeholder="הוראות הגעה מיוחדות, שעות פתיחה וכו'" className="h-12 rounded-xl" />
          </div>

          {error && <p className="text-destructive font-medium">{error}</p>}

          <Button 
            type="submit" 
            disabled={isLoading} 
            className="w-full h-14 text-lg font-bold rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl transition-all lg:hidden"
          >
            {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            סיום ושליחת הזמנה
          </Button>
        </form>
      </div>

      <div className="flex flex-col gap-8">
        {/* Mobile Order Summary */}
        <div className="lg:hidden bg-card p-5 rounded-2xl border border-border shadow-sm">
          <button 
            type="button"
            className="w-full flex justify-between items-center font-bold text-lg"
            onClick={() => setIsSummaryOpen(!isSummaryOpen)}
          >
            <span>סיכום הזמנה ({items.length} פריטים)</span>
            <div className="flex items-center gap-2">
              <span className="text-primary font-mono">₪{getTotalPrice().toFixed(2)}</span>
              {isSummaryOpen ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
            </div>
          </button>
          
          {isSummaryOpen && (
            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 mb-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-3 items-center">
                    <div className="relative h-12 w-12 bg-muted/50 rounded-lg border border-border/50 flex-shrink-0">
                      {item.product.imageUrl && (
                        <Image src={item.product.imageUrl} alt={item.product.name} fill className="object-contain p-1" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold line-clamp-2">{item.product.nameHe || item.product.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{item.quantity} יחידות</p>
                    </div>
                    <div className="text-sm font-bold font-mono">
                      ₪{(Number(item.product.price) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              
              <Separator className="my-4 bg-border/60" />
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-muted-foreground">סכום ביניים</span>
                <span className="font-mono font-medium">₪{getSubtotalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm mb-4">
                <span className="text-muted-foreground">מע"מ (18%)</span>
                <span className="font-mono font-medium">₪{getVatAmount().toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Order Summary */}
        <div className="hidden lg:block bg-card p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] border border-border shadow-sm h-fit sticky top-6">
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
                {item.product.testerRatio && item.quantity >= item.product.testerRatio && (
                  <p className="text-xs font-semibold text-green-600 mt-1">
                    + {Math.floor(item.quantity / item.product.testerRatio)} טסטר מתנה
                  </p>
                )}
              </div>
              <div className="text-sm font-bold font-mono">
                ₪{(Number(item.product.price) * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <Separator className="mb-4 bg-border/60" />

        <div className="flex justify-between items-center mb-2">
          <span className="text-muted-foreground">סכום ביניים</span>
          <span className="font-mono font-medium">₪{getSubtotalPrice().toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <span className="text-muted-foreground">מע"מ (18%)</span>
          <span className="font-mono font-medium">₪{getVatAmount().toFixed(2)}</span>
        </div>

        <Separator className="mb-6 bg-border/60" />

        <div className="flex justify-between items-center mb-8">
          <span className="font-bold text-lg">סה״כ לתשלום (כולל מע"מ)</span>
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
    </div>
  );
}
