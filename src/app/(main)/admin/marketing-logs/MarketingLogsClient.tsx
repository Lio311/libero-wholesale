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
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Store = {
  id: string;
  name: string;
  email: string;
};

type Log = {
  id: string;
  type: string;
  recipientEmail: string;
  subject: string;
  sentAt: Date;
  store: Store | null;
};

const TYPE_LABELS: Record<string, string> = {
  admin: "למנהל",
  customer: "ללקוח",
  marketing: "דיוור שיווקי",
};

export function MarketingLogsClient({ initialLogs }: { initialLogs: Log[] }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredLogs = initialLogs.filter((log) => {
    let matchesSearch = true;
    if (search) {
      const term = search.toLowerCase();
      const storeName = log.store?.name?.toLowerCase() || "";
      const email = log.recipientEmail.toLowerCase();
      const subj = log.subject.toLowerCase();
      matchesSearch = storeName.includes(term) || email.includes(term) || subj.includes(term);
    }
    
    let matchesType = true;
    if (typeFilter !== "all") {
      matchesType = log.type === typeFilter;
    }

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center gap-4 max-w-2xl">
        <div className="flex items-center gap-2 w-full sm:w-1/2 relative">
          <Search className="h-4 w-4 text-muted-foreground absolute right-3" />
          <Input
            placeholder="חיפוש לפי שם, אימייל או נושא..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-9"
          />
        </div>
        <div className="w-full sm:w-1/2">
          <Select value={typeFilter} onValueChange={(val) => setTypeFilter(val as string)}>
            <SelectTrigger>
              <SelectValue placeholder="סנן לפי סוג">{typeFilter === "all" ? "כל המיילים" : TYPE_LABELS[typeFilter]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל המיילים</SelectItem>
              <SelectItem value="marketing">דיוור שיווקי</SelectItem>
              <SelectItem value="customer">ללקוחות (הזמנות וכו')</SelectItem>
              <SelectItem value="admin">למנהל (התראות)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">תאריך ושעה</TableHead>
              <TableHead className="text-right">סוג</TableHead>
              <TableHead className="text-right">נושא</TableHead>
              <TableHead className="text-right">נמען</TableHead>
              <TableHead className="text-right">חנות (אם רלוונטי)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  לא נמצאו מיילים
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    {format(new Date(log.sentAt), "dd/MM/yyyy HH:mm", { locale: he })}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground">
                      {TYPE_LABELS[log.type] || log.type}
                    </span>
                  </TableCell>
                  <TableCell>{log.subject}</TableCell>
                  <TableCell dir="ltr" className="text-right">
                    {log.recipientEmail}
                  </TableCell>
                  <TableCell className="font-medium">
                    {log.store?.name || "-"}
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
            לא נמצאו מיילים
          </div>
        ) : (
          filteredLogs.map((log) => (
            <Card key={log.id}>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-semibold">{log.subject}</span>
                    <span className="inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground">
                      {TYPE_LABELS[log.type] || log.type}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground" dir="ltr" style={{ textAlign: 'right' }}>
                    {log.recipientEmail}
                  </div>
                  {log.store && (
                    <div className="text-sm text-muted-foreground">
                      חנות: {log.store.name}
                    </div>
                  )}
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
