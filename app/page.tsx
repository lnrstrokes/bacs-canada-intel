'use client';

import { useState } from 'react';
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Clock, Download, ExternalLink, MapPin, ShieldCheck, Sparkles, Lock, Unlock } from 'lucide-react';
import { BACSProfile, BACSPayload, Diagnostics } from '@/lib/types';
import { runDiagnostics } from '@/lib/engine';

const STEP_TITLES = ['Personal snapshot', 'Language', 'Education', 'Work history', 'Funds & timeline'];

const DEFAULT_PROFILE: BACSProfile = {
  name: '', age: 30, familySize: 1, provinceInterest: 'No preference',
  languageLevel: 'none', french: false, education: 'Bachelors', educationCountry: 'outside',
  ecaStatus: 'not_done', occupation: '', teerBand: 'professional', experienceYears: 3,
  canadianExperience: false, fundsCAD: 25000, jobOffer: false, timeline: '6-12m',
  // Precision defaults
  ecaValid: true, canadianEducation: false, regulatedOccupation: false,
  languageTestValid: true, secondLanguage: false, consecutive12Months: true,
  prioritySector: false, relativeInProvince: false, previousProvinceTies: false,
  jalEpaApproved: 'na', maritalStatus: 'Single', spouseAccompanying: false,
  spousePoints: false, fundsHistory: true, visaRefusals: false, criminalMedical: false,
  inCanada: false, permitExpirySoon: false
};

const inputClass = 'w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none';
const labelClass = 'text-sm text-slate-300';

