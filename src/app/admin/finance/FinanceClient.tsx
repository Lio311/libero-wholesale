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
  paymentTerms: string;
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
        <Card className="bg-card/40 backdrop-blur-md border-white/10">
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

        <Card className="bg-card/40 backdrop-blur-md border-white/10">
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

        <Card className="bg-card/40 backdrop-blur-md border-white/10">
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
                <div key={store.id} className="flex justify-between items-center bg-black/20 p-2 rounded-md">
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
      <Card className="bg-card/40 backdrop-blur-md border-white/10">
        <CardHeader>
          <CardTitle>דוח אובליגו לקוחות</CardTitle>
          <CardDescription>מצב פיננסי ותנאי תשלום ברמת לקוח</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-white/10 overflow-hidden">
            <Table>
              <TableHeader className="bg-black/40">
                <TableRow className="border-white/10">
                  <TableHead className="text-right">לקוח</TableHead>
                  <TableHead className="text-right">תנאי תשלום</TableHead>
                  <TableHead className="text-left">מסגרת אשראי</TableHead>
                  <TableHead className="text-left">יתרה לניצול</TableHead>
                  <TableHead className="text-left">חוב פתוח (אובליגו)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stores.length === 0 ? (
                  <TableRow className="border-white/10">
                    <TableCell colSpan={5} className="text-center h-32 text-muted-foreground">אין נתונים פיננסיים</TableCell>
                  </TableRow>
                ) : (
                  stores.map((store) => {
                    const balance = Number(store.currentBalance);
                    const limit = Number(store.creditLimit);
                    const available = Math.max(0, limit - balance);
                    
                    return (
                      <TableRow key={store.id} className="border-white/10 hover:bg-white/5 transition-colors">
                        <TableCell className="font-medium">{store.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-white/10 bg-white/5 text-muted-foreground">
                            {store.paymentTerms}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-left font-mono">₪{limit.toLocaleString()}</TableCell>
                        <TableCell className="text-left font-mono text-green-400">₪{available.toLocaleString()}</TableCell>
                        <TableCell className="text-left font-mono font-bold text-primary">₪{balance.toLocaleString()}</TableCell>
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
