import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

import StoreProvider from '@/providers/StoreProvider';

export const metadata: Metadata = {
  title: "SBN Sentinel",
  description: "Platform Foundation",
};

import { ErrorScreen } from '@/components/CommandCenter/ErrorScreen';

// SDS-D9: Localization/RTL readiness contract
const uiLocale = {
  locale: process.env.NEXT_PUBLIC_LOCALE || 'en',
  dir: (process.env.NEXT_PUBLIC_DIR || 'ltr') as 'ltr' | 'rtl'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={uiLocale.locale} dir={uiLocale.dir} className="dark">
      <body className={`${inter.className} antialiased bg-[var(--color-canvas)] text-[var(--color-text-primary)]`}>
        <StoreProvider>
          <ErrorScreen>
            <div className="min-h-screen relative w-full overflow-hidden animate-fade-in">
              {children}
            </div>
          </ErrorScreen>
        </StoreProvider>
      </body>
    </html>
  );
}
