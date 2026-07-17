import type { Metadata } from "next";
import { Heebo, IBM_Plex_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';
import { heIL } from '@clerk/localizations';
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { CartSheet } from "@/components/CartSheet";
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
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress?.toLowerCase();
  const isAdmin = email === "lior31197@gmail.com";
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
        <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
          <TooltipProvider>
            <SidebarProvider>
              <AppSidebar isAdmin={isAdmin} />
              <main className="flex-1 w-full relative p-0 md:p-4 flex flex-col h-[100dvh] md:h-auto">
                <div className="relative flex items-center justify-between px-4 md:hidden border-b border-border/40 bg-card z-10 shrink-0 shadow-sm h-24">
                  <SidebarTrigger className="h-10 w-10 [&_svg]:size-6" />
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <img src="/libero-w.png" alt="Libero Logo" className="h-12 object-contain" />
                  </div>
                  <div className="w-10"></div>
                </div>
                <div className="bg-card w-full h-full md:rounded-[2.5rem] shadow-sm md:border border-border/40 overflow-y-auto relative flex-1">
                  {children}
                </div>
              </main>
              <CartSheet />
            </SidebarProvider>
          </TooltipProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
