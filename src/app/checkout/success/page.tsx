import { CheckCircle2, FileDown } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedSearchParams = await searchParams;
  const orderId = resolvedSearchParams.orderId as string | undefined;

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4">
      <div className="bg-green-500/10 p-5 rounded-full mb-6">
        <CheckCircle2 className="w-16 h-16 text-green-600" />
      </div>
      <h1 className="text-3xl font-bold mb-4 tracking-tight">ההזמנה התקבלה בהצלחה!</h1>
      <p className="text-base text-muted-foreground mb-8 max-w-md leading-relaxed">
        תודה רבה על הזמנתך. ההזמנה שלך התקבלה ונמצאת בטיפול. סיכום הזמנה מלא נשלח אליך למייל.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        {orderId && (
          <a
            href={`/api/orders/${orderId}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "outline", size: "default" }), "rounded-full font-semibold h-11 px-8 text-base")}
          >
            <FileDown className="ml-2 h-5 w-5" />
            הורד סיכום הזמנה
          </a>
        )}
        <Link 
          href="/catalog"
          className={cn(buttonVariants({ size: "default" }), "rounded-full font-semibold h-11 px-8 text-base")}
        >
          חזרה לקטלוג
        </Link>
      </div>
    </div>
  );
}
