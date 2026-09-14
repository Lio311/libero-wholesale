"use client";

import { useState } from "react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

type Store = {
  id: string;
  name: string;
  email: string;
};

type Log = {
  id: string;
  sentAt: Date;
  store: Store | null;
};

export function MarketingLogsClient({ initialLogs }: { initialLogs: Log[] }) {
  const [search, setSearch] = useState("");

  const filteredLogs = initialLogs.filter((log) => {
    if (!search) return true;
    const term = search.toLowerCase();
    const storeName = log.store?.name?.toLowerCase() || "";
    const storeEmail = log.store?.email?.toLowerCase() || "";
    return storeName.includes(term) || storeEmail.includes(term);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 max-w-sm">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="חיפוש לפי שם חנות או אימייל..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Desktop View */}
      <div className="hidden md:block rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">תאריך ושעה</TableHead>
              <TableHead className="text-right">חנות</TableHead>
              <TableHead className="text-right">אימייל</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  לא נמצאו דיוורים
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    {format(new Date(log.sentAt), "dd/MM/yyyy HH:mm", { locale: he })}
                  </TableCell>
                  <TableCell className="font-medium">
                    {log.store?.name || "חנות מחוקה"}
                  </TableCell>
                  <TableCell dir="ltr" className="text-right">
                    {log.store?.email || "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border rounded-md">
            לא נמצאו דיוורים
          </div>
        ) : (
          filteredLogs.map((log) => (
            <Card key={log.id}>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-lg">{log.store?.name || "חנות מחוקה"}</span>
                  </div>
                  <div className="text-sm text-muted-foreground" dir="ltr" style={{ textAlign: 'right' }}>
                    {log.store?.email}
                  </div>
                  <div className="text-sm mt-2 pt-2 border-t text-muted-foreground flex items-center justify-between">
                    <span>נשלח ב:</span>
                    <span dir="ltr">{format(new Date(log.sentAt), "dd/MM/yyyy HH:mm", { locale: he })}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
