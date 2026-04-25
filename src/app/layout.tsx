import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { AuthProvider } from "@/components/providers/AuthProvider";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
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
      <body className={`${inter.variable} min-h-screen font-sans antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
