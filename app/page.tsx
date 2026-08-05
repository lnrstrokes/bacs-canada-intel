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
  FileDown,
  FileJson,
  Gauge,
  Globe2,
  GraduationCap,
  Languages,
  Lock,
  MapPin,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Unlock,
  Wallet,
} from "lucide-react";
import { BACSProfile, BACSPayload, Diagnostics, IELTSScores } from "@/lib/types";
import { runDiagnostics } from "@/lib/engine";
import { overallClb } from "@/lib/clb";
import { inferNoc } from "@/lib/noc";

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

const StatChip = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="card card-hover flex items-center gap-3 px-4 py-3">
    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 ring-1 ring-emerald-500/25">
      {icon}
    </span>
    <span className="leading-tight">
      <span className="block text-sm font-semibold text-white">{value}</span>
      <span className="block text-[11px] text-slate-500">{label}</span>
    </span>
  </div>
);

const FeatureCard = ({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) => (
  <div className="card card-hover group p-5 text-left">
    <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/25 transition-colors duration-300 group-hover:bg-emerald-500/20">
      {icon}
    </span>
    <h3 className="mb-1.5 text-sm font-bold text-white">{title}</h3>
    <p className="text-xs leading-relaxed text-slate-400">{body}</p>
  </div>
);

export default function IntakeEngine() {
  const [stage, setStage] = useState<"landing" | "form" | "results">("landing");
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<BACSProfile>(DEFAULT_PROFILE);
  const [diag, setDiag] = useState<Diagnostics | null>(null);
  const [showPrecision, setShowPrecision] = useState(false);

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
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center space-y-10 py-12 text-center sm:py-16">
        <header className="animate-fade-up space-y-5">
          <div className="chip mx-auto border-emerald-500/25 bg-emerald-500/10 text-emerald-400">
            <ShieldCheck size={14} /> 2026 BACS Protocol
          </div>
          <h1 className="mx-auto max-w-2xl text-balance text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
            Your Canada PR readiness, <span className="text-gradient">scored in 4 minutes</span>
          </h1>
          <p className="mx-auto max-w-xl leading-relaxed text-slate-400">
            Answer a few questions. Get an honest readiness score, a component-based CRS estimate,
            and your strongest pathways. Every stage is explained — you see exactly why your score
            is what it is.
          </p>
        </header>

        <div className="animate-fade-up grid w-full grid-cols-2 gap-3 sm:grid-cols-4" style={{ animationDelay: "80ms" }}>
          <StatChip icon={<Gauge size={16} className="text-emerald-400" />} label="Deterministic engine" value="100%" />
          <StatChip icon={<Globe2 size={16} className="text-emerald-400" />} label="2026 IRCC tables" value="Live" />
          <StatChip icon={<BadgeCheck size={16} className="text-emerald-400" />} label="NOC 2021 mapping" value="Auto" />
          <StatChip icon={<FileJson size={16} className="text-emerald-400" />} label="Consultant payload" value="JSON" />
        </div>

        <div className="animate-fade-up grid w-full gap-3 sm:grid-cols-3" style={{ animationDelay: "160ms" }}>
          <FeatureCard
            icon={<Gauge size={18} className="text-emerald-400" />}
            title="Human capital scoring"
            body="Age, education, CLB language level and work history scored against 2026 federal tables — no guesswork, no black box."
          />
          <FeatureCard
            icon={<Languages size={18} className="text-emerald-400" />}
            title="CLB & NOC auto-mapping"
            body="IELTS bands convert to your real CLB. Job titles map to NOC 2021 codes and TEER levels with a built-in duty check reminder."
          />
          <FeatureCard
            icon={<Wallet size={18} className="text-emerald-400" />}
            title="Actionable pathway plan"
            body="Weaknesses ranked by severity with concrete fixes, plus your strongest provincial and federal pathway signals."
          />
        </div>

        <div className="animate-fade-up w-full space-y-3" style={{ animationDelay: "240ms" }}>
          <button
            onClick={() => setStage("form")}
            className="btn-primary group w-full py-4 text-lg"
          >
            Start assessment
            <ArrowRight size={20} className="transition-transform duration-200 group-hover:translate-x-1" />
          </button>
          <p className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
            <Clock size={12} /> Takes ~4 minutes · No account required · Downloadable report
          </p>
        </div>
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

        {!showPrecision ? (
          <section className="card animate-fade-up space-y-4 border-emerald-500/30 bg-emerald-500/5 p-6" style={{ animationDelay: "240ms" }}>
            <div className="flex items-center gap-3">
              <Lock size={24} className="text-emerald-400" />
              <h2 className="text-lg font-bold text-white">Unlock 2026 Precision Report</h2>
            </div>
            <p className="text-sm leading-relaxed text-slate-300">
              Verify 2026 regulatory thresholds (ECA validity, admissibility, JAL/EPA status, proof
              of funds history) and generate your final Consultant Payload in 60 seconds.
            </p>
            <button
              onClick={() => setShowPrecision(true)}
              className="btn-primary w-full py-4"
            >
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
            <button
              onClick={() => setDiag(runDiagnostics(profile))}
              className="btn-primary w-full py-4"
            >
              <CheckCircle2 size={18} /> Generate Final 2026 Payload
            </button>
          </section>
        )}

        {showPrecision && (
          <section className="card animate-fade-up space-y-4 p-6" style={{ animationDelay: "300ms" }}>
            <h2 className="flex items-center gap-2 font-semibold text-white">
              <FileJson size={20} className="text-emerald-400" /> Your final report is ready
            </h2>
            <p className="text-sm leading-relaxed text-slate-400">
              Download this file and send it to your immigration consultant. They will use it to
              build your personalized relocation roadmap.
            </p>
            <button onClick={handleDownload} className="btn-primary w-full py-4">
              <FileDown size={18} /> Download 2026 Assessment File
            </button>
          </section>
        )}
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
                    <input id="ielts-r" type="number" step="0.5" min="0" max="9" value={profile.ielts.reading} onChange={(e) => updateIelts("reading", parseFloat(e.target.value) || 0)} className="field-input" />
                  </div>
                  <div className="space-y-2">
                    <label className="field-label" htmlFor="ielts-w">IELTS Writing</label>
                    <input id="ielts-w" type="number" step="0.5" min="0" max="9" value={profile.ielts.writing} onChange={(e) => updateIelts("writing", parseFloat(e.target.value) || 0)} className="field-input" />
                  </div>
                  <div className="space-y-2">
                    <label className="field-label" htmlFor="ielts-l">IELTS Listening</label>
                    <input id="ielts-l" type="number" step="0.5" min="0" max="9" value={profile.ielts.listening} onChange={(e) => updateIelts("listening", parseFloat(e.target.value) || 0)} className="field-input" />
                  </div>
                  <div className="space-y-2">
                    <label className="field-label" htmlFor="ielts-s">IELTS Speaking</label>
                    <input id="ielts-s" type="number" step="0.5" min="0" max="9" value={profile.ielts.speaking} onChange={(e) => updateIelts("speaking", parseFloat(e.target.value) || 0)} className="field-input" />
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
            <div className="space-y-2">
              <label className="field-label" htmlFor="occupation">Skilled work experience (occupation / job title)</label>
              <input
                id="occupation"
                type="text"
                placeholder="Start typing (e.g. Software developer, Cook, Truck driver)"
                value={profile.occupation}
                onChange={(e) => updateOccupation(e.target.value)}
                className="field-input"
              />
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
                <input id="months" type="number" value={profile.continuousMonths} onChange={(e) => set({ continuousMonths: parseInt(e.target.value) || 0 })} className="field-input" />
              </div>
              <div className="space-y-2">
                <label className="field-label" htmlFor="years">Total related experience (years)</label>
                <input id="years" type="number" value={profile.experienceYears} onChange={(e) => set({ experienceYears: parseInt(e.target.value) || 0 })} className="field-input" />
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
