'use client';

import { useState } from 'react';
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Download, MapPin, ShieldCheck, Sparkles, Lock, Unlock, FileJson } from 'lucide-react';
import { BACSProfile, BACSPayload, Diagnostics, IELTSScores } from '@/lib/types';
import { runDiagnostics } from '@/lib/engine';
import { overallClb } from '@/lib/clb';
import { inferNoc } from '@/lib/noc';

const STEP_TITLES = ['Core human capital', 'Language proficiency', 'Education & ECA', 'Work history & NOC', 'Funds & timeline'];

const STEP_EXPLAINERS = [
  'We use your age, family size and goal to calculate human-capital points and the settlement funds you will need. Age points peak between 20 and 29.',
  'Language is the biggest CRS multiplier. Enter your exact IELTS bands for all four skills so we can compute your real CLB level. If you have not taken a test, tick the box and we will flag it as your first action item instead of guessing.',
  'Foreign education only counts after an Educational Credential Assessment (ECA). We check this so your score is honest, not inflated.',
  'Type your job title and we auto-suggest the closest NOC 2021 code and TEER level. Always verify your daily duties on the official NOC tool — IRCC matches duties, not job titles.',
  'Settlement funds are a hard eligibility threshold for FSW/FST. We compare your savings against the 2026 IRCC table for your family size.',
];

const DEFAULT_PROFILE: BACSProfile = {
  name: '', primaryGoal: 'Express Entry (PR)', age: 30, familySize: 1, provinceInterest: 'No preference',
  hasLanguageTest: false, ielts: { reading: 0, writing: 0, listening: 0, speaking: 0 }, clb: 0, french: false,
  education: 'Bachelors', educationCountry: 'outside', ecaStatus: 'not_done',
  occupation: '', nocCode: 'Unmapped', teerLevel: 'unmapped', experienceYears: 0, continuousMonths: 0,
  canadianExperience: false, fundsCAD: 25000, jobOffer: false, timeline: '6-12m',
  ecaValid: true, canadianEducation: false, regulatedOccupation: false, languageTestValid: true,
  secondLanguage: false, consecutive12Months: true, prioritySector: false, relativeInProvince: false,
  previousProvinceTies: false, jalEpaApproved: 'na', maritalStatus: 'Single', spouseAccompanying: false,
  spousePoints: false, fundsHistory: true, visaRefusals: false, criminalMedical: false, inCanada: false, permitExpirySoon: false,
};

const inputClass = 'w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none';
const labelClass = 'text-sm text-slate-300';