const Toggle = ({ label, value, onChange, danger }: { label: string, value: boolean, onChange: (v: boolean) => void, danger?: boolean }) => (
  <div className="flex justify-between items-center py-3 border-b border-slate-800 last:border-0">
    <span className="text-slate-300 text-sm flex-1 pr-4">{label}</span>
    <div className="flex gap-2 flex-shrink-0">
      <button onClick={() => onChange(true)} className={`px-3 py-1 rounded text-xs font-semibold transition-all ${value ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>Yes</button>
      <button onClick={() => onChange(false)} className={`px-3 py-1 rounded text-xs font-semibold transition-all ${!value ? (danger ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50' : 'bg-slate-700 text-white') : 'bg-slate-800 text-slate-400'}`}>No</button>
    </div>
  </div>
);

export default function IntakeEngine() {
  const [stage, setStage] = useState<'landing' | 'form' | 'results'>('landing');
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<BACSProfile>(DEFAULT_PROFILE);
  const [diag, setDiag] = useState<Diagnostics | null>(null);
  const [showPrecision, setShowPrecision] = useState(false);

  const set = (patch: Partial<BACSProfile>) => setProfile({ ...profile, ...patch });

  const handleContinue = () => {
    if (step === 0 && !profile.name.trim()) { alert('Please enter your name.'); return; }
    if (step < 4) { setStep(step + 1); return; }
    setDiag(runDiagnostics(profile));
    setStage('results');
  };

  const handlePrecisionComplete = () => {
    setDiag(runDiagnostics(profile)); // Re-run with precision data
  };

  const buildPayload = (): BACSPayload => {
    const d = diag as Diagnostics;
    return {
      bacs_version: '2.1', generated_at: new Date().toISOString(), profile, diagnostics: d,
      crs_estimate: d.crsBand, primary_pathway: d.pathways[0]?.name ?? 'TBD', strategy_notes: d.strategyText,
    };
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(buildPayload(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bacs-2026-${profile.name.trim().replace(/\s+/g, '-').toLowerCase()}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const portalUrl = () => {
    const encoded = btoa(encodeURIComponent(JSON.stringify(buildPayload())));
    return `/portal?data=${encoded}`;
  };

  if (stage === 'landing') {
    return (
      <div className="max-w-2xl w-full mx-auto space-y-8 py-12">
        <header className="text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium text-emerald-400 tracking-wide uppercase">
            <ShieldCheck size={14} /> 2026 BACS Protocol
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-white leading-tight">
            Find out your Canada PR readiness in 4 minutes
          </h1>
          <p className="text-slate-400 leading-relaxed">
            Answer a few questions. Get an instant readiness score, CRS band, and pathway signals. 
            Then, unlock the 2026 Regulatory Precision Check to generate your final consultant report.
          </p>
        </header>
        <button onClick={() => setStage('form')} className="w-full flex items-center justify-center gap-2 bg-bacs-accent hover:bg-bacs-accentHover text-slate-950 font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20 text-lg">
          Start assessment <ArrowRight size={20} />
        </button>
      </div>
    );
  }

  if (stage === 'results' && diag) {
    const scoreColor = diag.readinessScore >= 75 ? 'text-emerald-400' : diag.readinessScore >= 40 ? 'text-amber-400' : 'text-rose-400';
    
    return (
      <div className="max-w-2xl w-full mx-auto space-y-6 py-12">
        <header className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium text-emerald-400 tracking-wide uppercase">
            <Sparkles size={14} /> Diagnostic Complete
          </div>
        </header>

        <div className="glass p-6 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm">Readiness</p>
            <p className="text-white text-2xl font-bold">{diag.classification}</p>
            <p className="text-slate-400 text-sm mt-2">CRS Band: <span className="text-white font-semibold">{diag.crsBand}</span></p>
          </div>
          <p className={`text-6xl font-bold ${scoreColor}`}>{diag.readinessScore}</p>
        </div>

        <div className="glass p-6 rounded-2xl space-y-4">
          <h2 className="text-white font-semibold flex items-center gap-2"><MapPin size={18} className="text-emerald-400" /> Strongest pathways</h2>
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

        {!showPrecision ? (
          <div className="glass p-6 rounded-2xl space-y-4 border border-emerald-500/30 bg-emerald-500/5">
            <div className="flex items-center gap-3">
              <Lock className="text-emerald-400" size={24} />
              <h2 className="text-white font-bold text-lg">Unlock 2026 Precision Report</h2>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Your diagnostic score is ready. To verify 2026 regulatory thresholds (ECA validity, admissibility, JAL/EPA status, proof of funds history) and generate your final Consultant Payload, complete the 60-second Precision Check.
            </p>
            <button onClick={() => setShowPrecision(true)} className="w-full flex items-center justify-center gap-2 bg-bacs-accent hover:bg-bacs-accentHover text-slate-950 font-bold py-4 rounded-xl transition-all">
              <Unlock size={18} /> Start 60-Second Precision Check
            </button>
          </div>
        ) : (
          <div className="glass p-6 rounded-2xl space-y-4 border border-emerald-500/30">
            <h2 className="text-white font-bold text-lg flex items-center gap-2"><ShieldCheck className="text-emerald-400" size={20} /> Regulatory & Precision Validation</h2>
            <p className="text-slate-400 text-xs mb-2">Confirm your 2026 compliance status. This takes 60 seconds.</p>
            
            <div className="space-y-1">
              <Toggle label="Is your ECA less than 5 years old?" value={profile.ecaValid} onChange={(v) => set({ ecaValid: v })} />
              <Toggle label="Was any education completed in Canada?" value={profile.canadianEducation} onChange={(v) => set({ canadianEducation: v })} />
              <Toggle label="Is your occupation regulated in Canada?" value={profile.regulatedOccupation} onChange={(v) => set({ regulatedOccupation: v })} />
              <Toggle label="Are your language test results less than 2 years old?" value={profile.languageTestValid} onChange={(v) => set({ languageTestValid: v })} />
              <Toggle label="Do you have 12 consecutive months in your primary NOC?" value={profile.consecutive12Months} onChange={(v) => set({ consecutive12Months: v })} />
              <Toggle label="Is your occupation in a 2026 Priority Sector?" value={profile.prioritySector} onChange={(v) => set({ prioritySector: v })} />
              <Toggle label="Do you have a relative in your target province?" value={profile.relativeInProvince} onChange={(v) => set({ relativeInProvince: v })} />
              
              <div className="flex justify-between items-center py-3 border-b border-slate-800">
                <span className="text-slate-300 text-sm flex-1 pr-4">Does your job offer have a JAL/EPA?</span>
                <select value={profile.jalEpaApproved} onChange={(e) => set({ jalEpaApproved: e.target.value })} className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white">
                  <option value="na">No Job Offer</option>
                  <option value="yes">Yes, Approved</option>
                  <option value="no">No, Pending</option>
                </select>
              </div>

              <Toggle label="Can you show a 6-month stable funds history?" value={profile.fundsHistory} onChange={(v) => set({ fundsHistory: v })} />
              <Toggle label="Any visa refusals or criminal/medical issues?" value={profile.visaRefusals || profile.criminalMedical} onChange={(v) => set({ visaRefusals: v, criminalMedical: v })} danger />
              <Toggle label="Currently in Canada on a permit expiring <6 months?" value={profile.permitExpirySoon} onChange={(v) => set({ inCanada: v, permitExpirySoon: v })} />
            </div>

            <button onClick={handlePrecisionComplete} className="w-full flex items-center justify-center gap-2 bg-bacs-accent hover:bg-bacs-accentHover text-slate-950 font-bold py-4 rounded-xl transition-all mt-4">
              <CheckCircle2 size={18} /> Generate Final 2026 Payload
            </button>
          </div>
        )}

        {showPrecision && (
          <div className="glass p-6 rounded-2xl space-y-4">
            <h2 className="text-white font-semibold">Your Final Report is Ready</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your 2026 regulatory flags and precision data have been compiled. Forward this file to your consultant or open your personal portal.
            </p>
            <button onClick={handleDownload} className="w-full flex items-center justify-center gap-2 bg-bacs-accent hover:bg-bacs-accentHover text-slate-950 font-bold py-4 rounded-xl transition-all">
              <Download size={18} /> Download 2026 Assessment File
            </button>
            <a href={portalUrl()} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 glass hover:bg-slate-800/60 text-white font-semibold py-4 rounded-xl transition-all">
              <ExternalLink size={18} /> Open Relocation Portal
            </a>
          </div>
        )}
      </div>
    );
  }

  // Form Steps 0-4 (Unchanged from previous version, but using the new profile state)
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
            <div className="space-y-2"><label className={labelClass}>Full name</label><input type="text" value={profile.name} onChange={(e) => set({ name: e.target.value })} className={inputClass} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className={labelClass}>Age</label><input type="number" value={profile.age} onChange={(e) => set({ age: parseInt(e.target.value) || 0 })} className={inputClass} /></div>
              <div className="space-y-2"><label className={labelClass}>Family size</label><input type="number" value={profile.familySize} onChange={(e) => set({ familySize: parseInt(e.target.value) || 1 })} className={inputClass} /></div>
            </div>
            <div className="space-y-2"><label className={labelClass}>Target Province</label>
              <select value={profile.provinceInterest} onChange={(e) => set({ provinceInterest: e.target.value })} className={inputClass}>
                {['No preference', 'Alberta', 'Saskatchewan', 'British Columbia', 'Nova Scotia', 'Prince Edward Island', 'Yukon', 'Ontario', 'Manitoba', 'New Brunswick'].map((pr) => (<option key={pr}>{pr}</option>))}
              </select>
            </div>
          </>
        )}
        {step === 1 && (
          <>
            <div className="space-y-2"><label className={labelClass}>English level</label>
              <select value={profile.languageLevel} onChange={(e) => set({ languageLevel: e.target.value })} className={inputClass}>
                <option value="none">No test yet</option><option value="below7">Below CLB 7</option><option value="clb7_8">CLB 7–8</option><option value="clb9">CLB 9+</option>
              </select>
            </div>
            <div className="space-y-2"><label className={labelClass}>Speak French?</label>
              <select value={profile.french ? 'yes' : 'no'} onChange={(e) => set({ french: e.target.value === 'yes' })} className={inputClass}>
                <option value="no">No</option><option value="yes">Yes</option>
              </select>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <div className="space-y-2"><label className={labelClass}>Education</label>
              <select value={profile.education} onChange={(e) => set({ education: e.target.value })} className={inputClass}>
                {['High School', 'Diploma', 'Bachelors', 'Masters', 'PhD'].map((ed) => (<option key={ed}>{ed}</option>))}
              </select>
            </div>
            <div className="space-y-2"><label className={labelClass}>Where completed?</label>
              <select value={profile.educationCountry} onChange={(e) => set({ educationCountry: e.target.value })} className={inputClass}>
                <option value="outside">Outside Canada</option><option value="inside">Inside Canada</option>
              </select>
            </div>
            <div className="space-y-2"><label className={labelClass}>ECA Status</label>
              <select value={profile.ecaStatus} onChange={(e) => set({ ecaStatus: e.target.value })} className={inputClass}>
                <option value="not_done">Not done</option><option value="done">Done</option>
              </select>
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <div className="space-y-2"><label className={labelClass}>Occupation</label><input type="text" value={profile.occupation} onChange={(e) => set({ occupation: e.target.value })} className={inputClass} /></div>
            <div className="space-y-2"><label className={labelClass}>Role type (TEER)</label>
              <select value={profile.teerBand} onChange={(e) => set({ teerBand: e.target.value })} className={inputClass}>
                <option value="professional">Professional (TEER 0-1)</option><option value="technical">Technical/Trades (TEER 2-3)</option><option value="intermediate">Intermediate (TEER 4-5)</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className={labelClass}>Years Exp</label><input type="number" value={profile.experienceYears} onChange={(e) => set({ experienceYears: parseInt(e.target.value) || 0 })} className={inputClass} /></div>
              <div className="space-y-2"><label className={labelClass}>Canadian Exp?</label>
                <select value={profile.canadianExperience ? 'yes' : 'no'} onChange={(e) => set({ canadianExperience: e.target.value === 'yes' })} className={inputClass}>
                  <option value="no">No</option><option value="yes">Yes</option>
                </select>
              </div>
            </div>
          </>
        )}
        {step === 4 && (
          <>
            <div className="space-y-2"><label className={labelClass}>Liquid Funds (CAD)</label><input type="number" value={profile.fundsCAD} onChange={(e) => set({ fundsCAD: parseInt(e.target.value) || 0 })} className={inputClass} /></div>
            <div className="space-y-2"><label className={labelClass}>Job Offer?</label>
              <select value={profile.jobOffer ? 'yes' : 'no'} onChange={(e) => set({ jobOffer: e.target.value === 'yes' })} className={inputClass}>
                <option value="no">No</option><option value="yes">Yes</option>
              </select>
            </div>
          </>
        )}

        <div className="flex gap-3 pt-2">
          {step > 0 && (<button onClick={() => setStep(step - 1)} className="flex items-center justify-center gap-2 glass hover:bg-slate-800/60 text-slate-300 font-semibold py-3 px-5 rounded-xl"><ArrowLeft size={16} /> Back</button>)}
          <button onClick={handleContinue} className="flex-1 flex items-center justify-center gap-2 bg-bacs-accent hover:bg-bacs-accentHover text-slate-950 font-bold py-3 rounded-xl">
            {step < 4 ? 'Continue' : 'See my results'} <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}