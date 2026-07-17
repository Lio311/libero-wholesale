"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Building2, Loader2 } from "lucide-react";
import { submitOnboarding } from "@/app/actions/onboarding";
import { useRouter } from "next/navigation";

export function OnboardingDialog({ open, defaultEmail }: { open: boolean, defaultEmail?: string }) {
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

  // Prevent closing by returning false on open change if we want it strictly modal, 
  // but since we render it unconditionally based on `open` prop, 
  // the shadcn dialog will try to close on escape or outside click.
  // We can prevent that by empty onOpenChange handler.
  const handleOpenChange = (newOpen: boolean) => {
    // do nothing to prevent closing
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-card border-border/50 rounded-3xl shadow-2xl p-8" hideCloseButton>
        <DialogHeader className="text-center flex flex-col items-center">
          <div className="bg-primary/10 p-4 rounded-2xl mb-4">
            <Building2 className="w-12 h-12 text-primary" />
          </div>
          <DialogTitle className="text-3xl font-bold mb-2 tracking-tight">הגדר את העסק שלך</DialogTitle>
          <DialogDescription className="text-center text-lg mt-2">
            מלא את פרטי העסק כדי לפתוח חשבון סיטונאי ולהתחיל להזמין ישירות מהמערכת.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="mt-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="businessName" className="text-right block w-full font-medium">שם העסק / החברה</Label>
              <Input id="businessName" name="businessName" required className="rounded-2xl h-14 bg-background border-border/60 text-right text-base px-4 shadow-sm" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactName" className="text-right block w-full font-medium">שם איש קשר</Label>
              <Input id="contactName" name="contactName" required className="rounded-2xl h-14 bg-background border-border/60 text-right text-base px-4 shadow-sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-right block w-full font-medium">אימייל (לקבלת חשבוניות)</Label>
              <Input id="email" name="email" type="email" required defaultValue={defaultEmail || ""} className="rounded-2xl h-14 bg-background border-border/60 text-right text-base px-4 shadow-sm" dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-right block w-full font-medium">טלפון נייד</Label>
              <Input id="phone" name="phone" type="tel" required className="rounded-2xl h-14 bg-background border-border/60 text-right text-base px-4 shadow-sm" dir="ltr" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-right block w-full font-medium">כתובת מלאה למשלוחים</Label>
            <Input id="address" name="address" required className="rounded-2xl h-14 bg-background border-border/60 text-right text-base px-4 shadow-sm" />
          </div>

          {error && <p className="text-sm text-destructive font-medium text-center">{error}</p>}

          <Button type="submit" disabled={isLoading} className="w-full h-14 rounded-2xl text-lg font-bold mt-4 shadow-md hover:shadow-lg transition-all">
            {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            שלח בקשה לפתיחת חשבון
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
