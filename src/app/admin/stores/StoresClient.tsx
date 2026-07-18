"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ShieldAlert, ShieldCheck, User } from "lucide-react";
import { format } from "date-fns";
import { toggleUserRole } from "./actions";
import { toast } from "sonner";
import Image from "next/image";

interface UserRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: Date;
  imageUrl: string;
}

interface StoresClientProps {
  users: UserRow[];
}

export function StoresClient({ users: initialUsers }: StoresClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredUsers = initialUsers.filter(u => 
    u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleRole = (userId: string, currentRole: string) => {
    startTransition(async () => {
      const result = await toggleUserRole(userId, currentRole);
      if (result.success) {
        toast.success(`הרשאת המשתמש שונתה ל-${result.newRole === 'admin' ? 'מנהל' : 'לקוח'}`);
      } else {
        toast.error("אירעה שגיאה בעדכון הרשאת המשתמש");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="חיפוש משתמש (שם, אימייל)..." 
            className="pr-9 bg-card border-border"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle>רשימת משתמשים רשומים</CardTitle>
          <CardDescription>סה״כ {filteredUsers.length} משתמשים במערכת</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="border-border">
                  <TableHead className="text-right">משתמש</TableHead>
                  <TableHead className="text-right">אימייל</TableHead>
                  <TableHead className="text-right">תאריך הרשמה</TableHead>
                  <TableHead className="text-right">הרשאה (Role)</TableHead>
                  <TableHead className="text-center w-[150px]">פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow className="border-border">
                    <TableCell colSpan={5} className="text-center h-32 text-muted-foreground">לא נמצאו משתמשים</TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => {
                    const isAdmin = user.role === "admin";
                    
                    return (
                      <TableRow key={user.id} className="border-border hover:bg-muted/20 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full overflow-hidden bg-muted flex items-center justify-center shrink-0">
                              {user.imageUrl ? (
                                <Image src={user.imageUrl} alt={user.firstName} width={32} height={32} className="h-full w-full object-cover" />
                              ) : (
                                <User className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium text-foreground">{user.firstName} {user.lastName}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-muted-foreground">{user.email}</span>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {format(new Date(user.createdAt), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell>
                          {isAdmin ? (
                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">מנהל (Admin)</Badge>
                          ) : (
                            <Badge variant="secondary">לקוח</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className={`w-full ${isAdmin ? 'text-orange-400 hover:text-orange-500 hover:bg-orange-500/10 border-orange-500/20' : 'text-blue-400 hover:text-blue-500 hover:bg-blue-500/10 border-blue-500/20'}`}
                            onClick={() => handleToggleRole(user.id, user.role)}
                            disabled={isPending}
                          >
                            {isAdmin ? (
                              <>
                                <ShieldAlert className="h-4 w-4 ml-2" />
                                הסר ניהול
                              </>
                            ) : (
                              <>
                                <ShieldCheck className="h-4 w-4 ml-2" />
                                הפוך למנהל
                              </>
                            )}
                          </Button>
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
