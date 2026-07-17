"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, User, Phone, Mail, MapPin, CreditCard, Wallet, FileSignature } from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";

interface StoreData {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  creditLimit: string | number;
  currentBalance: string | number;
  paymentTerms: string | null;
  status: "active" | "pending" | "suspended";
}

interface AccountClientProps {
  store: StoreData | null;
}

export function AccountClient({ store }: AccountClientProps) {
  const { user } = useUser();

  if (!store) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Building2 className="h-16 w-16 text-muted-foreground opacity-50 mb-4" />
        <h2 className="text-xl font-semibold mb-2">לא נמצא חשבון מקושר</h2>
        <p className="text-muted-foreground text-center max-w-md">
          המשתמש שלך עדיין לא מקושר לחנות סיטונאית במערכת. אנא פנה לשירות הלקוחות או להנהלה כדי לקשר את החשבון.
        </p>
      </div>
    );
  }

  const availableCredit = Number(store.creditLimit) - Number(store.currentBalance);
  const creditPercentage = Math.min(100, (Number(store.currentBalance) / Number(store.creditLimit)) * 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Main Info */}
      <Card className="md:col-span-2 bg-card/40 backdrop-blur-md border-white/10">
        <CardHeader className="flex flex-row items-start justify-between pb-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <CardTitle className="text-2xl">{store.name}</CardTitle>
              {store.status === "active" && <Badge className="bg-green-500/20 text-green-400 border-green-500/50">פעיל</Badge>}
              {store.status === "pending" && <Badge variant="secondary">בהמתנה</Badge>}
              {store.status === "suspended" && <Badge variant="destructive">מוקפא</Badge>}
            </div>
            <CardDescription>פרטי העסק ואיש קשר</CardDescription>
          </div>
          <div className="p-1 bg-white/5 rounded-full border border-white/10">
            <UserButton appearance={{ elements: { userButtonAvatarBox: "h-12 w-12" } }} />
          </div>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-6 mt-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-lg text-primary">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">איש קשר</p>
              <p className="font-medium">{store.contactName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-lg text-primary">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">טלפון</p>
              <p className="font-medium font-mono">{store.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-lg text-primary">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">אימייל</p>
              <p className="font-medium">{store.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-lg text-primary">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">כתובת למשלוח</p>
              <p className="font-medium">{store.address}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Info */}
      <div className="flex flex-col gap-6">
        <Card className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-md border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-32 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              אובליגו (יתרת חוב)
            </CardDescription>
            <CardTitle className="text-3xl font-mono">₪{Number(store.currentBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">ניצול מסגרת</span>
                <span className="font-mono">{creditPercentage.toFixed(1)}%</span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${creditPercentage > 90 ? 'bg-destructive' : creditPercentage > 75 ? 'bg-orange-500' : 'bg-primary'}`}
                  style={{ width: `${creditPercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-xs mt-1.5 text-muted-foreground">
                <span>זמין: ₪{availableCredit.toLocaleString('en-US')}</span>
                <span>מסגרת: ₪{Number(store.creditLimit).toLocaleString('en-US')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-md border-white/10">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <FileSignature className="h-4 w-4" />
              תנאי תשלום
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium">{store.paymentTerms || "לא הוגדרו תנאי תשלום"}</div>
            <p className="text-xs text-muted-foreground mt-1">יש לפנות להנהלת חשבונות לשינוי תנאים</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
