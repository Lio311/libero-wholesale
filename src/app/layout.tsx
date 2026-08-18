import type { Metadata, Viewport } from "next";
import { Heebo, IBM_Plex_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import { heIL } from '@clerk/localizations';
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={heIL}>
      <html
        lang="he"
        dir="rtl"
        className={`${heebo.variable} ${ibmMono.variable} h-full antialiased`}
      >
        <body className="h-[100dvh] overflow-hidden flex flex-col font-sans bg-background text-foreground select-none">
          {children}
          <Toaster position="top-center" richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}
