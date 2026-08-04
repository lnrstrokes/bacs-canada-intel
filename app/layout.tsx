import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BACS Canada Relocation Intelligence Hub",
  description:
    "Deterministic pathway strategy and human capital feasibility engine for Canadian immigration.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-bacs-bg text-slate-50 antialiased selection:bg-bacs-accent/30 selection:text-white">
        <main className="flex flex-col items-center justify-center p-4 sm:p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
