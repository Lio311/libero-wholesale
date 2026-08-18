"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { useState } from "react";

// Use partial type representing an Order joined with basic store data
interface OrderRow {
  id: string;
  orderNumber: number;
  status: string;
  paymentStatus: string;
  totalAmount: string | number;
  itemsCount: number;
  createdAt: Date;
  comaxRef?: string | null;
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
      testerRatio?: number | null;
    }
  }[];
}

interface OrdersClientProps {
  orders: OrderRow[];
}

export function OrdersClient({ orders }: OrdersClientProps) {
  const [selectedOrder, setSelectedOrder] = useState<OrderRow | null>(null);

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

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "paid": return <Badge className="bg-green-500/20 text-green-600 border-green-500/50">שולם</Badge>;
      case "unpaid": return <Badge variant="destructive" className="bg-red-500/20 text-red-600 border-red-500/50 hover:bg-red-500/30">טרם שולם</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground font-mono">
          נמצאו {orders.length} הזמנות
        </div>
      </div>

      <div className="border border-border rounded-xl overflow-hidden bg-card/30 backdrop-blur-md">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="w-[100px] text-right">מספר הזמנה</TableHead>
              <TableHead className="text-right">תאריך</TableHead>
              <TableHead className="text-right">סטטוס הזמנה</TableHead>
              <TableHead className="text-right">סטטוס תשלום</TableHead>
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
                <TableRow key={order.id} onClick={() => setSelectedOrder(order)} className="border-border hover:bg-muted/20 transition-colors cursor-pointer group">
                  <TableCell className="font-mono font-medium">#{order.orderNumber}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}
                  </TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>{getPaymentBadge(order.paymentStatus)}</TableCell>
                  <TableCell className="text-left font-mono font-bold">₪{Number(order.totalAmount).toFixed(2)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
          <DialogContent className="sm:max-w-4xl w-[95vw] max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <DialogHeader className="pt-2 pl-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <DialogTitle className="text-xl flex items-center gap-3">
                  <span>הזמנה #{selectedOrder.orderNumber}</span>
                  {getStatusBadge(selectedOrder.status)}
                  {getPaymentBadge(selectedOrder.paymentStatus)}
                </DialogTitle>
                <a
                  href={`/api/orders/${selectedOrder.id}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sm:ml-4"
                >
                  <Button variant="outline" size="sm" className="gap-2 rounded-full w-full sm:w-auto">
                    <FileDown className="h-4 w-4" />
                    הורד סיכום הזמנה
                  </Button>
                </a>
              </div>
            </DialogHeader>
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-xl border border-border">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">תאריך</div>
                  <div className="font-medium">{format(new Date(selectedOrder.createdAt), "dd/MM/yyyy HH:mm")}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">סכום כולל</div>
                  <div className="font-bold">₪{Number(selectedOrder.totalAmount).toFixed(2)}</div>
                </div>
              </div>

              <div className="border border-border rounded-xl overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-16 text-center">תמונה</TableHead>
                      <TableHead className="text-right">מוצר</TableHead>
                      <TableHead className="text-center">כמות</TableHead>
                      <TableHead className="text-center">מחיר יחידה</TableHead>
                      <TableHead className="text-center">סה״כ</TableHead>
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
                          {item.product.testerRatio && item.quantity >= item.product.testerRatio && (
                            <div className="text-xs font-semibold text-green-600 bg-green-500/10 w-fit px-2 py-0.5 rounded-full mt-1">
                              + {Math.floor(item.quantity / item.product.testerRatio)} טסטר מתנה
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-center font-bold text-lg">{item.quantity}</TableCell>
                        <TableCell className="text-center font-mono" dir="ltr">₪{Number(item.unitPrice).toFixed(2)}</TableCell>
                        <TableCell className="text-center font-mono font-bold" dir="ltr">₪{Number(item.totalPrice).toFixed(2)}</TableCell>
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
