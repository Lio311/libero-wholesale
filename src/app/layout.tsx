import type { Metadata } from "next";
import { IBM_Plex_Sans_Hebrew, IBM_Plex_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import "./globals.css";

const ibmPlexHebrew = IBM_Plex_Sans_Hebrew({
  weight: ['100', '200', '300', '400', '500', '600', '700'],
  variable: "--font-ibm-plex-hebrew",
  subsets: ["hebrew", "latin"],
});

const ibmMono = IBM_Plex_Mono({
  weight: ['400', '500', '600', '700'],
  variable: "--font-ibm-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Libero Wholesale",
  description: "B2B Wholesale Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="he"
        dir="rtl"
        className={`${ibmPlexHebrew.variable} ${ibmMono.variable} h-full antialiased dark`}
      >
        <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
          <TooltipProvider>
            <SidebarProvider>
              <AppSidebar />
              <main className="flex-1 w-full relative">
                <div className="absolute top-4 right-4 md:hidden">
                  <SidebarTrigger />
                </div>
                {children}
              </main>
            </SidebarProvider>
          </TooltipProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
