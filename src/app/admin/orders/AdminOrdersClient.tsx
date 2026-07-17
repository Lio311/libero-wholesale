"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Trash2, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AdminOrderRow {
  id: string;
  orderNumber: number;
  status: string;
  totalAmount: string | number;
  discountAmount?: string | number;
  itemsCount: number;
  createdAt: Date;
  comaxRef?: string | null;
  store?: {
    name: string;
    contactName: string;
  } | null;
  orderItems?: {
    id: string;
    quantity: number;
    unitPrice: string | number;
    totalPrice: string | number;
    product: {
      id: string;
      name: string;
      nameHe?: string | null;
      brand?: string | null;
      brandHe?: string | null;
      imageUrl?: string | null;
      barcode?: string | null;
    }
  }[];
}

interface AdminOrdersClientProps {
  initialOrders: AdminOrderRow[];
}

export function AdminOrdersClient({ initialOrders }: AdminOrdersClientProps) {
  const [orders, setOrders] = useState<AdminOrderRow[]>(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderRow | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [updatingItemIds, setUpdatingItemIds] = useState<Set<string>>(new Set());
  const [discountInput, setDiscountInput] = useState<string>("");

  // Sync discount input when order is selected
  const handleOpenOrder = (order: AdminOrderRow) => {
    setSelectedOrder(order);
    setDiscountInput(order.discountAmount ? order.discountAmount.toString() : "");
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      } else {
        alert("שגיאה בעדכון הסטטוס");
      }
    } catch (e) {
      alert("שגיאה בעדכון הסטטוס");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("האם אתה בטוח שברצונך למחוק הזמנה זו? כל המלאי יוחזר למוצרים ולא ניתן יהיה לשחזר פעולה זו.")) return;
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, { method: "DELETE" });
      if (res.ok) {
        setOrders(orders.filter(o => o.id !== orderId));
        if (selectedOrder?.id === orderId) setSelectedOrder(null);
      } else {
        alert("שגיאה במחיקת ההזמנה");
      }
    } catch (e) {
      alert("שגיאה במחיקת ההזמנה");
    }
  };

  const handleUpdateItemQuantity = async (orderId: string, itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setUpdatingItemIds(prev => new Set(prev).add(itemId));
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQuantity })
      });
      if (res.ok) {
        const order = orders.find(o => o.id === orderId);
        if (order && order.orderItems) {
           const item = order.orderItems.find(i => i.id === itemId);
           if (item) {
             item.quantity = newQuantity;
             item.totalPrice = newQuantity * Number(item.unitPrice);
             const newSum = order.orderItems.reduce((acc, curr) => acc + Number(curr.totalPrice), 0);
             order.totalAmount = Math.max(0, newSum - Number(order.discountAmount || 0));
             setOrders([...orders]);
             if (selectedOrder?.id === orderId) setSelectedOrder({...order});
           }
        }
      } else {
        alert("שגיאה בעדכון כמות פריט");
      }
    } catch (e) {
      alert("שגיאה בעדכון כמות פריט");
    } finally {
      setUpdatingItemIds(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const handleDeleteItem = async (orderId: string, itemId: string) => {
    if (!confirm("האם למחוק פריט זה מההזמנה? הכמות תוחזר למלאי.")) return;
    setUpdatingItemIds(prev => new Set(prev).add(itemId));
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/items/${itemId}`, { method: "DELETE" });
      if (res.ok) {
        const order = orders.find(o => o.id === orderId);
        if (order && order.orderItems) {
           order.orderItems = order.orderItems.filter(i => i.id !== itemId);
           order.itemsCount = order.orderItems.length;
           const newSum = order.orderItems.reduce((acc, curr) => acc + Number(curr.totalPrice), 0);
           order.totalAmount = Math.max(0, newSum - Number(order.discountAmount || 0));
           setOrders([...orders]);
           if (selectedOrder?.id === orderId) setSelectedOrder({...order});
        }
      } else {
        alert("שגיאה במחיקת הפריט");
      }
    } catch (e) {
      alert("שגיאה במחיקת הפריט");
    } finally {
      setUpdatingItemIds(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const handleUpdateDiscount = async (orderId: string) => {
    const num = Number(discountInput);
    if (isNaN(num) || num < 0) return alert("אנא הזן סכום הנחה תקין");
    setUpdatingId("discount");
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/discount`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discountAmount: num })
      });
      if (res.ok) {
        const data = await res.json();
        const order = orders.find(o => o.id === orderId);
        if (order) {
           order.discountAmount = num;
           order.totalAmount = data.finalAmount;
           setOrders([...orders]);
           if (selectedOrder?.id === orderId) setSelectedOrder({...order});
        }
        alert("הנחה עודכנה בהצלחה!");
      } else {
        alert("שגיאה בעדכון הנחה");
      }
    } catch (e) {
      alert("שגיאה בעדכון הנחה");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge variant="secondary">ממתין</Badge>;
      case "processing": return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">בטיפול</Badge>;
      case "shipped": return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">נשלח</Badge>;
      case "delivered": return <Badge className="bg-green-500/20 text-green-400 border-green-500/50">נמסר</Badge>;
      case "cancelled": return <Badge variant="destructive">בוטל</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending": return "ממתין";
      case "processing": return "בטיפול";
      case "shipped": return "נשלח";
      case "delivered": return "נמסר";
      case "cancelled": return "בוטל";
      default: return status;
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="border border-border rounded-xl overflow-hidden bg-card/30 backdrop-blur-md">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="w-[100px] text-right">מספר הזמנה</TableHead>
              <TableHead className="text-right">לקוח / חנות</TableHead>
              <TableHead className="text-right">תאריך</TableHead>
              <TableHead className="text-right">סטטוס</TableHead>
              <TableHead className="text-left">סכום כולל</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow className="border-border hover:bg-muted/20">
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  אין הזמנות קודמות
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id} className="border-border hover:bg-muted/20 transition-colors group">
                  <TableCell 
                    className="font-mono font-medium cursor-pointer text-primary hover:underline"
                    onClick={() => handleOpenOrder(order)}
                  >
                    #{order.orderNumber}
                  </TableCell>
                  <TableCell className="cursor-pointer" onClick={() => handleOpenOrder(order)}>
                    <div className="font-medium">{order.store?.name || "לקוח מזדמן"}</div>
                    {order.store?.contactName && <div className="text-xs text-muted-foreground">{order.store.contactName}</div>}
                  </TableCell>
                  <TableCell className="text-muted-foreground cursor-pointer" onClick={() => handleOpenOrder(order)}>
                    {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}
                  </TableCell>
                  <TableCell>
                    {updatingId === order.id ? (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        מעדכן...
                      </div>
                    ) : (
                      <Select value={order.status} onValueChange={(val) => handleStatusChange(order.id, val as string)}>
                        <SelectTrigger className="w-[120px] h-8 text-xs border-border bg-background" dir="rtl">
                          <span className="flex-1 text-right">{getStatusLabel(order.status)}</span>
                        </SelectTrigger>
                        <SelectContent side="bottom" sideOffset={4} align="end">
                          <SelectItem value="pending">ממתין</SelectItem>
                          <SelectItem value="processing">בטיפול</SelectItem>
                          <SelectItem value="shipped">נשלח</SelectItem>
                          <SelectItem value="delivered">נמסר</SelectItem>
                          <SelectItem value="cancelled">בוטל</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                  <TableCell className="text-left font-mono font-bold cursor-pointer" onClick={() => handleOpenOrder(order)}>
                    ₪{Number(order.totalAmount).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span>הזמנה #{selectedOrder.orderNumber}</span>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteOrder(selectedOrder.id)}>
                  <Trash2 className="w-4 h-4 ml-2" />
                  מחק הזמנה
                </Button>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-muted/30 p-4 rounded-xl border border-border">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">לקוח</div>
                  <div className="font-medium">{selectedOrder.store?.name || "לקוח מזדמן"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">סכום כולל</div>
                  <div className="font-bold text-primary">₪{Number(selectedOrder.totalAmount).toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">תאריך והשעה</div>
                  <div className="font-medium">{format(new Date(selectedOrder.createdAt), "dd/MM/yyyy HH:mm")}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">עדכון סטטוס</div>
                  <Select value={selectedOrder.status} onValueChange={(val) => handleStatusChange(selectedOrder.id, val as string)}>
                    <SelectTrigger className="w-full h-8 text-xs border-border bg-background" dir="rtl">
                      <span className="flex-1 text-right">{getStatusLabel(selectedOrder.status)}</span>
                    </SelectTrigger>
                    <SelectContent side="bottom" sideOffset={4} align="end">
                      <SelectItem value="pending">ממתין</SelectItem>
                      <SelectItem value="processing">בטיפול</SelectItem>
                      <SelectItem value="shipped">נשלח</SelectItem>
                      <SelectItem value="delivered">נמסר</SelectItem>
                      <SelectItem value="cancelled">בוטל</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border border-border rounded-xl overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-16 text-center">תמונה</TableHead>
                      <TableHead className="text-right">מוצר</TableHead>
                      <TableHead className="text-center w-[120px]">כמות</TableHead>
                      <TableHead className="text-center">מחיר יחידה</TableHead>
                      <TableHead className="text-center">סה״כ</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.orderItems?.map((item) => (
                      <TableRow key={item.id} className="hover:bg-muted/20">
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
                          <div className="text-xs text-muted-foreground flex gap-2">
                            <span>{item.product.brandHe || item.product.brand}</span>
                            {item.product.barcode && <span>• ברקוד: {item.product.barcode}</span>}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-6 w-6" 
                              disabled={item.quantity <= 1 || updatingItemIds.has(item.id)}
                              onClick={() => handleUpdateItemQuantity(selectedOrder.id, item.id, item.quantity - 1)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="font-bold text-lg w-6 text-center">
                              {updatingItemIds.has(item.id) ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : item.quantity}
                            </span>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-6 w-6" 
                              disabled={updatingItemIds.has(item.id)}
                              onClick={() => handleUpdateItemQuantity(selectedOrder.id, item.id, item.quantity + 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-mono" dir="ltr">₪{Number(item.unitPrice).toFixed(2)}</TableCell>
                        <TableCell className="text-center font-mono font-bold" dir="ltr">₪{Number(item.totalPrice).toFixed(2)}</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:bg-destructive/10 h-8 w-8"
                            disabled={updatingItemIds.has(item.id)}
                            onClick={() => handleDeleteItem(selectedOrder.id, item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                <div className="bg-muted/30 p-4 border-t flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">הנחה להזמנה (₪):</span>
                    <Input 
                      type="number" 
                      min="0"
                      className="w-24 h-8 text-left" 
                      value={discountInput}
                      onChange={(e) => setDiscountInput(e.target.value)}
                      placeholder="0.00"
                    />
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      disabled={updatingId === "discount"}
                      onClick={() => handleUpdateDiscount(selectedOrder.id)}
                    >
                      {updatingId === "discount" ? <Loader2 className="w-4 h-4 animate-spin" /> : "החל"}
                    </Button>
                  </div>
                  <div className="text-lg font-bold">
                    <span>סה״כ לתשלום: </span>
                    <span className="text-primary font-mono">₪{Number(selectedOrder.totalAmount).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
