"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, User, Phone, Mail, MapPin, CreditCard, Wallet, FileSignature } from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { OnboardingDialog } from "@/components/OnboardingDialog";

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

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isMissingStore = !store;
  const [showOnboarding, setShowOnboarding] = useState(isMissingStore);

  useEffect(() => {
    setShowOnboarding(isMissingStore);
  }, [isMissingStore]);

  const displayStore = store || {
    id: "placeholder",
    name: "שם העסק",
    contactName: "-",
    phone: "-",
    email: "-",
    address: "-",
    creditLimit: 0,
    currentBalance: 0,
    paymentTerms: "לא הוגדרו",
    status: "pending" as const
  };

  const availableCredit = Number(displayStore.creditLimit) - Number(displayStore.currentBalance);
  const creditLimitNum = Number(displayStore.creditLimit);
  const creditPercentage = creditLimitNum > 0 ? Math.min(100, (Number(displayStore.currentBalance) / creditLimitNum) * 100) : 0;

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 relative ${isMissingStore ? 'opacity-50 blur-sm pointer-events-none select-none' : ''}`}>
      {/* Main Info */}
      <Card className="md:col-span-2 bg-card border-border shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between pb-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <CardTitle className="text-2xl">{displayStore.name}</CardTitle>
              {displayStore.status === "active" && <Badge className="bg-green-500/20 text-green-400 border-green-500/50">פעיל</Badge>}
              {displayStore.status === "pending" && <Badge variant="secondary">בהמתנה</Badge>}
              {displayStore.status === "suspended" && <Badge variant="destructive">מוקפא</Badge>}
            </div>
            <CardDescription>פרטי העסק ואיש קשר</CardDescription>
          </div>
          <div className="p-1 bg-muted/20 rounded-full border border-border">
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
              <p className="font-medium">{displayStore.contactName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-lg text-primary">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">טלפון</p>
              <p className="font-medium font-mono">{displayStore.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-lg text-primary">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">אימייל</p>
              <p className="font-medium">{displayStore.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-lg text-primary">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">כתובת למשלוח</p>
              <p className="font-medium">{displayStore.address}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Info */}
      <div className="flex flex-col gap-6">
        <Card className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-md border-border relative overflow-hidden">
          <div className="absolute top-0 right-0 p-32 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              אובליגו (יתרת חוב)
            </CardDescription>
            <CardTitle className="text-3xl font-mono">₪{Number(displayStore.currentBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })}</CardTitle>
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
                <span>מסגרת: ₪{creditLimitNum.toLocaleString('en-US')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <FileSignature className="h-4 w-4" />
              תנאי תשלום
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium">{displayStore.paymentTerms || "לא הוגדרו תנאי תשלום"}</div>
            <p className="text-xs text-muted-foreground mt-1">יש לפנות להנהלת חשבונות לשינוי תנאים</p>
          </CardContent>
        </Card>
      </div>

      <OnboardingDialog open={showOnboarding} onOpenChange={setShowOnboarding} defaultEmail={user?.primaryEmailAddress?.emailAddress || ""} />
    </div>
  );
}
