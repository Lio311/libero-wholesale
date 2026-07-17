import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="bg-green-500/10 p-8 rounded-full mb-8">
        <CheckCircle2 className="w-24 h-24 text-green-600" />
      </div>
      <h1 className="text-5xl font-bold mb-6 tracking-tight">ההזמנה התקבלה בהצלחה!</h1>
      <p className="text-xl text-muted-foreground mb-10 max-w-lg leading-relaxed">
        תודה רבה על הזמנתך. ההזמנה שלך התקבלה ונמצאת בטיפול. סיכום הזמנה מלא נשלח אליך למייל.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Button asChild size="lg" className="rounded-full font-bold h-14 px-8 text-lg">
          <Link href="/catalog">חזרה לקטלוג</Link>
        </Button>
      </div>
    </div>
  );
}
