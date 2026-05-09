import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "TRÆCERA",
  description: "Intelligence layer for African Solana projects.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full bg-[#0a0a0f]">
      <body className="min-h-full bg-[#0a0a0f] font-sans text-slate-100 antialiased selection:bg-brand-purple/30">
        {children}
      </body>
    </html>
  );
}
