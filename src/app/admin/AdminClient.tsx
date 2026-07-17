"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, ShoppingCart, DollarSign, Package, ArrowUpRight, ArrowDownRight, TrendingUp, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface AdminClientProps {
  stats: {
    totalRevenue: number;
    activeOrders: number;
    totalCustomers: number;
    lowStockItems: number;
  };
  recentOrders: any[];
}

export function AdminClient({ stats, recentOrders }: AdminClientProps) {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card/40 backdrop-blur-md border-white/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">הכנסות חודשיות</CardTitle>
            <div className="p-2 bg-primary/10 rounded-md text-primary">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-mono font-bold">₪{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-green-400 flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +12.5% מהחודש שעבר
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-md border-white/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">הזמנות פתוחות</CardTitle>
            <div className="p-2 bg-blue-500/10 rounded-md text-blue-400">
              <ShoppingCart className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-mono font-bold">{stats.activeOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              הזמנות ממתינות או בטיפול
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-md border-white/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">לקוחות פעילים</CardTitle>
            <div className="p-2 bg-purple-500/10 rounded-md text-purple-400">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-mono font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-green-400 flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +2 לקוחות חדשים
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-md border-white/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">מלאי נמוך</CardTitle>
            <div className="p-2 bg-destructive/10 rounded-md text-destructive">
              <Package className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-mono font-bold text-destructive">{stats.lowStockItems}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <AlertCircle className="h-3 w-3 ml-1" />
              פריטים מתחת לנקודת הזמנה
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table */}
        <Card className="lg:col-span-2 bg-card/40 backdrop-blur-md border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>הזמנות אחרונות</CardTitle>
                <CardDescription>הזמנות שנכנסו למערכת בימים האחרונים</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader className="bg-black/40">
                <TableRow className="border-white/10">
                  <TableHead className="text-right">מספר</TableHead>
                  <TableHead className="text-right">לקוח</TableHead>
                  <TableHead className="text-right">תאריך</TableHead>
                  <TableHead className="text-right">סטטוס</TableHead>
                  <TableHead className="text-left">סכום</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.length === 0 ? (
                  <TableRow className="border-white/10">
                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">אין הזמנות חדשות</TableCell>
                  </TableRow>
                ) : (
                  recentOrders.map((order) => (
                    <TableRow key={order.id} className="border-white/10 hover:bg-white/5 cursor-pointer">
                      <TableCell className="font-mono">#{order.orderNumber}</TableCell>
                      <TableCell className="font-medium">{order.store?.name || 'לא ידוע'}</TableCell>
                      <TableCell className="text-muted-foreground">{format(new Date(order.createdAt), "dd/MM/yyyy")}</TableCell>
                      <TableCell>
                        {order.status === "pending" && <Badge variant="secondary">ממתין</Badge>}
                        {order.status === "processing" && <Badge className="bg-blue-500/20 text-blue-400">בטיפול</Badge>}
                        {order.status === "shipped" && <Badge className="bg-purple-500/20 text-purple-400">נשלח</Badge>}
                        {order.status === "delivered" && <Badge className="bg-green-500/20 text-green-400">נמסר</Badge>}
                        {order.status === "cancelled" && <Badge variant="destructive">בוטל</Badge>}
                      </TableCell>
                      <TableCell className="text-left font-mono font-bold">₪{Number(order.totalAmount).toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Quick Actions / Activity */}
        <Card className="bg-card/40 backdrop-blur-md border-white/10">
          <CardHeader>
            <CardTitle>פעילות מערכת</CardTitle>
            <CardDescription>עדכונים וסינכרון מלאי</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-3 rounded-lg bg-black/40 border border-white/5">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <div className="flex-1">
                <p className="text-sm font-medium">סינכרון מלאי מקומקס</p>
                <p className="text-xs text-muted-foreground mt-0.5">עודכן לאחרונה לפני 15 דקות</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-3 rounded-lg bg-black/40 border border-white/5">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">עדכון קטלוג מוצרים</p>
                <p className="text-xs text-muted-foreground mt-0.5">14 מוצרים חדשים נוספו</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 rounded-lg bg-black/40 border border-white/5">
              <div className="h-2 w-2 rounded-full bg-orange-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">לקוח ממתין לאישור</p>
                <p className="text-xs text-muted-foreground mt-0.5">חנות תל אביב בע״מ</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
