"use client";

import { ExportExcelButton } from "@/components/ExportExcelButton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

// Use partial type representing an Order joined with basic store data
interface OrderRow {
  id: string;
  orderNumber: number;
  status: string;
  totalAmount: string | number;
  itemsCount: number;
  createdAt: Date;
  comaxRef?: string | null;
}

interface OrdersClientProps {
  orders: OrderRow[];
}

export function OrdersClient({ orders }: OrdersClientProps) {
  
  // Format for Excel Export
  const excelColumns = [
    { header: "מספר הזמנה", key: "orderNumber", width: 15 },
    { header: "תאריך", key: "date", width: 20 },
    { header: "סטטוס", key: "status", width: 15 },
    { header: "כמות פריטים", key: "itemsCount", width: 15 },
    { header: "סכום כולל (₪)", key: "totalAmount", width: 20 },
    { header: "מספר קומקס", key: "comaxRef", width: 20 },
  ];

  const excelData = orders.map(order => ({
    orderNumber: order.orderNumber,
    date: format(new Date(order.createdAt), "dd/MM/yyyy HH:mm"),
    status: order.status === "pending" ? "ממתין" : 
            order.status === "processing" ? "בטיפול" : 
            order.status === "shipped" ? "נשלח" : 
            order.status === "delivered" ? "נמסר" : "בוטל",
    itemsCount: order.itemsCount,
    totalAmount: Number(order.totalAmount).toFixed(2),
    comaxRef: order.comaxRef || "לא קיים"
  }));

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
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground font-mono">
          נמצאו {orders.length} הזמנות
        </div>
        <ExportExcelButton 
          data={excelData} 
          columns={excelColumns} 
          filename="Libero_Orders_History" 
          sheetName="היסטוריית הזמנות"
        />
      </div>

      <div className="border border-border rounded-xl overflow-hidden bg-card/30 backdrop-blur-md">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="w-[100px] text-right">מספר הזמנה</TableHead>
              <TableHead className="text-right">תאריך</TableHead>
              <TableHead className="text-right">סטטוס</TableHead>
              <TableHead className="text-right">פריטים</TableHead>
              <TableHead className="text-right">מספר קומקס</TableHead>
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
                <TableRow key={order.id} className="border-border hover:bg-muted/20 transition-colors cursor-pointer group">
                  <TableCell className="font-mono font-medium">#{order.orderNumber}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}
                  </TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>{order.itemsCount}</TableCell>
                  <TableCell className="font-mono text-muted-foreground text-xs">{order.comaxRef || "-"}</TableCell>
                  <TableCell className="text-left font-mono font-bold">₪{Number(order.totalAmount).toFixed(2)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
