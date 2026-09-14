"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, CreditCard, TrendingUp, AlertCircle, FileText } from "lucide-react";

interface FinanceStoreRow {
  id: string;
  name: string;
  creditLimit: string | number;
  currentBalance: string | number;
  paymentTerms: string | null;
}

interface FinanceClientProps {
  stores: FinanceStoreRow[];
  totalReceivables: number;
  totalCreditExposure: number;
}

export function FinanceClient({ stores, totalReceivables, totalCreditExposure }: FinanceClientProps) {
  const utilizedCreditPercentage = totalCreditExposure > 0 
    ? (totalReceivables / totalCreditExposure) * 100 
    : 0;

  const storesOverLimit = stores.filter(s => Number(s.currentBalance) >= Number(s.creditLimit) * 0.9);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">סך חובות פתוחים (אובליגו)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-mono font-bold text-primary">₪{totalReceivables.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <DollarSign className="h-3 w-3 ml-1" />
              כספים שטרם נגבו
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">סך מסגרות אשראי שהוקצו</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-mono font-bold">₪{totalCreditExposure.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <CreditCard className="h-3 w-3 ml-1" />
              חשיפת אשראי מקסימלית
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">ניצול אשראי כולל</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-mono font-bold">{utilizedCreditPercentage.toFixed(1)}%</div>
            <div className="h-1.5 w-full bg-white/10 rounded-full mt-2 overflow-hidden">
              <div 
                className={`h-full rounded-full ${utilizedCreditPercentage > 80 ? 'bg-destructive' : 'bg-primary'}`} 
                style={{ width: `${Math.min(utilizedCreditPercentage, 100)}%` }} 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stores Over Limit Alert */}
      {storesOverLimit.length > 0 && (
        <Card className="border-orange-500/50 bg-orange-500/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-orange-500 flex items-center text-lg">
              <AlertCircle className="h-5 w-5 ml-2" />
              לקוחות בחריגת אשראי או קרובים למקסימום (מעל 90%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mt-2">
              {storesOverLimit.map(store => (
                <div key={store.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-muted/30 p-2 rounded-md gap-1">
                  <span className="font-medium">{store.name}</span>
                  <div className="font-mono text-sm flex gap-4">
                    <span>ניצול: ₪{Number(store.currentBalance).toLocaleString()}</span>
                    <span className="text-muted-foreground">מסגרת: ₪{Number(store.creditLimit).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Finance Table */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle>דוח אובליגו לקוחות</CardTitle>
          <CardDescription>מצב פיננסי ותנאי תשלום ברמת לקוח</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border overflow-x-auto hidden md:block">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="border-border">
                  <TableHead className="text-right">לקוח</TableHead>
                  <TableHead className="text-right">תנאי תשלום</TableHead>
                  <TableHead className="text-right">מסגרת אשראי</TableHead>
                  <TableHead className="text-right">יתרה לניצול</TableHead>
                  <TableHead className="text-right">חוב פתוח (אובליגו)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stores.length === 0 ? (
                  <TableRow className="border-border">
                    <TableCell colSpan={5} className="text-center h-32 text-muted-foreground">אין נתונים פיננסיים</TableCell>
                  </TableRow>
                ) : (
                  stores.map((store) => {
                    const balance = Number(store.currentBalance);
                    const limit = Number(store.creditLimit);
                    const available = Math.max(0, limit - balance);
                    
                    return (
                      <TableRow key={store.id} className="border-border hover:bg-muted/20 transition-colors">
                        <TableCell className="font-medium">{store.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-border bg-muted/20 text-muted-foreground">
                            {store.paymentTerms}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">₪{limit.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-mono text-green-400">₪{available.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-mono font-bold text-primary">₪{balance.toLocaleString()}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="md:hidden flex flex-col gap-3">
            {stores.length === 0 ? (
              <div className="text-center p-6 text-muted-foreground border border-border rounded-lg">אין נתונים פיננסיים</div>
            ) : (
              stores.map((store) => {
                const balance = Number(store.currentBalance);
                const limit = Number(store.creditLimit);
                const available = Math.max(0, limit - balance);
                
                return (
                  <div key={store.id} className="p-4 border border-border rounded-lg bg-card/50 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div className="font-medium">{store.name}</div>
                      <Badge variant="outline" className="border-border bg-muted/20 text-muted-foreground">
                        {store.paymentTerms}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm mt-1">
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-xs">מסגרת אשראי</span>
                        <span className="font-mono">₪{limit.toLocaleString()}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-muted-foreground text-xs">יתרה לניצול</span>
                        <span className="font-mono text-green-400">₪{available.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-border/50">
                      <span className="text-sm font-medium text-muted-foreground">חוב פתוח</span>
                      <span className="font-mono font-bold text-primary">₪{balance.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
