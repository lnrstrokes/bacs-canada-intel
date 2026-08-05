'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AlertTriangle, ChevronDown, FileText, MapPin, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { BACSPayload } from '@/lib/types';

export default function PortalClient() {
  const searchParams = useSearchParams();
  const [payload, setPayload] = useState<BACSPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const data = searchParams.get('data');
    if (!data) { setError('No encrypted profile data found in this link.'); return; }
    try {
      const decoded = decodeURIComponent(atob(data));
      setPayload(JSON.parse(decoded) as BACSPayload);
    } catch {
      setError('Security alert: invalid or corrupted profile token.');
    }
  }, [searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="glass p-8 rounded-2xl text-rose-400 max-w-md text-center">
          <AlertTriangle className="mx-auto mb-4" size={32} />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!payload) return null;

  const p = payload.profile;
  const d = payload.diagnostics;

  return (
    <div className="max-w-3xl w-full mx-auto space-y-6 py-12 px-4">
      <header className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium text-emerald-400 tracking-wide uppercase">
          <Sparkles size={14} /> BACS Intelligence Portal
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white">Welcome, {p?.name || 'Candidate'}</h1>
        <p className="text-slate-400 max-w-xl mx-auto">Your personalized human capital feasibility analysis and 2026 pathway strategy.</p>
      </header>

      {d && (
        <div className="glass p-6 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm">Status</p>
            <p className="text-white text-2xl font-bold">{d.classification}</p>
            <p className="text-slate-400 text-sm mt-2">CRS Estimate: <span className="text-white font-semibold">{d.crsBand}</span></p>
          </div>
          <p className={`text-6xl font-bold ${d.readinessScore >= 75 ? 'text-emerald-400' : d.readinessScore >= 40 ? 'text-amber-400' : 'text-rose-400'}`}>{d.readinessScore}</p>
        </div>
      )}

      {d && d.breakdown && d.breakdown.length > 0 && (
        <div className="glass p-6 rounded-2xl space-y-3">
          <h2 className="text-lg font-semibold text-white">Why this score</h2>
          {d.breakdown.map((b) => (
            <div key={b.label} className="flex justify-between items-start gap-4 border-b border-slate-800 pb-3 last:border-0">
              <div>
