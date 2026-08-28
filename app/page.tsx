"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  FileDown,
  FileText,
  GraduationCap,
  Handshake,
  Link2,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Send,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Unlock,
  Zap,
} from "lucide-react";
import { BACSProfile, BACSPayload, Diagnostics, IELTSScores } from "@/lib/types";
import { runDiagnostics } from "@/lib/engine";
import { overallClb } from "@/lib/clb";
import { inferNoc, searchNoc } from "@/lib/noc";
import {
  CONSULTANT_WHATSAPP_DISPLAY,
  REPORT_FEE_DISPLAY,
  mailtoLink,
  whatsappLink,
} from "@/lib/config";

const STEP_TITLES = [
  "Core human capital",
  "Language proficiency",
  "Education & ECA",
  "Work history & NOC",
  "Funds & timeline",
];

const STEP_EXPLAINERS = [
  "We use your age, family size and goal to calculate human-capital points and the settlement funds you will need. Age points peak between 20 and 29.",
  "Language is the biggest CRS multiplier. Enter your exact IELTS bands for all four skills so we can compute your real CLB level. If you have not taken a test, tick the box and we will flag it as your first action item instead of guessing.",
  "Foreign education only counts after an Educational Credential Assessment (ECA). We check this so your score is honest, not inflated.",
  "Type your job title and we auto-suggest the closest NOC 2021 code and TEER level. Always verify your daily duties on the official NOC tool — IRCC matches duties, not job titles.",
  "Settlement funds are a hard eligibility threshold for FSW/FST. We compare your savings against the 2026 IRCC table for your family size.",
];

const DEFAULT_PROFILE: BACSProfile = {
  name: "",
  email: "",
  primaryGoal: "Express Entry (PR)",
  age: 30,
  familySize: 1,
  provinceInterest: "No preference",
  hasLanguageTest: false,
  ielts: { reading: 0, writing: 0, listening: 0, speaking: 0 },
  clb: 0,
  french: false,
  education: "Bachelors",
  educationCountry: "outside",
  ecaStatus: "not_done",
  occupation: "",
  nocCode: "Unmapped",
  teerLevel: "unmapped",
  experienceYears: 0,
  continuousMonths: 0,
  canadianExperience: false,
  fundsCAD: 25000,
  jobOffer: false,
  timeline: "6-12m",
  ecaValid: true,
  canadianEducation: false,
  regulatedOccupation: false,
  languageTestValid: true,
  secondLanguage: false,
  consecutive12Months: true,
  prioritySector: false,
  relativeInProvince: false,
  previousProvinceTies: false,
  jalEpaApproved: "na",
  maritalStatus: "Single",
  spouseAccompanying: false,
  spousePoints: false,
  fundsHistory: true,
  visaRefusals: false,
  criminalMedical: false,
  inCanada: false,
  permitExpirySoon: false,
};

const Toggle = ({
  label,
  value,
  onChange,
  danger,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  danger?: boolean;
}) => (
  <div className="flex items-center justify-between border-b border-slate-800 py-3 last:border-0">
    <span className="flex-1 pr-4 text-sm text-slate-300">{label}</span>
    <div className="flex flex-shrink-0 gap-2">
      <button
        onClick={() => onChange(true)}
        className={`rounded px-3 py-1 text-xs font-semibold transition-all duration-200 ${
          value
            ? "bg-emerald-500 text-slate-950 shadow shadow-emerald-500/30"
            : "bg-slate-800 text-slate-400 hover:bg-slate-700"
        }`}
      >
        Yes
      </button>
      <button
        onClick={() => onChange(false)}
        className={`rounded px-3 py-1 text-xs font-semibold transition-all duration-200 ${
          !value
            ? danger
              ? "border border-rose-500/50 bg-rose-500/20 text-rose-400"
              : "bg-slate-700 text-white"
            : "bg-slate-800 text-slate-400 hover:bg-slate-700"
        }`}
      >
        No
      </button>
    </div>
  </div>
);

