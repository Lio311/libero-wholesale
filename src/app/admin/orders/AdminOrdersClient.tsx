"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface AdminOrderRow {
  id: string;
  orderNumber: number;
  status: string;
  totalAmount: string | number;
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
              <TableHead className="text-right">פריטים</TableHead>
              <TableHead className="text-left">סכום כולל</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow className="border-border hover:bg-muted/20">
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  אין הזמנות קודמות
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id} className="border-border hover:bg-muted/20 transition-colors group">
                  <TableCell 
                    className="font-mono font-medium cursor-pointer text-primary hover:underline"
                    onClick={() => setSelectedOrder(order)}
                  >
                    #{order.orderNumber}
                  </TableCell>
                  <TableCell className="cursor-pointer" onClick={() => setSelectedOrder(order)}>
                    <div className="font-medium">{order.store?.name || "לקוח מזדמן"}</div>
                    {order.store?.contactName && <div className="text-xs text-muted-foreground">{order.store.contactName}</div>}
                  </TableCell>
                  <TableCell className="text-muted-foreground cursor-pointer" onClick={() => setSelectedOrder(order)}>
                    {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}
                  </TableCell>
                  <TableCell>
                    {updatingId === order.id ? (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        מעדכן...
                      </div>
                    ) : (
                      <Select value={order.status} onValueChange={(val) => handleStatusChange(order.id, val)}>
                        <SelectTrigger className="w-[120px] h-8 text-xs border-border bg-background" dir="rtl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">ממתין</SelectItem>
                          <SelectItem value="processing">בטיפול</SelectItem>
                          <SelectItem value="shipped">נשלח</SelectItem>
                          <SelectItem value="delivered">נמסר</SelectItem>
                          <SelectItem value="cancelled">בוטל</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                  <TableCell className="cursor-pointer" onClick={() => setSelectedOrder(order)}>{order.itemsCount}</TableCell>
                  <TableCell className="text-left font-mono font-bold cursor-pointer" onClick={() => setSelectedOrder(order)}>
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
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-muted/30 p-4 rounded-xl border border-border">
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
                  <Select value={selectedOrder.status} onValueChange={(val) => handleStatusChange(selectedOrder.id, val)}>
                    <SelectTrigger className="w-full h-8 text-xs border-border bg-background" dir="rtl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
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
                      <TableHead className="text-center">כמות</TableHead>
                      <TableHead className="text-left">מחיר יחידה</TableHead>
                      <TableHead className="text-left">סה״כ</TableHead>
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
                        <TableCell className="text-center font-bold text-lg">{item.quantity}</TableCell>
                        <TableCell className="text-left font-mono">₪{Number(item.unitPrice).toFixed(2)}</TableCell>
                        <TableCell className="text-left font-mono font-bold">₪{Number(item.totalPrice).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
