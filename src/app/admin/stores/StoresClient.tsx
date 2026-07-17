"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Store, MoreHorizontal, CheckCircle2, XCircle, CreditCard } from "lucide-react";
import { format } from "date-fns";

interface StoreRow {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  creditLimit: string | number;
  currentBalance: string | number;
  status: "active" | "pending" | "suspended";
  createdAt: Date;
}

interface StoresClientProps {
  stores: StoreRow[];
}

export function StoresClient({ stores: initialStores }: StoresClientProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStores = initialStores.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="חיפוש חנות, איש קשר או אימייל..." 
            className="pr-9 bg-card/40 border-white/10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="bg-card/40 backdrop-blur-md border-white/10">
        <CardHeader className="pb-2">
          <CardTitle>רשימת לקוחות B2B</CardTitle>
          <CardDescription>סה״כ {filteredStores.length} חנויות רשומות</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-white/10 overflow-hidden">
            <Table>
              <TableHeader className="bg-black/40">
                <TableRow className="border-white/10">
                  <TableHead className="text-right">חנות ואיש קשר</TableHead>
                  <TableHead className="text-right">פרטי התקשרות</TableHead>
                  <TableHead className="text-right">סטטוס</TableHead>
                  <TableHead className="text-right">תאריך הרשמה</TableHead>
                  <TableHead className="text-left">מסגרת / ניצול</TableHead>
                  <TableHead className="text-center w-[100px]">פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStores.length === 0 ? (
                  <TableRow className="border-white/10">
                    <TableCell colSpan={6} className="text-center h-32 text-muted-foreground">לא נמצאו לקוחות</TableCell>
                  </TableRow>
                ) : (
                  filteredStores.map((store) => {
                    const balance = Number(store.currentBalance);
                    const limit = Number(store.creditLimit);
                    const utilization = limit > 0 ? (balance / limit) * 100 : 0;
                    
                    return (
                      <TableRow key={store.id} className="border-white/10 hover:bg-white/5 transition-colors">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-primary">{store.name}</span>
                            <span className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Store className="h-3 w-3" />
                              {store.contactName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col text-sm">
                            <span className="font-mono">{store.phone}</span>
                            <span className="text-muted-foreground">{store.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {store.status === "active" && <Badge className="bg-green-500/20 text-green-400 border-green-500/50">פעיל</Badge>}
                          {store.status === "pending" && <Badge variant="secondary">ממתין לאישור</Badge>}
                          {store.status === "suspended" && <Badge variant="destructive">מוקפא</Badge>}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {format(new Date(store.createdAt), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell className="text-left">
                          <div className="flex flex-col items-end">
                            <span className="font-mono text-sm">₪{balance.toLocaleString()} / ₪{limit.toLocaleString()}</span>
                            <div className="h-1.5 w-24 bg-white/10 rounded-full mt-1.5 overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${utilization > 90 ? 'bg-destructive' : utilization > 75 ? 'bg-orange-500' : 'bg-primary'}`} 
                                style={{ width: `${Math.min(utilization, 100)}%` }} 
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            {store.status === "pending" && (
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-green-400 hover:text-green-300 hover:bg-green-400/10" title="אשר לקוח">
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white" title="הגדרות אשראי">
                              <CreditCard className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