const Toggle = ({ label, value, onChange, danger }: { label: string; value: boolean; onChange: (v: boolean) => void; danger?: boolean }) => (
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

  const updateIelts = (key: keyof IELTSScores, value: number) => {
    const ielts = { ...profile.ielts, [key]: value };
    set({ ielts, clb: overallClb(ielts) });
  };

  const updateOccupation = (value: string) => {
    const m = inferNoc(value);
    if (m) set({ occupation: value, nocCode: m.noc, teerLevel: m.teer });
    else set({ occupation: value, nocCode: 'Unmapped', teerLevel: 'unmapped' });
  };

  const handleContinue = () => {
    if (step === 0 && !profile.name.trim()) { alert('Please enter your name.'); return; }
    if (step < 4) { setStep(step + 1); return; }
    setDiag(runDiagnostics(profile));
    setStage('results');
  };

  const buildPayload = (): BACSPayload => {
    const d = diag as Diagnostics;
    return {
      bacs_version: '3.0', generated_at: new Date().toISOString(), profile, diagnostics: d,
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

  if (stage === 'landing') {
    return (
      <div className="max-w-2xl w-full mx-auto space-y-8 py-12">
        <header className="text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium text-emerald-400 tracking-wide uppercase">
            <ShieldCheck size={14} /> 2026 BACS Protocol
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-white leading-tight">Find out your Canada PR readiness in 4 minutes</h1>
          <p className="text-slate-400 leading-relaxed">
            Answer a few questions. Get an honest readiness score, a component-based CRS estimate, and your strongest pathways. Every stage is explained, and you see exactly why your score is what it is.
          </p>
        </header>
        <button onClick={() => setStage('form')} className="w-full flex items-center justify-center gap-2 bg-bacs-accent hover:bg-bacs-accentHover text-slate-950 font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20 text-lg">
          Start assessment <ArrowRight size={20} />
        </button>
      </div>
    );
  }

  if (stage === 'results' && diag) {
    const isActionRequired = diag.classification === 'Action Required';
    const scoreColor = isActionRequired ? 'text-amber-400' : diag.readinessScore >= 75 ? 'text-emerald-400' : diag.readinessScore >= 40 ? 'text-amber-400' : 'text-rose-400';
    return (
      <div className="max-w-2xl w-full mx-auto space-y-6 py-12">
        <header className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium text-emerald-400 tracking-wide uppercase">
            <Sparkles size={14} /> Diagnostic Complete
          </div>
        </header>

        <div className={`glass p-6 rounded-2xl flex items-center justify-between ${isActionRequired ? 'border-amber-500/30 bg-amber-500/5' : ''}`}>
          <div>
            <p className="text-slate-400 text-sm">Status</p>
            <p className={`text-2xl font-bold ${isActionRequired ? 'text-amber-400' : 'text-white'}`}>{diag.classification}</p>
            <p className="text-slate-400 text-sm mt-2">CRS Estimate: <span className="text-white font-semibold">{diag.crsBand}</span></p>
          </div>
          <p className={`text-6xl font-bold ${scoreColor}`}>{diag.readinessScore}</p>
        </div>

        {isActionRequired && (
          <div className="glass p-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-2">
            <h2 className="text-amber-400 font-bold flex items-center gap-2"><AlertTriangle size={20} /> Unlock your eligibility</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Your profile is missing mandatory items (language test, ECA, or 12 months of skilled experience). Your CRS estimate above only counts evidence you already have — complete the action plan to activate your full score.
            </p>
          </div>
        )}

        <div className="glass p-6 rounded-2xl space-y-3">
          <h2 className="text-white font-semibold">Why this score</h2>
          {diag.breakdown.map((b) => (
            <div key={b.label} className="flex justify-between items-start gap-4 border-b border-slate-800 pb-3 last:border-0">
              <div>
                <p className="text-white text-sm">{b.label}</p>
                <p className="text-slate-500 text-xs mt-0.5">{b.note}</p>
              </div>
              <p className="text-emerald-400 font-mono text-sm flex-shrink-0">{b.points} pts</p>
            </div>
          ))}
          <div className="flex justify-between items-center pt-2">
            <p className="text-white font-bold">Estimated CRS total</p>
            <p className="text-emerald-400 font-bold">≈ {diag.crsEstimate} pts</p>
          </div>
          <p className="text-slate-500 text-xs">Indicative component estimate. Official CRS is calculated by IRCC at profile submission.</p>
        </div>

        <div className="glass p-6 rounded-2xl space-y-4">
          <h2 className="text-white font-semibold flex items-center gap-2"><MapPin size={18} className="text-emerald-400" /> Strongest pathways</h2>
          {diag.pathways.length === 0 && <p className="text-slate-400 text-sm">Pathway signals will appear once your occupation and credentials are mapped.</p>}
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
              Verify 2026 regulatory thresholds (ECA validity, admissibility, JAL/EPA status, proof of funds history) and generate your final Consultant Payload in 60 seconds.
            </p>
            <button onClick={() => setShowPrecision(true)} className="w-full flex items-center justify-center gap-2 bg-bacs-accent hover:bg-bacs-accentHover text-slate-950 font-bold py-4 rounded-xl transition-all">
              <Unlock size={18} /> Start 60-Second Precision Check
            </button>
          </div>
        ) : (
          <div className="glass p-6 rounded-2xl space-y-4 border border-emerald-500/30">
            <h2 className="text-white font-bold text-lg flex items-center gap-2"><ShieldCheck className="text-emerald-400" size={20} /> Regulatory & Precision Validation</h2>
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
                  <option value="na">No Job Offer</option><option value="yes">Yes, Approved</option><option value="no">No, Pending</option>
                </select>
              </div>
              <Toggle label="Can you show a 6-month stable funds history?" value={profile.fundsHistory} onChange={(v) => set({ fundsHistory: v })} />
              <Toggle label="Any visa refusals or criminal/medical issues?" value={profile.visaRefusals || profile.criminalMedical} onChange={(v) => set({ visaRefusals: v, criminalMedical: v })} danger />
              <Toggle label="Currently in Canada on a permit expiring in under 6 months?" value={profile.permitExpirySoon} onChange={(v) => set({ inCanada: v, permitExpirySoon: v })} />
            </div>
            <button onClick={() => setDiag(runDiagnostics(profile))} className="w-full flex items-center justify-center gap-2 bg-bacs-accent hover:bg-bacs-accentHover text-slate-950 font-bold py-4 rounded-xl transition-all mt-4">
              <CheckCircle2 size={18} /> Generate Final 2026 Payload
            </button>
          </div>
        )}

        {showPrecision && (
          <div className="glass p-6 rounded-2xl space-y-4">
            <h2 className="text-white font-semibold flex items-center gap-2"><FileJson size={20} className="text-emerald-400" /> Your final report is ready</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Download this file and send it to your immigration consultant. They will use it to build your personalized relocation roadmap.
            </p>
            <button onClick={handleDownload} className="w-full flex items-center justify-center gap-2 bg-bacs-accent hover:bg-bacs-accentHover text-slate-950 font-bold py-4 rounded-xl transition-all">
              <Download size={18} /> Download 2026 Assessment File
            </button>
          </div>
        )}
      </div>
    );
  }

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
        <p className="text-xs text-slate-500 leading-relaxed">{STEP_EXPLAINERS[step]}</p>
      </div>

      <div className="glass p-6 sm:p-8 rounded-2xl space-y-5">
        {step === 0 && (
          <>
            <div className="space-y-2"><label className={labelClass}>Full name</label><input type="text" value={profile.name} onChange={(e) => set({ name: e.target.value })} className={inputClass} /></div>
            <div className="space-y-2"><label className={labelClass}>Primary goal (intent)</label>
              <select value={profile.primaryGoal} onChange={(e) => set({ primaryGoal: e.target.value })} className={inputClass}>
                <option value="Express Entry (PR)">Express Entry / Skilled Worker (PR)</option>
                <option value="Study in Canada">Study in Canada (Student Visa)</option>
                <option value="Work Permit">Work Permit / Job Offer</option>
                <option value="Not Sure">Not Sure / Explore Options</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className={labelClass}>Age</label><input type="number" value={profile.age} onChange={(e) => set({ age: parseInt(e.target.value) || 0 })} className={inputClass} /></div>
              <div className="space-y-2"><label className={labelClass}>Family size</label><input type="number" value={profile.familySize} onChange={(e) => set({ familySize: parseInt(e.target.value) || 1 })} className={inputClass} /></div>
            </div>
            <div className="space-y-2"><label className={labelClass}>Target province</label>
              <select value={profile.provinceInterest} onChange={(e) => set({ provinceInterest: e.target.value })} className={inputClass}>
                {['No preference', 'Alberta', 'Saskatchewan', 'British Columbia', 'Nova Scotia', 'Prince Edward Island', 'Yukon', 'Ontario', 'Manitoba', 'New Brunswick'].map((pr) => (<option key={pr}>{pr}</option>))}
              </select>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <label className="flex items-center gap-3 text-sm text-slate-300">
              <input type="checkbox" checked={!profile.hasLanguageTest} onChange={(e) => set({ hasLanguageTest: !e.target.checked, clb: e.target.checked ? 0 : overallClb(profile.ielts) })} className="w-4 h-4 rounded bg-slate-800 border-slate-700" />
              I do not have IELTS/CELPIP yet
            </label>
            {profile.hasLanguageTest && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><label className={labelClass}>IELTS Reading</label><input type="number" step="0.5" min="0" max="9" value={profile.ielts.reading} onChange={(e) => updateIelts('reading', parseFloat(e.target.value) || 0)} className={inputClass} /></div>
                  <div className="space-y-2"><label className={labelClass}>IELTS Writing</label><input type="number" step="0.5" min="0" max="9" value={profile.ielts.writing} onChange={(e) => updateIelts('writing', parseFloat(e.target.value) || 0)} className={inputClass} /></div>
                  <div className="space-y-2"><label className={labelClass}>IELTS Listening</label><input type="number" step="0.5" min="0" max="9" value={profile.ielts.listening} onChange={(e) => updateIelts('listening', parseFloat(e.target.value) || 0)} className={inputClass} /></div>
                  <div className="space-y-2"><label className={labelClass}>IELTS Speaking</label><input type="number" step="0.5" min="0" max="9" value={profile.ielts.speaking} onChange={(e) => updateIelts('speaking', parseFloat(e.target.value) || 0)} className={inputClass} /></div>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                  <p className="text-emerald-400 text-sm font-semibold">Calculated language level: CLB {profile.clb}</p>
                  <p className="text-slate-400 text-xs mt-1">Based on your lowest band, per IRCC equivalency tables.</p>
                </div>
              </>
            )}
            <div className="space-y-2"><label className={labelClass}>Do you also speak French?</label>
              <select value={profile.french ? 'yes' : 'no'} onChange={(e) => set({ french: e.target.value === 'yes' })} className={inputClass}>
                <option value="no">No</option><option value="yes">Yes</option>
              </select>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="space-y-2"><label className={labelClass}>Highest education level</label>
              <select value={profile.education} onChange={(e) => set({ education: e.target.value })} className={inputClass}>
                {['High School', 'Diploma', 'Bachelors', 'Masters', 'PhD'].map((ed) => (<option key={ed}>{ed}</option>))}
              </select>
            </div>
            <div className="space-y-2"><label className={labelClass}>Where was it completed?</label>
              <select value={profile.educationCountry} onChange={(e) => set({ educationCountry: e.target.value })} className={inputClass}>
                <option value="outside">Outside Canada</option><option value="inside">Inside Canada</option>
              </select>
            </div>
            <div className="space-y-2"><label className={labelClass}>ECA status</label>
              <select value={profile.ecaStatus} onChange={(e) => set({ ecaStatus: e.target.value })} className={inputClass}>
                <option value="not_done">Not done yet</option><option value="done">Done</option>
              </select>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="space-y-2"><label className={labelClass}>Skilled work experience (occupation / job title)</label>
              <input type="text" placeholder="Start typing (e.g. Software developer, Cook, Truck driver)" value={profile.occupation} onChange={(e) => updateOccupation(e.target.value)} className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={labelClass}>NOC code</label>
                <a href="https://noc.esdc.gc.ca/" target="_blank" rel="noopener noreferrer" className="block text-amber-400 text-xs mb-1">Find my NOC ↗</a>
                <input type="text" value={profile.nocCode} onChange={(e) => set({ nocCode: e.target.value })} className={inputClass} />
              </div>
              <div className="space-y-2"><label className={labelClass}>TEER level</label>
                <select value={profile.teerLevel} onChange={(e) => set({ teerLevel: e.target.value })} className={inputClass}>
                  <option value="unmapped">Infer from occupation</option>
                  {['0', '1', '2', '3', '4', '5'].map((t) => (<option key={t} value={t}>TEER {t}</option>))}
                </select>
              </div>
            </div>
            {profile.nocCode !== 'Unmapped' && profile.occupation && (
              <p className="text-emerald-400 text-xs">Auto-mapped from your job title. Verify your daily duties match this NOC on the official tool.</p>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className={labelClass}>Continuous experience, last 3 yrs (months)</label><input type="number" value={profile.continuousMonths} onChange={(e) => set({ continuousMonths: parseInt(e.target.value) || 0 })} className={inputClass} /></div>
              <div className="space-y-2"><label className={labelClass}>Total related experience (years)</label><input type="number" value={profile.experienceYears} onChange={(e) => set({ experienceYears: parseInt(e.target.value) || 0 })} className={inputClass} /></div>
            </div>
            <div className="space-y-2"><label className={labelClass}>Skilled work experience inside Canada?</label>
              <select value={profile.canadianExperience ? 'yes' : 'no'} onChange={(e) => set({ canadianExperience: e.target.value === 'yes' })} className={inputClass}>
                <option value="no">No</option><option value="yes">Yes</option>
              </select>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <div className="space-y-2"><label className={labelClass}>Liquid funds (CAD)</label><input type="number" value={profile.fundsCAD} onChange={(e) => set({ fundsCAD: parseInt(e.target.value) || 0 })} className={inputClass} /></div>
            <div className="space-y-2"><label className={labelClass}>Canadian job offer?</label>
              <select value={profile.jobOffer ? 'yes' : 'no'} onChange={(e) => set({ jobOffer: e.target.value === 'yes' })} className={inputClass}>
                <option value="no">No job offer</option><option value="yes">Yes</option>
              </select>
            </div>
            <div className="space-y-2"><label className={labelClass}>Timeline</label>
              <select value={profile.timeline} onChange={(e) => set({ timeline: e.target.value })} className={inputClass}>
                <option value="<6m">Under 6 months</option><option value="6-12m">6-12 months</option><option value="1-2y">1-2 years</option><option value="exploring">Just exploring</option>
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