'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  MapPin,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { BACSProfile, BACSPayload, Diagnostics } from '@/lib/types';
import { runDiagnostics } from '@/lib/engine';

const STEP_TITLES = ['Personal snapshot', 'Language', 'Education', 'Work history', 'Funds & timeline'];

const DEFAULT_PROFILE: BACSProfile = {
  name: '',
  age: 30,
  familySize: 1,
  provinceInterest: 'No preference',
  languageLevel: 'none',
  french: false,
  education: 'Bachelors',
  educationCountry: 'outside',
  ecaStatus: 'not_done',
  occupation: '',
  teerBand: 'professional',
  experienceYears: 3,
  canadianExperience: false,
  fundsCAD: 25000,
  jobOffer: false,
  timeline: '6-12m',
};

const inputClass =
  'w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none';
const labelClass = 'text-sm text-slate-300';

export default function IntakeEngine() {
  const [stage, setStage] = useState<'landing' | 'form' | 'results'>('landing');
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<BACSProfile>(DEFAULT_PROFILE);
  const [diag, setDiag] = useState<Diagnostics | null>(null);

  const set = (patch: Partial<BACSProfile>) => setProfile({ ...profile, ...patch });

  const handleContinue = () => {
    if (step === 0 && !profile.name.trim()) {
      alert('Please enter your name to continue.');
      return;
    }
    if (step < 4) {
      setStep(step + 1);
      return;
    }
    setDiag(runDiagnostics(profile));
    setStage('results');
  };

  const buildPayload = (): BACSPayload => {
    const d = diag as Diagnostics;
    return {
      bacs_version: '2.0',
      generated_at: new Date().toISOString(),
      profile,
      diagnostics: d,
      crs_estimate: d.crsBand,
      primary_pathway: d.pathways[0]?.name ?? 'To be determined',
      strategy_notes: d.strategyText,
    };
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(buildPayload(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bacs-assessment-${profile.name.trim().replace(/\s+/g, '-').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const portalUrl = () => {
    const encoded = btoa(encodeURIComponent(JSON.stringify(buildPayload())));
    return `/portal?data=${encoded}`;
  };

  // ---------- LANDING ----------
  if (stage === 'landing') {
    return (
      <div className="max-w-2xl w-full mx-auto space-y-8 py-12">
        <header className="text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium text-emerald-400 tracking-wide uppercase">
            <ShieldCheck size={14} /> BACS Intake Protocol
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-white leading-tight">
            Find out your Canada PR readiness in 4 minutes
          </h1>
          <p className="text-slate-400 leading-relaxed">
            Answer a few questions about your background. You get an instant readiness score, an
            estimated CRS band, your best-fit pathways, and your three biggest obstacles. Your
            consultant receives a structured report for the full strategic assessment.
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-xs text-slate-300">
            <span className="flex items-center gap-1.5 glass px-3 py-1.5 rounded-full"><CheckCircle2 size={13} className="text-emerald-400" /> Free — no sign-up</span>
            <span className="flex items-center gap-1.5 glass px-3 py-1.5 rounded-full"><Clock size={13} className="text-emerald-400" /> 4-minute assessment</span>
            <span className="flex items-center gap-1.5 glass px-3 py-1.5 rounded-full"><Sparkles size={13} className="text-emerald-400" /> Instant results</span>
          </div>
        </header>

        <div className="glass p-6 rounded-2xl space-y-3">
          <h2 className="text-white font-semibold">Before you start</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Have these handy if available: your language test scores (IELTS/CELPIP), your highest
            education level, and a rough list of your work history with job titles.
          </p>
          <p className="text-emerald-400 text-sm">
            Don&apos;t have everything? Start anyway — you&apos;ll still get an estimate and a gap list.
          </p>
        </div>

        <button
          onClick={() => setStage('form')}
          className="w-full flex items-center justify-center gap-2 bg-bacs-accent hover:bg-bacs-accentHover text-slate-950 font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20 text-lg"
        >
          Start assessment <ArrowRight size={20} />
        </button>

        <p className="text-center text-xs text-slate-500">
          Prepared for you by your immigration consultant • Powered by BACS • Educational estimate, not legal advice.
        </p>
      </div>
    );
  }

  // ---------- RESULTS ----------
  if (stage === 'results' && diag) {
    const scoreColor =
      diag.readinessScore >= 75 ? 'text-emerald-400' : diag.readinessScore >= 40 ? 'text-amber-400' : 'text-rose-400';
    return (
      <div className="max-w-2xl w-full mx-auto space-y-6 py-12">
        <header className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium text-emerald-400 tracking-wide uppercase">
            <Sparkles size={14} /> Your Canada Readiness Snapshot
          </div>
          <p className="text-slate-400 text-sm">Based on your self-reported answers. Indicative, not legal advice.</p>
        </header>

        <div className="glass p-6 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm">Readiness</p>
            <p className="text-white text-2xl font-bold">{diag.classification}</p>
            <p className="text-slate-400 text-sm mt-2">Estimated CRS band: <span className="text-white font-semibold">{diag.crsBand}</span></p>
          </div>
          <p className={`text-6xl font-bold ${scoreColor}`}>{diag.readinessScore}</p>
        </div>

        <div className="glass p-6 rounded-2xl space-y-4">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <MapPin size={18} className="text-emerald-400" /> Strongest pathway signals
          </h2>
          {diag.pathways.map((pw) => (
            <div key={pw.name} className="border border-slate-800 rounded-xl p-4">
              <div className="flex justify-between items-center">
                <p className="text-white text-sm font-medium">{pw.name}</p>
                <p className="text-emerald-400 font-mono text-sm">{pw.fit}%</p>
              </div>
              <p className="text-slate-400 text-xs mt-1">{pw.note}</p>
            </div>
          ))}
        </div>

        <div className="glass p-6 rounded-2xl space-y-4">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-400" /> Your biggest obstacles & how to close them
          </h2>
          {diag.obstacles.length === 0 ? (
            <p className="text-slate-300 text-sm">No critical gaps detected. Your profile is structurally strong.</p>
          ) : (
            diag.obstacles.slice(0, 3).map((o, i) => (
              <div key={o.title} className="border border-slate-800 rounded-xl p-4">
                <p className="text-white text-sm font-medium">{i + 1}. {o.title}</p>
                <p className="text-slate-400 text-xs mt-1">{o.fix}</p>
              </div>
            ))
          )}
          <div className="border border-emerald-500/30 bg-emerald-500/5 rounded-xl p-4">
            <p className="text-emerald-400 text-sm font-semibold">Next best step</p>
            <p className="text-slate-300 text-sm mt-1">{diag.nextStep}</p>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl space-y-4">
          <h2 className="text-white font-semibold">Take your report with you</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Your detailed report is ready. Forward the assessment file to your immigration
            consultant — they will use it to request your full BACS strategic assessment and
            personalized relocation portal.
          </p>
          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 bg-bacs-accent hover:bg-bacs-accentHover text-slate-950 font-bold py-4 rounded-xl transition-all"
          >
            <Download size={18} /> Download my assessment file
          </button>
          <a
            href={portalUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 glass hover:bg-slate-800/60 text-white font-semibold py-4 rounded-xl transition-all"
          >
            <ExternalLink size={18} /> Open my personal relocation portal
          </a>
          <button onClick={() => { setStage('landing'); setStep(0); setProfile(DEFAULT_PROFILE); setDiag(null); }} className="w-full text-slate-500 text-xs hover:text-slate-300">
            Start over
          </button>
        </div>
      </div>
    );
  }

  // ---------- ASSESSMENT ----------
  return (
    <div className="max-w-2xl w-full mx-auto space-y-6 py-12">
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Step {step + 1} of 5 — {STEP_TITLES[step]}</span>
          <span>{Math.round(((step + 1) / 5) * 100)}%</span>
        </div>
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-bacs-accent transition-all" style={{ width: `${((step + 1) / 5) * 100}%` }} />
        </div>
      </div>

      <div className="glass p-6 sm:p-8 rounded-2xl space-y-5">
        {step === 0 && (
          <>
            <div className="space-y-2">
              <label className={labelClass}>Full name</label>
              <input type="text" value={profile.name} onChange={(e) => set({ name: e.target.value })} className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={labelClass}>Age</label>
                <input type="number" value={profile.age} onChange={(e) => set({ age: parseInt(e.target.value) || 0 })} className={inputClass} />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Family size (including you)</label>
                <input type="number" value={profile.familySize} onChange={(e) => set({ familySize: parseInt(e.target.value) || 1 })} className={inputClass} />
              </div>
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Province you&apos;re most interested in</label>
              <select value={profile.provinceInterest} onChange={(e) => set({ provinceInterest: e.target.value })} className={inputClass}>
                {['No preference', 'Alberta', 'Saskatchewan', 'British Columbia', 'Nova Scotia', 'Prince Edward Island', 'Yukon', 'Ontario', 'Manitoba', 'New Brunswick'].map((pr) => (
                  <option key={pr}>{pr}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div className="space-y-2">
              <label className={labelClass}>English language level</label>
              <select value={profile.languageLevel} onChange={(e) => set({ languageLevel: e.target.value })} className={inputClass}>
                <option value="none">No test yet</option>
                <option value="below7">Below CLB 7</option>
                <option value="clb7_8">CLB 7–8</option>
                <option value="clb9">CLB 9 or higher</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Do you also speak French?</label>
              <select value={profile.french ? 'yes' : 'no'} onChange={(e) => set({ french: e.target.value === 'yes' })} className={inputClass}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
              <p className="text-emerald-400 text-xs">French ability can add meaningful CRS points.</p>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="space-y-2">
              <label className={labelClass}>Highest education level</label>
              <select value={profile.education} onChange={(e) => set({ education: e.target.value })} className={inputClass}>
                {['High School', 'Diploma', 'Bachelors', 'Masters', 'PhD'].map((ed) => (
                  <option key={ed}>{ed}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Where was it completed?</label>
              <select value={profile.educationCountry} onChange={(e) => set({ educationCountry: e.target.value })} className={inputClass}>
                <option value="outside">Outside Canada</option>
                <option value="inside">Inside Canada</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Educational Credential Assessment (ECA) status</label>
              <select value={profile.ecaStatus} onChange={(e) => set({ ecaStatus: e.target.value })} className={inputClass}>
                <option value="not_done">Not done yet</option>
                <option value="done">Done</option>
                <option value="unknown">Unknown</option>
              </select>
              {profile.educationCountry === 'outside' && profile.ecaStatus !== 'done' && (
                <p className="text-amber-400 text-xs">We&apos;ll flag the ECA as a priority — foreign education needs it to count.</p>
              )}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="space-y-2">
              <label className={labelClass}>Current / target occupation</label>
              <input type="text" placeholder="e.g., Software Engineer, Welder, Nurse" value={profile.occupation} onChange={(e) => set({ occupation: e.target.value })} className={inputClass} />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Which best describes your role?</label>
              <select value={profile.teerBand} onChange={(e) => set({ teerBand: e.target.value })} className={inputClass}>
                <option value="professional">Professional — university degree (TEER 0–1)</option>
                <option value="technical">Technical / trades — college or apprenticeship (TEER 2–3)</option>
                <option value="intermediate">Intermediate — high school or on-the-job training (TEER 4–5)</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={labelClass}>Skilled experience (years)</label>
                <input type="number" value={profile.experienceYears} onChange={(e) => set({ experienceYears: parseInt(e.target.value) || 0 })} className={inputClass} />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Canadian work experience?</label>
                <select value={profile.canadianExperience ? 'yes' : 'no'} onChange={(e) => set({ canadianExperience: e.target.value === 'yes' })} className={inputClass}>
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <div className="space-y-2">
              <label className={labelClass}>Liquid settlement funds (CAD)</label>
              <input type="number" value={profile.fundsCAD} onChange={(e) => set({ fundsCAD: parseInt(e.target.value) || 0 })} className={inputClass} />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Do you have a Canadian job offer?</label>
              <select value={profile.jobOffer ? 'yes' : 'no'} onChange={(e) => set({ jobOffer: e.target.value === 'yes' })} className={inputClass}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Your timeline</label>
              <select value={profile.timeline} onChange={(e) => set({ timeline: e.target.value })} className={inputClass}>
                <option value="<6m">Under 6 months</option>
                <option value="6-12m">6–12 months</option>
                <option value="1-2y">1–2 years</option>
                <option value="exploring">Just exploring</option>
              </select>
            </div>
          </>
        )}

        <div className="flex gap-3 pt-2">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} className="flex items-center justify-center gap-2 glass hover:bg-slate-800/60 text-slate-300 font-semibold py-3 px-5 rounded-xl transition-all">
              <ArrowLeft size={16} /> Back
            </button>
          )}
          <button onClick={handleContinue} className="flex-1 flex items-center justify-center gap-2 bg-bacs-accent hover:bg-bacs-accentHover text-slate-950 font-bold py-3 rounded-xl transition-all">
            {step < 4 ? 'Continue' : 'See my results'} <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
