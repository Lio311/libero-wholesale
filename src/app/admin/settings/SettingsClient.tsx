"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SettingsClient() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    business_name: "",
    phone: "",
    address: "",
    min_order: "",
    logo_url: "",
    admin_emails: ""
  });
  const router = useRouter();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error("Failed to fetch settings", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      
      if (res.ok) {
        toast.success("ההגדרות נשמרו בהצלחה!");
        router.refresh();
      } else {
        toast.error("שגיאה בשמירת הגדרות");
      }
    } catch (error) {
      console.error("Save error", error);
      toast.error("שגיאה בשמירת הגדרות");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">פרטי עסק בסיסיים</CardTitle>
          <CardDescription>
            הגדרות אלו ישפיעו על התצוגה באתר, בתפריטים ובחשבוניות.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>שם העסק</Label>
            <Input 
              name="business_name" 
              value={settings.business_name || ""} 
              onChange={handleChange} 
              placeholder="לדוגמה: Libero Wholesale" 
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>טלפון לשירות לקוחות</Label>
              <Input 
                name="phone" 
                value={settings.phone || ""} 
                onChange={handleChange} 
                placeholder="05X-XXXXXXX" 
                dir="ltr"
              />
            </div>
            
            <div className="space-y-2">
              <Label>סכום מינימום להזמנה (₪)</Label>
              <Input 
                name="min_order" 
                type="number"
                value={settings.min_order || ""} 
                onChange={handleChange} 
                placeholder="לדוגמה: 500" 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>כתובת העסק</Label>
            <Input 
              name="address" 
              value={settings.address || ""} 
              onChange={handleChange} 
              placeholder="רחוב, עיר, מיקוד" 
            />
          </div>
          
          <div className="space-y-2">
            <Label>URL לוגו (אופציונלי)</Label>
            <Input 
              name="logo_url" 
              value={settings.logo_url || ""} 
              onChange={handleChange} 
              placeholder="https://..." 
              dir="ltr"
            />
            <p className="text-xs text-muted-foreground">השאר ריק כדי להשתמש בלוגו ברירת המחדל של המערכת.</p>
          </div>

          <div className="space-y-2 border-t pt-4 mt-4">
            <Label>אימיילים של מנהלי מערכת (מופרדים בפסיקים)</Label>
            <Input 
              name="admin_emails" 
              value={settings.admin_emails || ""} 
              onChange={handleChange} 
              placeholder="admin@example.com, user@example.com" 
              dir="ltr"
            />
            <p className="text-xs text-muted-foreground">משתמשים אלו יקבלו גישה מלאה לממשק הניהול. lior31197@gmail.com הוא מנהל תמיד.</p>
          </div>
          
          <Button 
            onClick={handleSave} 
            className="w-full mt-6" 
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
            שמור הגדרות
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
