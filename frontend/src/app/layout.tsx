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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-[#F7F9FC] text-[#111827]`}>
        <StoreProvider>
          <ErrorScreen>
            <div className="min-h-screen relative w-full overflow-hidden">
              {children}
            </div>
          </ErrorScreen>
        </StoreProvider>
      </body>
    </html>
  );
}
