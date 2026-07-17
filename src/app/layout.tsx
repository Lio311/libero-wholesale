import type { Metadata, Viewport } from "next";
import { Heebo, IBM_Plex_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';
import { heIL } from '@clerk/localizations';
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { CartSheet } from "@/components/CartSheet";
import { MobileHeader } from "@/components/MobileHeader";
import { OnboardingDialog } from "@/components/OnboardingDialog";
import { db } from "@/lib/db";
import { stores } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import { checkIsAdmin } from "@/lib/admin";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const heebo = Heebo({
  weight: ['300', '400', '500', '600', '700'],
  variable: "--font-sans",
  subsets: ["hebrew", "latin"],
});

const ibmMono = IBM_Plex_Mono({
  weight: ['400', '500', '600', '700'],
  variable: "--font-ibm-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ליברו סיטונאות - B2B Wholesale",
  description: "מערכת הזמנות סיטונאית מתקדמת לרשתות וחנויות קוסמטיקה. קטלוג עשיר, חיבור בזמן אמת למלאי ומערכת קומקס.",
  keywords: ["סיטונאות", "בשמים", "קוסמטיקה", "B2B", "ליברו", "הזמנות בסיטונאות"],
  authors: [{ name: "Libero" }],
  openGraph: {
    title: "ליברו סיטונאות - B2B Wholesale",
    description: "מערכת הזמנות סיטונאית לרשתות וחנויות.",
    url: "https://libero-wholesale.vercel.app",
    siteName: "ליברו סיטונאות",
    images: [
      {
        url: "/libero-logo3.jpg",
        width: 800,
        height: 600,
      },
    ],
    locale: "he_IL",
    type: "website",
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress?.toLowerCase();
  const isAdmin = await checkIsAdmin(email);

  let requiresOnboarding = false;
  let isPendingApproval = false;
  let pendingStoresCount = 0;

  if (isAdmin) {
    const pendingStoresResult = await db.select({ count: count() }).from(stores).where(eq(stores.status, 'pending'));
    pendingStoresCount = pendingStoresResult[0].count;
  }

  if (user && !isAdmin) {
    const storeRecord = await db.select().from(stores).where(eq(stores.clerkUserId, user.id)).limit(1);
    if (storeRecord.length === 0) {
      requiresOnboarding = true;
    } else if (storeRecord[0].status === 'pending') {
      isPendingApproval = true;
    }
  }
  return (
    <ClerkProvider 
      localization={heIL}
      appearance={{
        elements: {
          formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
          card: "bg-card border border-border shadow-xl",
          headerTitle: "text-foreground font-bold",
          headerSubtitle: "text-muted-foreground",
          dividerText: "text-muted-foreground",
          formFieldLabel: "text-foreground",
          formFieldInput: "bg-background border-border text-foreground focus:ring-primary",
          footerActionText: "text-muted-foreground",
          footerActionLink: "text-primary hover:text-primary/90"
        }
      }}
    >
      <html
        lang="he"
        dir="rtl"
        className={`${heebo.variable} ${ibmMono.variable} h-full antialiased`}
      >
        <body className="h-[100dvh] overflow-hidden flex flex-col font-sans bg-background text-foreground select-none">
          <TooltipProvider>
            <SidebarProvider>
              <AppSidebar isAdmin={isAdmin} pendingStoresCount={pendingStoresCount} />
              <main className="flex-1 w-full relative p-0 md:p-4 flex flex-col h-[100dvh]">
                <MobileHeader />
                <div id="main-scroll-area" className="bg-card w-full h-full md:rounded-[2.5rem] shadow-sm md:border border-border/40 overflow-y-auto relative flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  <div className={`h-full min-h-max ${isPendingApproval ? 'filter blur-sm pointer-events-none select-none opacity-50' : ''}`}>
                    {children}
                  </div>
                  {isPendingApproval && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-background/20 backdrop-blur-sm">
                      <div className="bg-card p-8 rounded-2xl border border-border shadow-2xl text-center max-w-md w-full animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 6v6l4 2"/></svg>
                        </div>
                        <h2 className="text-2xl font-bold mb-2">החשבון ממתין לאישור</h2>
                        <p className="text-muted-foreground text-sm">
                          קיבלנו את פרטי העסק שלך. לאחר בחינה ואישור מצד הנהלת האתר, תיפתח עבורך הגישה לקטלוג הסיטונאי המלא ולאפשרות ביצוע ההזמנות. נעדכן אותך במייל ברגע שזה יקרה!
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </main>
              <CartSheet />
              {requiresOnboarding && <OnboardingDialog open={true} defaultEmail={email} />}
              <Toaster position="top-center" richColors />
            </SidebarProvider>
          </TooltipProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
