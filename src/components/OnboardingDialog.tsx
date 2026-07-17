"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Building2, Loader2 } from "lucide-react";
import { submitOnboarding } from "@/app/actions/onboarding";
import { useRouter } from "next/navigation";

export function OnboardingDialog({ open, onOpenChange, defaultEmail }: { open: boolean, onOpenChange?: (open: boolean) => void, defaultEmail?: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const res = await submitOnboarding(formData);

    if (res.error) {
      setError(res.error);
      setIsLoading(false);
    } else {
      router.refresh();
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] bg-card border-border/50 rounded-3xl shadow-2xl p-6">
        <DialogHeader className="text-center flex flex-col items-center">
          <div className="bg-primary/10 p-3 rounded-2xl mb-3">
            <Building2 className="w-10 h-10 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-bold mb-1 tracking-tight">הגדר את העסק שלך</DialogTitle>
          <DialogDescription className="text-center text-sm mt-1">
            מלא את פרטי העסק כדי לפתוח חשבון סיטונאי ולהתחיל להזמין ישירות מהמערכת.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="businessName" className="text-right block w-full text-sm font-medium">שם העסק / החברה</Label>
              <Input id="businessName" name="businessName" required className="rounded-xl h-12 bg-background border-border/60 text-right text-sm px-3 shadow-sm" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contactName" className="text-right block w-full text-sm font-medium">שם איש קשר</Label>
              <Input id="contactName" name="contactName" required className="rounded-xl h-12 bg-background border-border/60 text-right text-sm px-3 shadow-sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-right block w-full text-sm font-medium">אימייל (לקבלת חשבוניות)</Label>
              <Input id="email" name="email" type="email" required defaultValue={defaultEmail || ""} className="rounded-xl h-12 bg-background border-border/60 text-right text-sm px-3 shadow-sm" dir="ltr" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-right block w-full text-sm font-medium">טלפון נייד</Label>
              <Input id="phone" name="phone" type="tel" required className="rounded-xl h-12 bg-background border-border/60 text-right text-sm px-3 shadow-sm" dir="ltr" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address" className="text-right block w-full text-sm font-medium">כתובת מלאה למשלוחים</Label>
            <Input id="address" name="address" required className="rounded-xl h-12 bg-background border-border/60 text-right text-sm px-3 shadow-sm" />
          </div>

          {error && <p className="text-sm text-destructive font-medium text-center">{error}</p>}

          <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-xl text-base font-bold mt-2 shadow-md hover:shadow-lg transition-all">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            שלח בקשה לפתיחת חשבון
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
