"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  CheckCircle2,
  ChevronDown,
  FileText,
  Link2,
  Mail,
  MapPin,
  MessageCircle,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { BACSPayload } from "@/lib/types";
import { CONSULTANT_WHATSAPP_LINK, mailtoLink } from "@/lib/config";

export default function PortalClient() {
  const searchParams = useSearchParams();
  const [payload, setPayload] = useState<BACSPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const data = searchParams.get("data");
    if (!data) {
      setError("No encrypted profile data found in this link.");
      return;
    }
    try {
      const decoded = decodeURIComponent(atob(data));
      setPayload(JSON.parse(decoded) as BACSPayload);
    } catch {
      setError("Security alert: invalid or corrupted profile token.");
    }
  }, [searchParams]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Auto-copy failed. Copy the link from your browser address bar.");
    }
  };

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-8">
        <div className="card max-w-md rounded-2xl p-8 text-center text-rose-400">
          <AlertTriangle className="mx-auto mb-4" size={32} />
          <p className="text-sm leading-relaxed">{error}</p>
          <p className="mt-3 text-xs text-slate-500">
            Ask the sender to generate a fresh portal link from the consultant workspace.
          </p>
        </div>
      </div>
    );
  }

  if (!payload) return null;

  const p = payload.profile;
  const d = payload.diagnostics;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 py-12">
      <header className="animate-fade-up space-y-4 text-center">
        <div className="chip mx-auto border-emerald-500/25 bg-emerald-500/10 text-emerald-400">
          <Sparkles size={14} /> BACS Intelligence Portal
        </div>
        <h1 className="text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Welcome, {p?.name || "Candidate"}
        </h1>
        <p className="mx-auto max-w-xl text-sm leading-relaxed text-slate-400">
          Your personalized human capital feasibility analysis and 2026 pathway strategy.
        </p>
      </header>

      {d && (
        <section className="card animate-fade-up flex items-center justify-between gap-4 p-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500">Status</p>
            <p className="mt-1 text-2xl font-bold text-white">{d.classification}</p>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-400">
              <TrendingUp size={14} className="text-emerald-400" />
              CRS Estimate: <span className="font-semibold text-white">{d.crsBand}</span>
            </p>
          </div>
          <p
            className={`text-6xl font-bold ${
              d.readinessScore >= 75
                ? "text-emerald-400"
                : d.readinessScore >= 40
                  ? "text-amber-400"
                  : "text-rose-400"
            }`}
          >
            {d.readinessScore}
          </p>
        </section>
      )}

      {d && d.breakdown && d.breakdown.length > 0 && (
        <section className="card animate-fade-up space-y-3 p-6" style={{ animationDelay: "60ms" }}>
          <h2 className="text-lg font-semibold text-white">Why this score</h2>
          {d.breakdown.map((b) => (
            <div
              key={b.label}
              className="flex items-start justify-between gap-4 border-b border-slate-800 pb-3 last:border-0"
            >
              <div>
                <p className="text-sm text-white">{b.label}</p>
                <p className="mt-0.5 text-xs text-slate-500">{b.note}</p>
              </div>
              <p className="flex-shrink-0 font-mono text-sm text-emerald-400">{b.points} pts</p>
            </div>
          ))}
          <div className="flex items-center justify-between pt-2">
            <p className="font-bold text-white">Estimated CRS total</p>
            <p className="font-bold text-emerald-400">≈ {d.crsEstimate} pts</p>
          </div>
        </section>
      )}

      <section className="card animate-fade-up p-6" style={{ animationDelay: "120ms" }}>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
          <FileText size={18} className="text-emerald-400" /> Profile Snapshot
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          <div className="rounded-xl border border-slate-800/80 bg-slate-800/30 p-3">
            <p className="text-xs text-slate-500">Age</p>
            <p className="mt-0.5 font-medium text-white">{p?.age ?? "—"}</p>
          </div>
          <div className="rounded-xl border border-slate-800/80 bg-slate-800/30 p-3">
            <p className="text-xs text-slate-500">Education</p>
            <p className="mt-0.5 font-medium text-white">{p?.education ?? "—"}</p>
          </div>
          <div className="rounded-xl border border-slate-800/80 bg-slate-800/30 p-3">
            <p className="text-xs text-slate-500">Language</p>
            <p className="mt-0.5 font-medium text-white">
              {p?.hasLanguageTest ? `CLB ${p?.clb}` : "No test"}
            </p>
          </div>
          <div className="rounded-xl border border-slate-800/80 bg-slate-800/30 p-3">
            <p className="text-xs text-slate-500">NOC / TEER</p>
            <p className="mt-0.5 truncate font-medium text-white">
              {p?.nocCode ?? "—"} / {p?.teerLevel ?? "—"}
            </p>
          </div>
          <div className="rounded-xl border border-slate-800/80 bg-slate-800/30 p-3">
            <p className="text-xs text-slate-500">Funds</p>
            <p className="mt-0.5 font-medium text-white">
              ${(p?.fundsCAD ?? 0).toLocaleString()} CAD
            </p>
          </div>
          <div className="rounded-xl border border-slate-800/80 bg-slate-800/30 p-3">
            <p className="text-xs text-slate-500">Target</p>
            <p className="mt-0.5 truncate font-medium text-white">{p?.occupation ?? "—"}</p>
          </div>
        </div>
      </section>

      {d && d.pathways.length > 0 && (
        <section className="card animate-fade-up space-y-4 p-6" style={{ animationDelay: "180ms" }}>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
            <MapPin size={18} className="text-emerald-400" /> Your pathway signals
          </h2>
          {d.pathways.map((pw) => (
            <div key={pw.name} className="rounded-xl border border-slate-800 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-white">{pw.name}</p>
                <p className="flex-shrink-0 font-mono text-sm text-emerald-400">{pw.fit}%</p>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-700"
                  style={{ width: `${pw.fit}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-400">{pw.note}</p>
            </div>
          ))}
        </section>
      )}

      {d && d.provinceMatches && d.provinceMatches.length > 0 && (
        <section className="card animate-fade-up space-y-4 p-6" style={{ animationDelay: "210ms" }}>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
            <MapPin size={18} className="text-emerald-400" /> Best province matches
          </h2>
          {d.provinceMatches[0]?.province === "Not yet verified" ? (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
              <p className="text-sm text-amber-300">{d.provinceMatches[0].note}</p>
            </div>
          ) : (
            <>
              {d.provinceMatches.map((pm) => (
                <div key={`${pm.province}-${pm.programName}`} className="rounded-xl border border-slate-800 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-white">{pm.province}</p>
                      <p className="text-xs text-slate-500">{pm.programName}</p>
                    </div>
                    <p className="flex-shrink-0 font-mono text-sm text-emerald-400">{pm.fit}%</p>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-700"
                      style={{ width: `${pm.fit}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-400">{pm.note}</p>
                </div>
              ))}
              <p className="text-xs text-slate-500">
                Signal as of {d.provinceMatches[0]?.asOf} — PNP occupation lists change quarterly. Verify against
                the official provincial site before applying.
              </p>
            </>
          )}
        </section>
      )}

      {d && d.obstacles.length > 0 && (
        <section className="card animate-fade-up space-y-3 p-6" style={{ animationDelay: "240ms" }}>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
            <AlertTriangle size={18} className="text-amber-400" /> Weaknesses & how to improve them
          </h2>
          {d.obstacles.map((o, i) => (
            <div key={o.title} className="flex items-start gap-3 rounded-xl border border-slate-800 p-4">
              <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-rose-500/10 font-mono text-xs text-rose-400 ring-1 ring-rose-500/30">
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-medium text-white">{o.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">{o.fix}</p>
              </div>
            </div>
          ))}
        </section>
      )}

      <details
        className="card group rounded-xl p-5 transition-all open:border-emerald-500/50"
        open
      >
        <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-white">
          <span>BACS Diagnostic & Strategy</span>
          <ChevronDown size={18} className="text-emerald-400 transition-transform group-open:rotate-180" />
        </summary>
        <div className="mt-4 border-t border-slate-800 pt-4">
          {payload.strategy_notes ? (
            <ReactMarkdown
              components={{
                h1: ({ node, ...props }) => (
                  <h1 className="mb-2 mt-4 text-2xl font-bold text-white" {...props} />
                ),
                h2: ({ node, ...props }) => (
                  <h2 className="mb-2 mt-4 text-xl font-bold text-emerald-400" {...props} />
                ),
                h3: ({ node, ...props }) => (
                  <h3 className="mb-1 mt-3 text-lg font-semibold text-white" {...props} />
                ),
                p: ({ node, ...props }) => (
                  <p className="mb-3 leading-relaxed text-slate-300" {...props} />
                ),
                ul: ({ node, ...props }) => (
                  <ul
                    className="mb-3 list-inside list-disc space-y-1 text-slate-300 marker:text-emerald-500"
                    {...props}
                  />
                ),
                ol: ({ node, ...props }) => (
                  <ol
                    className="mb-3 list-inside list-decimal space-y-1 text-slate-300 marker:text-emerald-500"
                    {...props}
                  />
                ),
                strong: ({ node, ...props }) => (
                  <strong className="font-semibold text-white" {...props} />
                ),
              }}
            >
              {payload.strategy_notes}
            </ReactMarkdown>
          ) : (
            <p className="text-sm italic text-slate-400">
              Awaiting consultant strategy injection...
            </p>
          )}
        </div>
      </details>

      <section
        className="card animate-fade-up space-y-4 border-emerald-500/20 bg-emerald-500/5 p-8 text-center"
        style={{ animationDelay: "300ms" }}
      >
        <h3 className="text-xl font-bold text-white">Ready to execute your roadmap?</h3>
        <p className="text-sm text-slate-400">
          Forward this portal link to your designated immigration representative to initiate your
          file.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button onClick={handleCopyLink} className="btn-primary px-8 py-3">
            {copied ? (
              <>
                <CheckCircle2 size={18} /> Copied to Clipboard
              </>
            ) : (
              <>
                <Link2 size={18} /> Copy Portal Link
              </>
            )}
          </button>
          <a
            href={mailtoLink({
              subject: `BACS 2026 Assessment — ${p?.name || "Candidate"}`,
              body: `Hi, please find my BACS 2026 assessment portal link:\n\n${
                typeof window !== "undefined" ? window.location.href : ""
              }\n\nFull report opens in your browser.`,
            })}
            className="btn-ghost px-6 py-3"
          >
            <Mail size={18} /> Send to Consultant
          </a>
          <a
            href={CONSULTANT_WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost px-6 py-3"
          >
            <MessageCircle size={18} /> WhatsApp
          </a>
        </div>
        <p className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
          <BadgeCheck size={14} className="text-emerald-400" /> Shareable · Encoded · Candidate-ready
        </p>
      </section>
    </div>
  );
}