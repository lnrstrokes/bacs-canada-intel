"use client";

import { useState } from "react";
import { CheckCircle2, Copy, KeyRound, Link2, ShieldCheck, Sparkles } from "lucide-react";
import { BACSPayload } from "@/lib/types";

export default function AdminGenerator() {
  const [jsonInput, setJsonInput] = useState("");
  const [strategyInput, setStrategyInput] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerateLink = () => {
    try {
      const baseProfile = JSON.parse(jsonInput) as BACSPayload;

      if (!baseProfile.profile) {
        alert('This JSON is missing the "profile" object. Paste the full candidate payload.');
        return;
      }

      const finalPayload: BACSPayload = {
        ...baseProfile,
        strategy_notes: strategyInput,
      };

      const encoded = btoa(encodeURIComponent(JSON.stringify(finalPayload)));
      setGeneratedLink(`${window.location.origin}/portal?data=${encoded}`);
      setCopied(false);
    } catch {
      alert("Invalid JSON format. Please check the candidate payload.");
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Auto-copy failed. Long-press the link text to copy it manually.");
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 py-12">
      <header className="animate-fade-up space-y-2 text-center">
        <div className="chip mx-auto border-emerald-500/25 bg-emerald-500/10 text-emerald-400">
          <ShieldCheck size={14} /> Restricted · Consultant Workspace
        </div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">BACS Admin: Portal Generator</h1>
        <p className="text-sm text-slate-400">
          Inject NotebookLM intelligence into candidate payloads and mint shareable portal links.
        </p>
      </header>

      <div className="animate-fade-up grid grid-cols-1 gap-6 md:grid-cols-2" style={{ animationDelay: "80ms" }}>
        <div className="card flex flex-col space-y-3 p-6">
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 font-mono text-[10px] text-emerald-400 ring-1 ring-emerald-500/30">1</span>
            Candidate JSON
          </label>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="Paste the downloaded bacs-profile.json here..."
            className="h-64 w-full flex-1 resize-none rounded-xl border border-slate-700 bg-slate-900/80 p-4 font-mono text-xs text-slate-300 outline-none transition-all duration-200 placeholder:text-slate-600 hover:border-slate-600 focus:border-emerald-500/70 focus:ring-2 focus:ring-emerald-500/25"
          />
          <p className="text-[11px] text-slate-500">
            Paste the assessment payload downloaded from the intake engine.
          </p>
        </div>

        <div className="card flex flex-col space-y-3 p-6">
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 font-mono text-[10px] text-emerald-400 ring-1 ring-emerald-500/30">2</span>
            NotebookLM Strategy
          </label>
          <textarea
            value={strategyInput}
            onChange={(e) => setStrategyInput(e.target.value)}
            placeholder="Paste the grounded IRCC strategy, gaps, and action plan here..."
            className="h-64 w-full flex-1 resize-none rounded-xl border border-slate-700 bg-slate-900/80 p-4 text-sm text-slate-300 outline-none transition-all duration-200 placeholder:text-slate-600 hover:border-slate-600 focus:border-emerald-500/70 focus:ring-2 focus:ring-emerald-500/25"
          />
          <p className="text-[11px] text-slate-500">
            Markdown is supported — the candidate portal renders it beautifully.
          </p>
        </div>
      </div>

      <button
        onClick={handleGenerateLink}
        className="btn-ghost group w-full py-4 text-base"
      >
        <KeyRound size={18} className="text-emerald-400 transition-transform duration-200 group-hover:rotate-12" />
        Compile & Encrypt Portal Link
      </button>

      {generatedLink && (
        <div className="card animate-fade-up space-y-4 p-6">
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 size={20} />
            <span className="font-semibold">Encrypted Portal Link Generated</span>
            <Sparkles size={16} className="ml-auto text-emerald-400/50" />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto rounded-lg border border-slate-800 bg-slate-950 p-3">
            <Link2 size={16} className="flex-shrink-0 text-slate-500" />
            <code className="whitespace-nowrap text-xs text-slate-400">{generatedLink}</code>
          </div>
          {generatedLink.length > 7500 && (
            <p className="text-xs text-amber-400">
              Warning: this link is very long. Shorten the strategy notes for reliable sharing on
              messaging apps.
            </p>
          )}
          <button onClick={handleCopy} className="btn-primary w-full py-3">
            {copied ? (
              <>
                <CheckCircle2 size={18} /> Copied to Clipboard
              </>
            ) : (
              <>
                <Copy size={18} /> Copy Link for Candidate
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
