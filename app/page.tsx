'use client';

import { useState } from 'react';
import { Download, ShieldCheck } from 'lucide-react';
import { BACSProfile, BACSPayload } from '@/lib/types';

export default function IntakeEngine() {
  const [profile, setProfile] = useState<BACSProfile>({
    name: '',
    age: 30,
    education: 'Bachelors',
    languageScore: 'CLB 9',
    experienceYears: 3,
    fundsCAD: 25000,
    targetOccupation: 'Software Engineer',
  });

  const handleGenerateJSON = () => {
    if (!profile.name.trim()) {
      alert('Please enter the candidate full name before generating the payload.');
      return;
    }

    const payload: BACSPayload = {
      bacs_version: '1.0',
      generated_at: new Date().toISOString(),
      profile: profile,
      crs_estimate: 'Pending BACS Analysis',
      primary_pathway: 'Pending BACS Analysis',
      strategy_notes: '',
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bacs-profile-${profile.name.trim().replace(/\s+/g, '-').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const inputClass =
    'w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 outline-none';

  return (
    <div className="max-w-2xl w-full mx-auto space-y-8 py-12">
      <header className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium text-emerald-400 tracking-wide uppercase">
          <ShieldCheck size={14} /> BACS Intake Protocol
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white">
          Canada Relocation Intel Hub
        </h1>
        <p className="text-slate-400">
          Generate your encrypted profile payload for consultant analysis.
        </p>
      </header>

      <div className="glass p-6 sm:p-8 rounded-2xl space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-slate-300">Full Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-300">Age</label>
            <input
              type="number"
              value={profile.age}
              onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || 0 })}
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-300">Education Level</label>
            <select
              value={profile.education}
              onChange={(e) => setProfile({ ...profile, education: e.target.value })}
              className={inputClass}
            >
              <option>High School</option>
              <option>Diploma</option>
              <option>Bachelors</option>
              <option>Masters</option>
              <option>PhD</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-300">Language Score</label>
            <input
              type="text"
              placeholder="e.g., IELTS 8777"
              value={profile.languageScore}
              onChange={(e) => setProfile({ ...profile, languageScore: e.target.value })}
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-300">Experience (Years)</label>
            <input
              type="number"
              value={profile.experienceYears}
              onChange={(e) => setProfile({ ...profile, experienceYears: parseInt(e.target.value) || 0 })}
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-300">Liquid Funds (CAD)</label>
            <input
              type="number"
              value={profile.fundsCAD}
              onChange={(e) => setProfile({ ...profile, fundsCAD: parseInt(e.target.value) || 0 })}
              className={inputClass}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-slate-300">Target Occupation</label>
          <input
            type="text"
            value={profile.targetOccupation}
            onChange={(e) => setProfile({ ...profile, targetOccupation: e.target.value })}
            className={inputClass}
          />
        </div>

        <button
          onClick={handleGenerateJSON}
          className="w-full flex items-center justify-center gap-2 bg-bacs-accent hover:bg-bacs-accentHover text-slate-950 font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
        >
          <Download size={20} /> Generate & Download JSON Payload
        </button>
        <p className="text-center text-xs text-slate-500">
          Send this file to your immigration consultant for BACS processing.
        </p>
      </div>
    </div>
  );
}
