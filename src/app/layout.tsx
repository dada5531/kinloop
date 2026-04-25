import type { Metadata } from "next";
import { DM_Sans, Inter } from "next/font/google";

import { AuthProvider } from "@/components/providers/AuthProvider";

import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Force dynamic rendering to avoid SSG issues with auth providers
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "KINLOOP — AI Parenting Dashboard",
  description:
    "A 4-quadrant AI dashboard that turns the chaos of modern parenting into structured calendars, shopping lists, and personalized guidance.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmSans.variable} ${inter.variable} min-h-screen font-sans antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
