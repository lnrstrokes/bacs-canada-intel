import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "BACS Canada Relocation Intelligence Hub",
    template: "%s · BACS Canada",
  },
  description:
    "Deterministic pathway strategy and human capital feasibility engine for Canadian immigration.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="relative min-h-screen text-slate-50 antialiased">
        <header className="sticky top-0 z-40 border-b border-slate-800/60 bg-slate-950/70 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <Link href="/" className="group flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 ring-1 ring-emerald-500/30 transition-colors duration-200 group-hover:bg-emerald-500/25">
                <ShieldCheck size={18} className="text-emerald-400" />
              </span>
              <span className="leading-tight">
                <span className="block text-sm font-bold tracking-tight">BACS Canada</span>
                <span className="block text-[11px] text-slate-500">Relocation Intelligence</span>
              </span>
            </Link>
            <nav className="flex items-center gap-1 text-sm">
              <Link
                href="/"
                className="rounded-lg px-3 py-1.5 text-slate-300 transition-colors duration-200 hover:bg-slate-800/60 hover:text-white"
              >
                Assessment
              </Link>
              <Link
                href="/portal"
                className="hidden rounded-lg px-3 py-1.5 text-slate-300 transition-colors duration-200 hover:bg-slate-800/60 hover:text-white sm:block"
              >
                Candidate Portal
              </Link>
              <Link
                href="/admin"
                className="hidden rounded-lg px-3 py-1.5 text-slate-300 transition-colors duration-200 hover:bg-slate-800/60 hover:text-white sm:block"
              >
                Consultant
              </Link>
            </nav>
          </div>
        </header>

        <main className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-20 sm:px-6">
          {children}
        </main>

        <footer className="relative z-10 border-t border-slate-800/60 py-6">
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-2 px-4 text-center sm:px-6">
            <p className="text-xs text-slate-500">
              BACS Protocol 2026 — a deterministic readiness engine for Canadian economic
              immigration.
            </p>
            <p className="text-[11px] text-slate-600">
              Indicative estimates only, not legal advice. Verify current thresholds with IRCC and a
              licensed immigration consultant (RCIC).
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
