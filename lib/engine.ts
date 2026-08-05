import { BACSProfile, Diagnostics, PathwaySignal, Obstacle } from './types';

export function runDiagnostics(p: BACSProfile): Diagnostics {
  // Minimal, deterministic diagnostic used to satisfy imports and allow the app to build.
  let score = 50;

  // Age factor
  if (typeof p.age === 'number' && p.age < 40) score += 10;

  // Language factor (simple mapping)
  if (p.languageLevel === 'clb9') score += 15;
  else if (p.languageLevel === 'clb7_8') score += 8;

  // Funds
  if (typeof p.fundsCAD === 'number' && p.fundsCAD >= 25000) score += 10;

  // Job offer and Canadian experience
  if (p.jobOffer) score += 20;
  if (p.canadianExperience) score += 5;

  score = Math.max(0, Math.min(100, Math.round(score)));

  let classification: Diagnostics['classification'];
  if (score >= 75) classification = 'Ready';
  else if (score >= 60) classification = 'Nearly Ready';
  else if (score >= 40) classification = 'Needs Preparation';
  else classification = 'Action Required';

  const crsBand = score >= 75 ? '480+' : score >= 60 ? '420-479' : score >= 40 ? '360-419' : 'TBD';

  const pathways: PathwaySignal[] = [
    { name: 'Express Entry', fit: Math.min(100, Math.round(score * 0.8)), note: 'Automated pathway estimate' },
  ];

  const obstacles: Obstacle[] = [];
  const nextStep = 'Run Precision Check';
  const strategyText = 'Automated strategy summary';

  return {
    readinessScore: score,
    classification,
    crsBand,
    pathways,
    obstacles,
    nextStep,
    strategyText,
  };
}
