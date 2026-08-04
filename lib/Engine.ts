import { BACSProfile, Diagnostics, Obstacle, PathwaySignal } from './types';

const FUNDS_2026: Record<number, number> = {
  1: 14690,
  2: 18288,
  3: 22483,
  4: 27297,
  5: 30690,
  6: 34917,
};

export function requiredFunds(familySize: number): number {
  if (familySize <= 1) return FUNDS_2026[1];
  if (familySize <= 6) return FUNDS_2026[familySize];
  return 38911 + (familySize - 7) * 4161;
}

const SEVERITY_RANK: Record<Obstacle['severity'], number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export function runDiagnostics(p: BACSProfile): Diagnostics {
  let score = 50;
  const obstacles: Obstacle[] = [];
  const pathways: PathwaySignal[] = [];
  const occ = (p.occupation || '').toLowerCase();

  // --- Age (CRS human capital) ---
  if (p.age >= 20 && p.age <= 29) score += 10;
  else if (p.age >= 30 && p.age <= 34) score += 5;
  else if (p.age >= 45) {
    score -= 12;
    obstacles.push({
      severity: 'medium',
      title: 'Age-related CRS decline',
      fix: 'Compensate with CLB 9+ language scores, French ability, or a provincial nomination.',
    });
  }

  // --- Language ---
  if (p.languageLevel === 'clb9') score += 15;
  else if (p.languageLevel === 'clb7_8') score += 8;
  else if (p.languageLevel === 'below7') {
    score -= 8;
    obstacles.push({
      severity: 'medium',
      title: 'Language below competitive threshold',
      fix: 'Retake IELTS/CELPIP and target CLB 9+. Language is the fastest CRS lever you control.',
    });
  } else {
    score -= 15;
    obstacles.push({
      severity: 'high',
      title: 'No language test yet',
      fix: 'Book IELTS or CELPIP now. Every federal and provincial pathway requires it.',
    });
  }
  if (p.french) score += 6;

  // --- Education + ECA ---
  if (p.education === 'Masters' || p.education === 'PhD') score += 10;
  else if (p.education === 'Bachelors') score += 6;
  else if (p.education === 'Diploma') score += 3;

  if (p.educationCountry === 'outside' && p.ecaStatus !== 'done') {
    score -= 10;
    obstacles.push({
      severity: 'high',
      title: 'Missing Educational Credential Assessment (ECA)',
      fix: 'Start an ECA with a designated body (e.g., WES). Foreign education counts for zero points without it.',
    });
  } else if (p.ecaStatus === 'done') {
    score += 4;
  }

  // --- Work experience ---
  if (p.experienceYears >= 3) score += 10;
  else if (p.experienceYears >= 1) score += 5;
  else {
    score -= 12;
    obstacles.push({
      severity: 'high',
      title: 'Insufficient skilled work experience',
      fix: 'Most economic pathways need 12+ months of continuous skilled experience. Consider study-to-PR or employer-driven routes in the meantime.',
    });
  }
  if (p.canadianExperience) {
    score += 8;
    pathways.push({
      name: 'Canadian Experience Class (CEC)',
      fit: 78,
      note: 'Canadian skilled work unlocks CEC eligibility and adds CRS points.',
    });
  }

  // --- Settlement funds (2026 IRCC thresholds) ---
  const req = requiredFunds(p.familySize);
  if (p.fundsCAD >= req) {
    score += 6;
  } else if (!p.jobOffer) {
    score -= 8;
    obstacles.push({
      severity: 'medium',
      title: `Settlement funds below 2026 threshold ($${req.toLocaleString()} CAD for a family of ${p.familySize})`,
      fix: 'Build liquid savings to the required level, or pursue an LMIA-based job offer / CEC route, which are exempt.',
    });
  }

  // --- Job offer ---
  if (p.jobOffer) {
    score += 8;
    pathways.push({
      name: 'Employer-driven pathway (AIP / PNP with job offer)',
      fit: 80,
      note: 'A genuine full-time offer materially changes your options and may exempt settlement funds.',
    });
  }

  // --- TEER band → federal/provincial signal ---
  if (p.teerBand === 'professional') {
    pathways.push({
      name: 'Express Entry — Federal Skilled Worker',
      fit: 72 + (p.languageLevel === 'clb9' ? 10 : 0),
      note: 'Degree-level TEER 0–1 roles align with FSW human capital factors.',
    });
  } else if (p.teerBand === 'technical') {
    pathways.push({
      name: 'Express Entry / Technical & Trades PNP streams',
      fit: 64,
      note: 'TEER 2–3 roles match technical streams and several PNP priority lists.',
    });
  } else {
    pathways.push({
      name: 'Provincial demand streams (PEI / Nova Scotia / Yukon)',
      fit: 62,
      note: 'TEER 4–5 roles appear on in-demand occupation lists for PEI, Nova Scotia and Yukon.',
    });
  }

  // --- Occupation keyword → provincial demand signals ---
  if (/(software|developer|data|engineer|tech|analyst)/.test(occ)) {
    pathways.push({
      name: 'BC PNP Tech / SINP Technology',
      fit: 70,
      note: 'Tech occupations are prioritized by British Columbia and Saskatchewan.',
    });
  }
  if (/(nurse|care|health|medical)/.test(occ)) {
    pathways.push({
      name: 'Healthcare demand streams (NS / PEI / BC care economy)',
      fit: 74,
      note: 'Care-economy occupations are in continuous provincial demand.',
    });
  }
  if (/(truck|driver|weld|electric|construction|trades|mechanic)/.test(occ)) {
    pathways.push({
      name: 'Trades demand streams (SINP / NS / Yukon)',
      fit: 70,
      note: 'Skilled trades appear on multiple provincial priority lists.',
    });
  }

  if (p.provinceInterest && p.provinceInterest !== 'No preference') {
    pathways.push({
      name: `${p.provinceInterest} Provincial Nominee alignment`,
      fit: 60,
      note: 'Declared intent strengthens PNP positioning once your occupation is verified.',
    });
  }

  pathways.sort((a, b) => b.fit - a.fit);
  const topPathways = pathways.slice(0, 3);

  obstacles.sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]);

  const readinessScore = Math.max(5, Math.min(95, score));
  const classification: Diagnostics['classification'] =
    readinessScore >= 75
      ? 'Ready'
      : readinessScore >= 60
        ? 'Nearly Ready'
        : readinessScore >= 40
          ? 'Needs Preparation'
          : 'Not Currently Eligible';

  // --- Indicative CRS band (estimate, not official) ---
  let crs = 300;
  crs += p.age >= 20 && p.age <= 29 ? 100 : p.age <= 34 ? 85 : p.age <= 39 ? 60 : 40;
  crs +=
    p.education === 'PhD'
      ? 140
      : p.education === 'Masters'
        ? 125
        : p.education === 'Bachelors'
          ? 110
          : p.education === 'Diploma'
            ? 90
            : 40;
  crs +=
    p.languageLevel === 'clb9'
      ? 120
      : p.languageLevel === 'clb7_8'
        ? 90
        : p.languageLevel === 'below7'
          ? 50
          : 10;
  crs += p.experienceYears >= 3 ? 70 : p.experienceYears >= 1 ? 45 : 10;
  if (p.canadianExperience) crs += 40;
  if (p.french) crs += 25;
  if (p.jobOffer) crs += 50;
  const crsBand = `${Math.round((crs - 15) / 10) * 10}–${Math.round((crs + 15) / 10) * 10}`;

  const nextStep =
    obstacles.length > 0
      ? obstacles[0].fix
      : 'Book a strategy review with your consultant to lock your pathway and timeline.';

  const strategyText = [
    `READINESS: ${classification} (${readinessScore}/100)`,
    `CRS BAND (indicative): ${crsBand}`,
    `TOP PATHWAYS: ${topPathways.map((t) => t.name).join(' | ') || 'To be determined'}`,
    '',
    'PRIORITY ACTIONS:',
    ...obstacles.slice(0, 3).map((o, i) => `${i + 1}. ${o.title} — ${o.fix}`),
    ...(obstacles.length === 0
      ? ['1. No critical gaps detected. Maintain document validity and monitor program draws.']
      : []),
    '',
    `NEXT STEP: ${nextStep}`,
  ].join('\n');

  return {
    readinessScore,
    classification,
    crsBand,
    pathways: topPathways,
    obstacles,
    nextStep,
    strategyText,
  };
      }
