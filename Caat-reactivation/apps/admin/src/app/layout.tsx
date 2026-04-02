import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CAAT Reactivation — Admin",
  description: "Pannello admin per riattivazione clienti dormienti",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full font-[family-name:var(--font-geist-sans)]">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
