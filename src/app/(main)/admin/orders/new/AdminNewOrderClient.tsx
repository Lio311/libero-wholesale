"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Minus, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

interface Store {
  id: string;
  name: string;
  contactName: string;
}

interface Product {
  id: string;
  name: string;
  nameHe?: string | null;
  barcode?: string | null;
  brand?: string | null;
  brandHe?: string | null;
  price: string;
  priceDropPrice?: string | null;
  isOnSale: boolean;
  testerRatio?: number | null;
  imageUrl?: string | null;
}

interface OrderItem {
  product: Product;
  quantity: number;
  testerQuantity: number;
  unitPrice: number;
}

export function AdminNewOrderClient({ stores }: { stores: Store[] }) {
  const router = useRouter();
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");
  const [items, setItems] = useState<OrderItem[]>([]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (q.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    setIsSearching(true);
    setShowDropdown(true);
    try {
      const res = await fetch(`/api/admin/products/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.products || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddProduct = (product: Product) => {
    setSearchQuery("");
    setShowDropdown(false);
    
    setItems((prev) => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      
      const unitPrice = Number(product.isOnSale && product.priceDropPrice ? product.priceDropPrice : product.price);
      return [...prev, {
        product,
        quantity: 1,
        testerQuantity: 0,
        unitPrice
      }];
    });
  };

  const handleUpdateItem = (productId: string, field: "quantity" | "testerQuantity", value: number) => {
    if (value < 0) return;
    setItems(prev => prev.map(i => i.product.id === productId ? { ...i, [field]: value } : i));
  };

  const handleDeleteItem = (productId: string) => {
    setItems(prev => prev.filter(i => i.product.id !== productId));
  };

  const subTotal = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const totalAmount = subTotal * 1.18; // 18% VAT

  const handleSubmit = async () => {
    if (!selectedStoreId) {
      toast.error("אנא בחר לקוח");
      return;
    }
    if (items.length === 0) {
      toast.error("ההזמנה ריקה");
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedStore = stores.find(s => s.id === selectedStoreId);
      
      const res = await fetch("/api/admin/orders/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: selectedStoreId,
          items: items.map(i => ({
            productId: i.product.id,
            quantity: i.quantity,
            testerQuantity: i.testerQuantity,
            unitPrice: i.unitPrice
          })),
          customerDetails: {
            customerName: selectedStore?.contactName,
            businessName: selectedStore?.name,
            customerEmail: "admin@libero.co.il", // Mock or empty
            customerPhone: "0000000000",
          }
        })
      });

      if (res.ok) {
        toast.success("ההזמנה נוצרה בהצלחה!");
        router.push("/admin/orders");
      } else {
        const err = await res.json();
        toast.error(err.error || "שגיאה ביצירת הזמנה");
      }
    } catch (e) {
      toast.error("שגיאה ביצירת הזמנה");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-card/30 border border-border p-6 rounded-xl flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">בחר לקוח</label>
          <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
            <SelectTrigger className="w-full md:w-1/2 bg-background border-border" dir="rtl">
              <SelectValue placeholder="בחר לקוח..." />
            </SelectTrigger>
            <SelectContent>
              {stores.map(store => (
                <SelectItem key={store.id} value={store.id}>{store.name} ({store.contactName})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="relative w-full md:w-1/2 z-50">
          <label className="block text-sm font-medium mb-1">הוסף מוצרים</label>
          <div className="relative">
            <Input 
              placeholder="חפש מוצר לפי שם או ברקוד..." 
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => { if(searchResults.length > 0) setShowDropdown(true); }}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            />
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin absolute left-3 top-2.5 text-muted-foreground" />
            ) : (
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
            )}
          </div>
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute top-16 right-0 w-full bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
              {searchResults.map(p => (
                <div 
                  key={p.id} 
                  className="p-2 hover:bg-muted/50 cursor-pointer flex justify-between items-center border-b last:border-0"
                  onClick={() => handleAddProduct(p)}
                >
                  <div className="flex items-center gap-2">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="w-8 h-8 object-contain bg-white rounded border" />
                    ) : (
                      <div className="w-8 h-8 bg-muted rounded border flex items-center justify-center text-[8px]">N/A</div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{p.nameHe || p.name}</span>
                      <span className="text-xs text-muted-foreground">{p.brandHe || p.brand} {p.barcode ? `| ${p.barcode}` : ''}</span>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-left ml-2" dir="ltr">₪{Number(p.isOnSale && p.priceDropPrice ? p.priceDropPrice : p.price).toFixed(2)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {items.length > 0 && (
        <div className="border border-border rounded-xl overflow-x-auto bg-card/30 relative z-10">
          <Table className="w-full">
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-16 text-center">תמונה</TableHead>
                <TableHead className="text-right">מוצר</TableHead>
                <TableHead className="text-center w-[120px]">כמות</TableHead>
                <TableHead className="text-center w-[120px]">כמות טסטרים</TableHead>
                <TableHead className="text-center">מחיר יחידה</TableHead>
                <TableHead className="text-center">סה״כ</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const autoTesters = Boolean(item.product.testerRatio) && item.quantity >= item.product.testerRatio! 
                  ? Math.floor(item.quantity / item.product.testerRatio!) 
                  : 0;

                return (
                  <TableRow key={item.product.id} className="hover:bg-muted/20">
                    <TableCell className="p-2">
                      {item.product.imageUrl ? (
                        <div className="h-12 w-12 bg-white rounded-md border flex items-center justify-center mx-auto p-1">
                          <img src={item.product.imageUrl} alt={item.product.name} className="max-h-full max-w-full object-contain" />
                        </div>
                      ) : (
                        <div className="h-12 w-12 bg-muted rounded-md flex items-center justify-center mx-auto text-[10px] text-muted-foreground">אין תמונה</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{item.product.nameHe || item.product.name}</div>
                      <div className="text-xs text-muted-foreground flex gap-2 mt-1">
                        <span>{item.product.brandHe || item.product.brand}</span>
                        {item.product.barcode && <span>• ברקוד: {item.product.barcode}</span>}
                      </div>
                      {item.product.testerRatio && (
                        <div className="text-xs text-green-600 mt-1">
                          יחס טסטרים מוגדר: 1 ל-{item.product.testerRatio} (מגיע כברירת מחדל {autoTesters})
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleUpdateItem(item.product.id, "quantity", item.quantity - 1)}>
                          <Minus className="w-3 h-3" />
                        </Button>
                        <Input 
                          type="number" 
                          className="h-6 w-12 text-center p-0" 
                          value={item.quantity} 
                          onChange={(e) => handleUpdateItem(item.product.id, "quantity", parseInt(e.target.value) || 0)}
                        />
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleUpdateItem(item.product.id, "quantity", item.quantity + 1)}>
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleUpdateItem(item.product.id, "testerQuantity", item.testerQuantity - 1)}>
                          <Minus className="w-3 h-3" />
                        </Button>
                        <Input 
                          type="number" 
                          className="h-6 w-12 text-center p-0" 
                          value={item.testerQuantity} 
                          onChange={(e) => handleUpdateItem(item.product.id, "testerQuantity", parseInt(e.target.value) || 0)}
                        />
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleUpdateItem(item.product.id, "testerQuantity", item.testerQuantity + 1)}>
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-mono" dir="ltr">₪{item.unitPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-center font-mono font-bold" dir="ltr">₪{(item.quantity * item.unitPrice).toFixed(2)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 h-8 w-8" onClick={() => handleDeleteItem(item.product.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          <div className="bg-muted/30 p-4 border-t flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span>סכום ביניים:</span>
                <span className="font-mono">₪{subTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>מע״מ (18%):</span>
                <span className="font-mono">₪{(subTotal * 0.18).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                <span>סה״כ:</span>
                <span className="font-mono text-primary">₪{totalAmount.toFixed(2)}</span>
              </div>
              
              <Button className="w-full mt-4" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                צור הזמנה
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