const SampleScorecard = () => (
  <div className="card mx-auto w-full max-w-md overflow-hidden text-left">
    <div className="border-b border-slate-800 bg-slate-900/60 px-5 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
        Canada Readiness Scorecard
      </p>
    </div>
    <div className="space-y-4 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500">Overall fit</p>
          <p className="mt-0.5 text-lg font-bold text-amber-400">Moderate Fit</p>
        </div>
        <div
          className="relative h-20 w-20 flex-shrink-0 rounded-full"
          style={{ background: "conic-gradient(#f59e0b 266deg, rgba(51,65,85,0.5) 0deg)" }}
        >
          <div className="absolute inset-1.5 flex items-center justify-center rounded-full bg-slate-900">
            <span className="text-xl font-bold text-amber-400">74</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg border border-slate-800 bg-slate-800/30 px-3 py-2">
          <p className="text-slate-500">CRS estimate</p>
          <p className="mt-0.5 font-semibold text-white">≈ 344 pts</p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-800/30 px-3 py-2">
          <p className="text-slate-500">Risk level</p>
          <p className="mt-0.5 font-semibold text-amber-400">Moderate</p>
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold text-slate-400">🛣️ Top pathways</p>
        {[
          ["Federal Skilled Worker", 78],
          ["PNP — Trades & Technical", 68],
          ["Provincial demand streams", 62],
        ].map(([name, fit]) => (
          <div key={name as string} className="mb-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">{name}</span>
              <span className="font-mono text-emerald-400">{fit}%</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                style={{ width: `${fit}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold text-slate-400">📍 Best province matches</p>
        {[
          ["Nova Scotia", "NSHA/IWK Health Authority stream", 88],
          ["Ontario", "OINP In-Demand Skills / Healthcare", 80],
          ["British Columbia", "BC PNP Healthcare Professional", 78],
        ].map(([name, program, fit]) => (
          <div key={name as string} className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-slate-300">
              {name} <span className="text-slate-500">— {program}</span>
            </span>
            <span className="flex-shrink-0 font-mono text-emerald-400">{fit}%</span>
          </div>
        ))}
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold text-slate-400">⚠️ Critical gaps to close</p>
        <ul className="space-y-1 text-xs text-slate-400">
          <li>● No Educational Credential Assessment (ECA)</li>
          <li>● Language below competitive threshold (CLB 9)</li>
          <li>● Settlement funds below 2026 IRCC threshold</li>
        </ul>
      </div>
    </div>
  </div>
);

const CheckRow = ({ icon, label }: { icon: string; label: string }) => (
  <li className="flex items-start gap-2.5 text-sm text-slate-300">
    <span className="mt-0.5 flex-shrink-0">{icon}</span>
    {label}
  </li>
);

export default function IntakeEngine() {
  const [stage, setStage] = useState<"landing" | "form" | "results">("landing");
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<BACSProfile>(DEFAULT_PROFILE);
  const [diag, setDiag] = useState<Diagnostics | null>(null);
  const [showPrecision, setShowPrecision] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [occSuggestOpen, setOccSuggestOpen] = useState(false);

  const set = (patch: Partial<BACSProfile>) => setProfile({ ...profile, ...patch });

  const updateIelts = (key: keyof IELTSScores, value: number) => {
    const ielts = { ...profile.ielts, [key]: value };
    set({ ielts, clb: overallClb(ielts) });
  };

  const updateOccupation = (value: string) => {
    const m = inferNoc(value);
    if (m) set({ occupation: value, nocCode: m.noc, teerLevel: m.teer });
    else set({ occupation: value, nocCode: "Unmapped", teerLevel: "unmapped" });
  };

  const handleContinue = () => {
    if (step === 0 && !profile.name.trim()) {
      alert("Please enter your name.");
      return;
    }
    if (step === 0 && !profile.email.trim()) {
      alert("Please enter your email so your report can be sent to you.");
      return;
    }
    if (step < 4) {
      setStep(step + 1);
      return;
    }
    setDiag(runDiagnostics(profile));
    setStage("results");
  };

  const buildPayload = (): BACSPayload => {
    const d = diag as Diagnostics;
    return {
      bacs_version: "3.0",
      generated_at: new Date().toISOString(),
      profile,
      diagnostics: d,
      crs_estimate: d.crsBand,
      primary_pathway: d.pathways[0]?.name ?? "TBD",
      strategy_notes: d.strategyText,
    };
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(buildPayload(), null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bacs-2026-${profile.name.trim().replace(/\s+/g, "-").toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /* ---------------------------------- LANDING ---------------------------------- */

  if (stage === "landing") {
    return (
      <div className="mx-auto w-full max-w-3xl">
        {/* Scarcity strip */}
        <div className="animate-fade-in -mx-4 mb-10 flex items-center justify-center gap-2 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-2.5 text-center text-xs font-medium text-amber-300 sm:mx-0">
          <Zap size={14} className="flex-shrink-0" />
          Limited assessment slots this month — complete your free Canada snapshot today.
        </div>

        {/* Hero */}
        <header className="animate-fade-up space-y-5 text-center">
          <div className="chip mx-auto border-emerald-500/25 bg-emerald-500/10 text-emerald-400">
            <ShieldCheck size={14} /> 2026 Pathway Strategy Engine
          </div>
          <h1 className="mx-auto max-w-2xl text-balance text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
            Find out your real chance of <span className="text-gradient">moving to Canada</span> in
            4 minutes
          </h1>
          <p className="mx-auto max-w-xl leading-relaxed text-slate-400">
            Get a personalized immigration readiness score, a CRS estimate, best-fit pathways and a
            step-by-step gap list — based on your exact profile, scored against 2026 IRCC tables.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-slate-300">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={15} className="text-emerald-400" /> Free — no sign-up required
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={15} className="text-emerald-400" /> 4-minute questionnaire
            </span>
            <span className="flex items-center gap-1.5">
              <Zap size={15} className="text-emerald-400" /> Instant results
            </span>
          </div>
          <button
            onClick={() => setStage("form")}
            className="btn-primary group w-full py-4 text-lg"
          >
            Start my free assessment
            <ArrowRight size={20} className="transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        </header>

        {/* Sample report */}
        <section className="mt-16 space-y-5">
          <div className="space-y-2 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-400">
              Sample report
            </p>
            <h2 className="text-xl font-bold text-white sm:text-2xl">
              Your Canada Readiness Scorecard
            </h2>
            <p className="mx-auto max-w-md text-sm text-slate-400">
              This is what you receive — instantly, after 4 minutes. No waiting, no guesswork.
            </p>
          </div>
          <SampleScorecard />
          <p className="text-center text-xs text-slate-500">
            ↑ Your actual report will be personalized to your occupation, education and finances.
          </p>
        </section>

        {/* Insight hook */}
        <section className="mt-16 space-y-4 text-center">
          <h2 className="mx-auto max-w-xl text-balance text-2xl font-bold text-white">
            Most applicants don&apos;t fail because they are unqualified.
          </h2>
          <p className="mx-auto max-w-lg text-sm leading-relaxed text-slate-400">
            They fail because they apply through the wrong pathway, province, or job strategy. The
            scorecard shows you exactly where you stand — and what to fix first.
          </p>
          <ul className="mx-auto grid max-w-lg gap-2.5 text-left">
            <CheckRow icon="🛣️" label="Immigration pathway match" />
            <CheckRow icon="🏢" label="Employer sponsorship potential" />
            <CheckRow icon="📍" label="Province selection fit" />
            <CheckRow icon="💼" label="Occupation demand in Canada" />
            <CheckRow icon="📄" label="NOC/TEER code mapping" />
            <CheckRow icon="📋" label="Missing document gaps" />
          </ul>
        </section>

        {/* How it works */}
        <section className="mt-16">
          <h2 className="mb-6 text-center text-xl font-bold text-white sm:text-2xl">How it works</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                emoji: "📝",
                title: "Submit your profile",
                body: "Answer 5 quick sections about your background, language, education, work and finances. Takes under 4 minutes.",
              },
              {
                emoji: "⚡",
                title: "System analyses your profile",
                body: "Your occupation is mapped to a NOC 2021 code, IELTS bands become a CLB level, and your score is computed against 2026 criteria.",
              },
              {
                emoji: "🎯",
                title: "Receive your scorecard",
                body: "Instant score, CRS estimate, matched pathways and a priority gap list — ready to save, share or forward to a consultant.",
              },
            ].map((s, i) => (
              <div key={s.title} className="card card-hover relative p-5 text-left">
                <span className="absolute right-4 top-4 font-mono text-3xl font-bold text-slate-800">
                  {i + 1}
                </span>
                <span className="text-2xl">{s.emoji}</span>
                <h3 className="mt-3 text-sm font-bold text-white">{s.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* What you actually get */}
        <section className="mt-16">
          <h2 className="mb-6 text-center text-xl font-bold text-white sm:text-2xl">
            What you actually get
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { icon: "🏆", title: "Readiness score & CRS estimate", body: "Your real chance, scored out of 100, with an indicative CRS component total." },
              { icon: "🛣️", title: "Pathway ranking", body: "Your top 3 pathways ranked by fit score, with strategic reasoning." },
              { icon: "📍", title: "Province matches", body: "Which provinces align with your occupation and declared interest." },
              { icon: "📋", title: "Missing document checklist", body: "Exactly what you are missing — ECA, language test, funds history — in priority order." },
              { icon: "📄", title: "NOC/TEER mapping", body: "Your occupation mapped to a NOC 2021 code with a duty-check reminder." },
              { icon: "🗺️", title: "Complete assessed file", body: "A full expert assessment delivered via a consultant or agency partner (per case).", premium: true },
            ].map((f) => (
              <div key={f.title} className={`card card-hover p-5 text-left ${f.premium ? "border-emerald-500/30 bg-emerald-500/5" : ""}`}>
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{f.icon}</span>
                  {f.premium && (
                    <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400 ring-1 ring-emerald-500/30">
                      Premium
                    </span>
                  )}
                </div>
                <h3 className="mt-3 text-sm font-bold text-white">{f.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Who this is for */}
        <section className="mt-16">
          <h2 className="mb-6 text-center text-xl font-bold text-white sm:text-2xl">Who this is for</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              ["👷", "Skilled workers targeting Canada employment"],
              ["🎓", "Recent graduates exploring study-to-PR routes"],
              ["🔧", "Tradespeople in construction, welding, caregiving"],
              ["💼", "Job seekers who want employer-sponsored pathways"],
              ["👨‍👩‍👧", "Families planning full household relocation"],
              ["🌍", "Anyone outside Canada wanting a reality check"],
            ].map(([emoji, label]) => (
              <div key={label} className="card card-hover flex items-center gap-2.5 p-4 text-left">
                <span className="text-xl">{emoji}</span>
                <span className="text-xs leading-snug text-slate-300">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Before vs After */}
        <section className="mt-16">
          <h2 className="mb-6 text-center text-xl font-bold text-white sm:text-2xl">
            Before vs. after your scorecard
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="card rounded-2xl border-rose-500/20 p-6">
              <p className="mb-4 text-sm font-bold text-rose-400">❌ Before</p>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li>Confused about which provinces apply to you</li>
                <li>No clear occupation-to-NOC mapping</li>
                <li>Applying blindly to the wrong programs</li>
                <li>No idea if your savings qualify</li>
                <li>Random job search with no strategy</li>
              </ul>
            </div>
            <div className="card rounded-2xl border-emerald-500/25 bg-emerald-500/5 p-6">
              <p className="mb-4 text-sm font-bold text-emerald-400">✅ After</p>
              <ul className="space-y-2.5 text-sm text-slate-300">
                <li>Clear pathways ranked by your actual fit</li>
                <li>Exact NOC code + TEER level confirmed</li>
                <li>Targeted provinces with demand for your role</li>
                <li>Funds gap calculated against IRCC thresholds</li>
                <li>A prioritized gap list and next steps</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Consultants & agencies */}
        <section className="mt-16">
          <div className="card overflow-hidden border-emerald-500/30 bg-emerald-500/5">
            <div className="space-y-4 p-6 sm:p-8">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 ring-1 ring-emerald-500/30">
                  <Handshake size={20} className="text-emerald-400" />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-white sm:text-xl">
                    For immigration consultants & agencies
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-slate-400">
                    Send your candidate&apos;s profile and receive a complete, assessed candidate
                    file — readiness score, CRS estimate, pathway fit and gap analysis, ready to
                    present to your client.
                  </p>
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-400">
                  As a partner, you get:
                </p>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0 text-emerald-400" /> A
                    free candidate snapshot link you can send your own clients directly
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0 text-emerald-400" />{" "}
                    A complete assessed file per case — readiness score, CRS estimate, pathway fit
                    and a prioritized gap list, ready to present to your client
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0 text-emerald-400" />{" "}
                    A shareable portal link per candidate you can forward by email or WhatsApp
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0 text-emerald-400" />{" "}
                    An optional interactive candidate website you can offer as a paid add-on
                  </li>
                </ul>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3">
                <span className="text-sm text-slate-400">Per-case assessment</span>
                <span className="text-lg font-bold text-white">
                  {REPORT_FEE_DISPLAY} <span className="text-xs font-normal text-slate-500">per case</span>
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <a
                  href={whatsappLink({
                    text: "Hello, I'm an immigration consultant/agency and I'd like to submit a candidate case for assessment.\n\nCandidate name:\nOccupation:\nPortal link (if the candidate already completed the free snapshot):\n\n(Please attach or describe the candidate's profile — age, occupation, education, language test scores, and province of interest — and I'll confirm the per-case fee and next steps.)",
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary py-3"
                >
                  <MessageCircle size={18} /> Submit a case on WhatsApp
                </a>
                <a
                  href={mailtoLink({
                    subject: "Partnership — candidate assessment",
                    body: "Hello, I'm an immigration consultant/agency and I'd like to send candidate profiles for assessment.\n\nCandidate name:\nOccupation:\nPortal link (if the candidate already completed the free snapshot):\n",
                  })}
                  className="btn-ghost py-3"
                >
                  <Mail size={18} /> Email us
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mt-16 space-y-4 text-center">
          <h2 className="text-2xl font-bold text-white">Your score is waiting.</h2>
          <p className="mx-auto max-w-md text-sm text-slate-400">
            Instant results based on your profile — 4 minutes, no sign-up required.
          </p>
          <button
            onClick={() => setStage("form")}
            className="btn-primary group w-full py-4 text-lg"
          >
            Start my free assessment
            <ArrowRight size={20} className="transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        </section>
      </div>
    );
  }

  /* ---------------------------------- RESULTS ---------------------------------- */

  if (stage === "results" && diag) {
    const isActionRequired = diag.classification === "Action Required";
    const score = diag.readinessScore;
    const ringColor = isActionRequired
      ? "#f59e0b"
      : score >= 75
        ? "#10b981"
        : score >= 40
          ? "#f59e0b"
          : "#fb7185";
    const scoreColor = isActionRequired
      ? "text-amber-400"
      : score >= 75
        ? "text-emerald-400"
        : score >= 40
          ? "text-amber-400"
          : "text-rose-400";

    const portalLink = `${window.location.origin}/portal?data=${btoa(
      encodeURIComponent(JSON.stringify(buildPayload()))
    )}`;

    const shareBody = `Check out my Canada PR readiness scorecard (${diag.readinessScore}/100 — ${diag.classification}): ${portalLink}`;
    const shareWhatsApp = `https://wa.me/?text=${encodeURIComponent(shareBody)}`;

    const reportEmailBody = [
      `Hi, please find my BACS 2026 PR feasibility assessment.`,
      "",
      `Name: ${profile.name}`,
      `Email: ${profile.email}`,
      `Readiness: ${diag.readinessScore}/100 (${diag.classification})`,
      `CRS estimate: ${diag.crsBand}`,
      `Top pathways: ${diag.pathways.map((p) => p.name).join("; ") || "To be determined"}`,
      "",
      "Full report (opens in your browser):",
      portalLink,
    ].join("\n");

    const copyLink = async () => {
      try {
        await navigator.clipboard.writeText(portalLink);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
      } catch {
        alert("Copy failed — long-press the link above to copy it manually.");
      }
    };

    return (
      <div className="mx-auto w-full max-w-2xl space-y-6 py-12">
        <header className="animate-fade-up text-center">
          <div className="chip mx-auto border-emerald-500/25 bg-emerald-500/10 text-emerald-400">
            <Sparkles size={14} /> Diagnostic Complete
          </div>
        </header>

        <section className="card animate-fade-up flex items-center justify-between gap-4 p-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500">Status</p>
            <p className={`mt-1 text-2xl font-bold ${isActionRequired ? "text-amber-400" : "text-white"}`}>
              {diag.classification}
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-400">
              <TrendingUp size={14} className="text-emerald-400" />
              CRS Estimate: <span className="font-semibold text-white">{diag.crsBand}</span>
            </p>
          </div>
          <div
            className="relative h-28 w-28 flex-shrink-0 rounded-full"
            style={{ background: `conic-gradient(${ringColor} ${score * 3.6}deg, rgba(51,65,85,0.5) 0deg)` }}
            aria-label={`Readiness score ${score} out of 100`}
          >
            <div className="absolute inset-1.5 flex items-center justify-center rounded-full bg-slate-900 shadow-inner">
              <span className={`text-3xl font-bold ${scoreColor}`}>{score}</span>
            </div>
          </div>
        </section>

        {isActionRequired && (
          <section className="card animate-fade-up space-y-2 border-amber-500/30 bg-amber-500/5 p-6" style={{ animationDelay: "60ms" }}>
            <h2 className="flex items-center gap-2 font-bold text-amber-400">
              <AlertTriangle size={20} /> Unlock your eligibility
            </h2>
            <p className="text-sm leading-relaxed text-slate-300">
              Your profile is missing mandatory items (language test, ECA, or 12 months of skilled
              experience). Your CRS estimate above only counts evidence you already have — complete
              the action plan to activate your full score.
            </p>
          </section>
        )}

        <section className="card animate-fade-up space-y-3 p-6" style={{ animationDelay: "120ms" }}>
          <h2 className="font-semibold text-white">Why this score</h2>
          {diag.breakdown.map((b) => (
            <div key={b.label} className="flex items-start justify-between gap-4 border-b border-slate-800 pb-3 last:border-0">
              <div>
                <p className="text-sm text-white">{b.label}</p>
                <p className="mt-0.5 text-xs text-slate-500">{b.note}</p>
              </div>
              <p className="flex-shrink-0 font-mono text-sm text-emerald-400">{b.points} pts</p>
            </div>
          ))}
          <div className="flex items-center justify-between pt-2">
            <p className="font-bold text-white">Estimated CRS total</p>
            <p className="font-bold text-emerald-400">≈ {diag.crsEstimate} pts</p>
          </div>
          <p className="text-xs text-slate-500">
            Indicative component estimate. Official CRS is calculated by IRCC at profile submission.
          </p>
        </section>

        <section className="card animate-fade-up space-y-4 p-6" style={{ animationDelay: "180ms" }}>
          <h2 className="flex items-center gap-2 font-semibold text-white">
            <MapPin size={18} className="text-emerald-400" /> Strongest pathways
          </h2>
          {diag.pathways.length === 0 && (
            <p className="text-sm text-slate-400">
              Pathway signals will appear once your occupation and credentials are mapped.
            </p>
          )}
          {diag.pathways.map((pw) => (
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

        {diag.provinceMatches && diag.provinceMatches.length > 0 && (
          <section className="card animate-fade-up space-y-4 p-6" style={{ animationDelay: "210ms" }}>
            <h2 className="flex items-center gap-2 font-semibold text-white">
              <MapPin size={18} className="text-emerald-400" /> Best province matches
            </h2>
            {diag.provinceMatches[0]?.province === "Not yet verified" ? (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                <p className="text-sm text-amber-300">{diag.provinceMatches[0].note}</p>
              </div>
            ) : (
              <>
                {diag.provinceMatches.map((pm) => (
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
                  Signal as of {diag.provinceMatches[0]?.asOf} — PNP occupation lists change quarterly. Verify
                  against the official provincial site before applying.
                </p>
              </>
            )}
          </section>
        )}

        {!showPrecision ? (
          <section className="card animate-fade-up space-y-4 border-emerald-500/30 bg-emerald-500/5 p-6" style={{ animationDelay: "240ms" }}>
            <div className="flex items-center gap-3">
              <Lock size={24} className="text-emerald-400" />
              <h2 className="text-lg font-bold text-white">Unlock 2026 Precision Report</h2>
            </div>
            <p className="text-sm leading-relaxed text-slate-300">
              Verify 2026 regulatory thresholds (ECA validity, admissibility, JAL/EPA status, proof
              of funds history) before sharing your file.
            </p>
            <button onClick={() => setShowPrecision(true)} className="btn-primary w-full py-4">
              <Unlock size={18} /> Start 60-Second Precision Check
            </button>
          </section>
        ) : (
          <section className="card animate-fade-up space-y-4 border-emerald-500/30 p-6" style={{ animationDelay: "240ms" }}>
            <h2 className="flex items-center gap-2 text-lg font-bold text-white">
              <ShieldCheck size={20} className="text-emerald-400" /> Regulatory & Precision Validation
            </h2>
            <div className="space-y-1">
              <Toggle label="Is your ECA less than 5 years old?" value={profile.ecaValid} onChange={(v) => set({ ecaValid: v })} />
              <Toggle label="Was any education completed in Canada?" value={profile.canadianEducation} onChange={(v) => set({ canadianEducation: v })} />
              <Toggle label="Is your occupation regulated in Canada?" value={profile.regulatedOccupation} onChange={(v) => set({ regulatedOccupation: v })} />
              <Toggle label="Are your language test results less than 2 years old?" value={profile.languageTestValid} onChange={(v) => set({ languageTestValid: v })} />
              <Toggle label="Do you have 12 consecutive months in your primary NOC?" value={profile.consecutive12Months} onChange={(v) => set({ consecutive12Months: v })} />
              <Toggle label="Is your occupation in a 2026 Priority Sector?" value={profile.prioritySector} onChange={(v) => set({ prioritySector: v })} />
              <Toggle label="Do you have a relative in your target province?" value={profile.relativeInProvince} onChange={(v) => set({ relativeInProvince: v })} />
              <div className="flex items-center justify-between border-b border-slate-800 py-3">
                <span className="flex-1 pr-4 text-sm text-slate-300">
                  Does your job offer have a JAL/EPA?
                </span>
                <select
                  value={profile.jalEpaApproved}
                  onChange={(e) => set({ jalEpaApproved: e.target.value })}
                  className="rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-white outline-none transition-colors focus:border-emerald-500/70"
                >
                  <option value="na">No Job Offer</option>
                  <option value="yes">Yes, Approved</option>
                  <option value="no">No, Pending</option>
                </select>
              </div>
              <Toggle label="Can you show a 6-month stable funds history?" value={profile.fundsHistory} onChange={(v) => set({ fundsHistory: v })} />
              <Toggle label="Any visa refusals or criminal/medical issues?" value={profile.visaRefusals || profile.criminalMedical} onChange={(v) => set({ visaRefusals: v, criminalMedical: v })} danger />
              <Toggle label="Currently in Canada on a permit expiring in under 6 months?" value={profile.permitExpirySoon} onChange={(v) => set({ inCanada: v, permitExpirySoon: v })} />
            </div>
            <button onClick={() => setDiag(runDiagnostics(profile))} className="btn-primary w-full py-4">
              <CheckCircle2 size={18} /> Generate Final 2026 Payload
            </button>
          </section>
        )}

        {/* Shareable report + premium teaser */}
        <section className="card animate-fade-up space-y-4 p-6" style={{ animationDelay: "300ms" }}>
          <h2 className="flex items-center gap-2 font-semibold text-white">
            <FileText size={20} className="text-emerald-400" /> Your report is ready
          </h2>
          <p className="text-sm leading-relaxed text-slate-400">
            Share your scorecard with a consultant or agent — or download the assessment data for
            your file.
          </p>
          <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 p-2 pl-3">
            <Link2 size={16} className="flex-shrink-0 text-slate-500" />
            <input
              readOnly
              value={portalLink}
              onFocus={(e) => e.target.select()}
              className="w-full bg-transparent font-mono text-xs text-slate-400 outline-none"
            />
            <button onClick={copyLink} className="btn-ghost flex-shrink-0 px-3 py-2 text-xs">
              {linkCopied ? <CheckCircle2 size={15} className="text-emerald-400" /> : <Copy size={15} />}
              <span className="hidden sm:inline">{linkCopied ? "Copied" : "Copy"}</span>
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <a
              href={shareWhatsApp}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost py-3"
            >
              <Send size={18} /> Send via WhatsApp
            </a>
            <a href={mailtoLink({ subject: `BACS 2026 Assessment — ${profile.name}`, body: reportEmailBody })} className="btn-primary py-3">
              <Mail size={18} /> Email to a consultant
            </a>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-800/30 p-3">
            <p className="text-xs text-slate-500">
              <span className="font-semibold text-slate-400">For your consultant or agent:</span>{" "}
              download the assessment data file (JSON) they can review or forward.
            </p>
            <button onClick={handleDownload} className="btn-ghost mt-3 w-full py-2.5 text-sm">
              <FileDown size={16} /> Download assessment data (JSON)
            </button>
          </div>
        </section>

        {/* Premium teaser — manual, no checkout */}
        <section className="card animate-fade-up space-y-4 border-emerald-500/30 bg-emerald-500/5 p-6" style={{ animationDelay: "360ms" }}>
          <div className="flex items-center gap-3">
            <Sparkles size={24} className="text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Want a complete, assessed candidate file?</h2>
          </div>
          <p className="text-sm leading-relaxed text-slate-300">
            Forward your report to a consultant or immigration agency for a full per-case
            assessment — or contact us directly. A personalized interactive website is also
            available as an optional premium add-on.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <a
              href={whatsappLink({
                text: `Hello, I completed the free assessment and would like a complete, assessed candidate file.\n\nName: ${profile.name}\nReport: ${portalLink}`,
              })}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary py-3"
            >
              <MessageCircle size={18} /> Message us on WhatsApp
            </a>
            <a href={mailtoLink({ subject: "Requesting a complete assessment", body: `Hello, I completed the free assessment and would like a complete, assessed candidate file.\n\nName: ${profile.name}\nEmail: ${profile.email}\nReport: ${portalLink}` })} className="btn-ghost py-3">
              <Mail size={18} /> Email a request
            </a>
          </div>
          <p className="text-center text-xs text-slate-500">
            Reach us directly: {CONSULTANT_WHATSAPP_DISPLAY}
          </p>
        </section>
      </div>
    );
  }

  /* ----------------------------------- FORM ----------------------------------- */

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 py-10 sm:py-14">
      <div className="animate-fade-up space-y-2">
        <div className="flex items-end justify-between text-xs text-slate-400">
          <span>
            Step <span className="font-semibold text-white">{step + 1}</span> of 5 —{" "}
            <span className="font-semibold text-emerald-400">{STEP_TITLES[step]}</span>
          </span>
          <span className="font-mono text-slate-500">{Math.round(((step + 1) / 5) * 100)}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500"
            style={{ width: `${((step + 1) / 5) * 100}%` }}
          />
        </div>
        <p className="text-xs leading-relaxed text-slate-500">{STEP_EXPLAINERS[step]}</p>
      </div>

      <form
        className="card animate-fade-up relative space-y-5 p-6 sm:p-8"
        key={step}
        onSubmit={(e) => {
          e.preventDefault();
          handleContinue();
        }}
      >
        <div className="absolute -top-px left-6 right-6 h-px bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />

        {step === 0 && (
          <>
            <div className="space-y-2">
              <label className="field-label" htmlFor="full-name">Full name</label>
              <input
                id="full-name"
                type="text"
                value={profile.name}
                onChange={(e) => set({ name: e.target.value })}
                className="field-input"
                placeholder="e.g. Priya Sharma"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="field-label" htmlFor="email">Email (for your report)</label>
              <input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => set({ email: e.target.value })}
                className="field-input"
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-2">
              <label className="field-label" htmlFor="goal">Primary goal (intent)</label>
              <select id="goal" value={profile.primaryGoal} onChange={(e) => set({ primaryGoal: e.target.value })} className="field-input">
                <option value="Express Entry (PR)">Express Entry / Skilled Worker (PR)</option>
                <option value="Study in Canada">Study in Canada (Student Visa)</option>
                <option value="Work Permit">Work Permit / Job Offer</option>
                <option value="Not Sure">Not Sure / Explore Options</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="field-label" htmlFor="age">Age</label>
                <input id="age" type="number" value={profile.age} onChange={(e) => set({ age: parseInt(e.target.value) || 0 })} className="field-input" />
              </div>
              <div className="space-y-2">
                <label className="field-label" htmlFor="family">Family size</label>
                <input id="family" type="number" value={profile.familySize} onChange={(e) => set({ familySize: parseInt(e.target.value) || 1 })} className="field-input" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="field-label" htmlFor="province">Target province</label>
              <select id="province" value={profile.provinceInterest} onChange={(e) => set({ provinceInterest: e.target.value })} className="field-input">
                {[
                  "No preference",
                  "Alberta",
                  "Saskatchewan",
                  "British Columbia",
                  "Nova Scotia",
                  "Prince Edward Island",
                  "Yukon",
                  "Ontario",
                  "Manitoba",
                  "New Brunswick",
                ].map((pr) => (
                  <option key={pr}>{pr}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={!profile.hasLanguageTest}
                onChange={(e) =>
                  set({
                    hasLanguageTest: !e.target.checked,
                    clb: e.target.checked ? 0 : overallClb(profile.ielts),
                  })
                }
                className="h-4 w-4 rounded border-slate-700 bg-slate-800 accent-emerald-500"
              />
              I do not have IELTS/CELPIP yet
            </label>
            {profile.hasLanguageTest && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="field-label" htmlFor="ielts-r">IELTS Reading</label>
                    <input id="ielts-r" type="number" step="0.5" min="0" max="9" placeholder="e.g. 7.0" value={profile.ielts.reading || ""} onChange={(e) => updateIelts("reading", parseFloat(e.target.value) || 0)} className="field-input" />
                  </div>
                  <div className="space-y-2">
                    <label className="field-label" htmlFor="ielts-w">IELTS Writing</label>
                    <input id="ielts-w" type="number" step="0.5" min="0" max="9" placeholder="e.g. 7.0" value={profile.ielts.writing || ""} onChange={(e) => updateIelts("writing", parseFloat(e.target.value) || 0)} className="field-input" />
                  </div>
                  <div className="space-y-2">
                    <label className="field-label" htmlFor="ielts-l">IELTS Listening</label>
                    <input id="ielts-l" type="number" step="0.5" min="0" max="9" placeholder="e.g. 7.5" value={profile.ielts.listening || ""} onChange={(e) => updateIelts("listening", parseFloat(e.target.value) || 0)} className="field-input" />
                  </div>
                  <div className="space-y-2">
                    <label className="field-label" htmlFor="ielts-s">IELTS Speaking</label>
                    <input id="ielts-s" type="number" step="0.5" min="0" max="9" placeholder="e.g. 7.0" value={profile.ielts.speaking || ""} onChange={(e) => updateIelts("speaking", parseFloat(e.target.value) || 0)} className="field-input" />
                  </div>
                </div>
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
                    <BadgeCheck size={16} /> Calculated language level: CLB {profile.clb}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Based on your lowest band, per IRCC equivalency tables.
                  </p>
                </div>
              </>
            )}
            <div className="space-y-2">
              <label className="field-label" htmlFor="french">Do you also speak French?</label>
              <select id="french" value={profile.french ? "yes" : "no"} onChange={(e) => set({ french: e.target.value === "yes" })} className="field-input">
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="space-y-2">
              <label className="field-label" htmlFor="edu">Highest education level</label>
              <select id="edu" value={profile.education} onChange={(e) => set({ education: e.target.value })} className="field-input">
                {["High School", "Diploma", "Bachelors", "Masters", "PhD"].map((ed) => (
                  <option key={ed}>{ed}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="field-label" htmlFor="edu-country">Where was it completed?</label>
              <select id="edu-country" value={profile.educationCountry} onChange={(e) => set({ educationCountry: e.target.value })} className="field-input">
                <option value="outside">Outside Canada</option>
                <option value="inside">Inside Canada</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="field-label" htmlFor="eca">ECA status</label>
              <select id="eca" value={profile.ecaStatus} onChange={(e) => set({ ecaStatus: e.target.value })} className="field-input">
                <option value="not_done">Not done yet</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div className="flex items-start gap-2.5 rounded-xl border border-slate-800 bg-slate-800/40 p-4 text-xs text-slate-400">
              <GraduationCap size={16} className="mt-0.5 flex-shrink-0 text-emerald-400" />
              <p>
                Foreign education only counts after an <span className="font-semibold text-white">ECA</span>. We
                keep your score honest — no points for unassessed credentials.
              </p>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="relative space-y-2">
              <label className="field-label" htmlFor="occupation">Skilled work experience (occupation / job title)</label>
              <input
                id="occupation"
                type="text"
                placeholder="Start typing (e.g. Painter, Tailor, Nurse, Security guard)"
                value={profile.occupation}
                onChange={(e) => {
                  updateOccupation(e.target.value);
                  setOccSuggestOpen(true);
                }}
                onFocus={() => setOccSuggestOpen(true)}
                onBlur={() => setTimeout(() => setOccSuggestOpen(false), 150)}
                autoComplete="off"
                className="field-input"
              />
              {occSuggestOpen && profile.occupation.trim().length >= 2 && searchNoc(profile.occupation).length > 0 && (
                <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-xl">
                  {searchNoc(profile.occupation).map((m) => (
                    <li key={m.noc}>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          set({ occupation: m.title, nocCode: m.noc, teerLevel: m.teer });
                          setOccSuggestOpen(false);
                        }}
                        className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm text-slate-200 transition-colors hover:bg-emerald-500/10"
                      >
                        <span>{m.title}</span>
                        <span className="flex-shrink-0 font-mono text-xs text-slate-500">NOC {m.noc}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="field-label" htmlFor="noc">NOC code</label>
                <a
                  href="https://noc.esdc.gc.ca/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mb-1 block text-xs text-amber-400 transition-colors hover:text-amber-300"
                >
                  Find my NOC ↗
                </a>
                <input id="noc" type="text" value={profile.nocCode} onChange={(e) => set({ nocCode: e.target.value })} className="field-input" />
              </div>
              <div className="space-y-2">
                <label className="field-label" htmlFor="teer">TEER level</label>
                <select id="teer" value={profile.teerLevel} onChange={(e) => set({ teerLevel: e.target.value })} className="field-input">
                  <option value="unmapped">Infer from occupation</option>
                  {["0", "1", "2", "3", "4", "5"].map((t) => (
                    <option key={t} value={t}>
                      TEER {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {profile.nocCode !== "Unmapped" && profile.occupation && (
              <p className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400">
                <BadgeCheck size={14} className="flex-shrink-0" />
                Auto-mapped from your job title. Verify your daily duties match this NOC on the official tool.
              </p>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="field-label" htmlFor="months">Continuous experience, last 3 yrs (months)</label>
                <input id="months" type="number" placeholder="e.g. 12" value={profile.continuousMonths || ""} onChange={(e) => set({ continuousMonths: parseInt(e.target.value) || 0 })} className="field-input" />
              </div>
              <div className="space-y-2">
                <label className="field-label" htmlFor="years">Total related experience (years)</label>
                <input id="years" type="number" placeholder="e.g. 3" value={profile.experienceYears || ""} onChange={(e) => set({ experienceYears: parseInt(e.target.value) || 0 })} className="field-input" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="field-label" htmlFor="can-exp">Skilled work experience inside Canada?</label>
              <select id="can-exp" value={profile.canadianExperience ? "yes" : "no"} onChange={(e) => set({ canadianExperience: e.target.value === "yes" })} className="field-input">
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <div className="space-y-2">
              <label className="field-label" htmlFor="funds">Liquid funds (CAD)</label>
              <input id="funds" type="number" value={profile.fundsCAD} onChange={(e) => set({ fundsCAD: parseInt(e.target.value) || 0 })} className="field-input" />
            </div>
            <div className="space-y-2">
              <label className="field-label" htmlFor="offer">Canadian job offer?</label>
              <select id="offer" value={profile.jobOffer ? "yes" : "no"} onChange={(e) => set({ jobOffer: e.target.value === "yes" })} className="field-input">
                <option value="no">No job offer</option>
                <option value="yes">Yes</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="field-label" htmlFor="timeline">Timeline</label>
              <select id="timeline" value={profile.timeline} onChange={(e) => set({ timeline: e.target.value })} className="field-input">
                <option value="<6m">Under 6 months</option>
                <option value="6-12m">6-12 months</option>
                <option value="1-2y">1-2 years</option>
                <option value="exploring">Just exploring</option>
              </select>
            </div>
            <div className="flex items-start gap-2.5 rounded-xl border border-slate-800 bg-slate-800/40 p-4 text-xs text-slate-400">
              <Briefcase size={16} className="mt-0.5 flex-shrink-0 text-emerald-400" />
              <p>
                Settlement funds are a hard eligibility threshold for FSW/FST. We compare your savings
                against the 2026 IRCC table for your family size.
              </p>
            </div>
          </>
        )}

        <div className="flex gap-3 pt-2">
          {step > 0 && (
            <button type="button" onClick={() => setStep(step - 1)} className="btn-ghost px-5 py-3">
              <ArrowLeft size={16} /> Back
            </button>
          )}
          <button type="submit" className="btn-primary group flex-1 py-3">
            {step < 4 ? (
              <>
                Continue <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </>
            ) : (
              <>
                See my results <ChevronRight size={16} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}