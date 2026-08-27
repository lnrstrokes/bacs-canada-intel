import { BACSProfile, Diagnostics, Obstacle, PathwaySignal, ScoreComponent } from './types';
import { matchProvinces } from './provinces';

const FUNDS_2026: Record<number, number> = {
  1: 14690, 2: 18288, 3: 22483, 4: 27297, 5: 30690, 6: 34917,
};

export function requiredFunds(familySize: number): number {
  if (familySize <= 1) return FUNDS_2026[1];
  if (familySize <= 6) return FUNDS_2026[familySize];
  return 38911 + (familySize - 7) * 4161;
}

const SEVERITY_RANK: Record<Obstacle['severity'], number> = { high: 0, medium: 1, low: 2 };

function agePoints(age: number): number {
  if (age <= 17) return 0;
  if (age === 18) return 90;
  if (age === 19) return 95;
  if (age >= 20 && age <= 29) return 110;
  const table: Record<number, number> = { 30: 105, 31: 99, 32: 94, 33: 89, 34: 84, 35: 77, 36: 72, 37: 67, 38: 62, 39: 57, 40: 52, 41: 47, 42: 42, 43: 37, 44: 32 };
  if (table[age] !== undefined) return table[age];
  return 0;
}

function educationPoints(level: string): number {
  switch (level) {
    case 'PhD': return 150;
    case 'Masters': return 135;
    case 'Bachelors': return 120;
    case 'Diploma': return 98;
    case 'High School': return 30;
    default: return 0;
  }
}

function languagePointsPerSkill(clb: number): number {
  if (clb <= 4) return 0;
  if (clb === 5) return 6;
  if (clb === 6) return 9;
  if (clb === 7) return 16;
  if (clb === 8) return 22;
  if (clb === 9) return 29;
  return 34;
}

function foreignWorkPoints(years: number): number {
  if (years >= 3) return 100;
  if (years === 2) return 75;
  if (years === 1) return 50;
  return 0;
}

function canadianWorkPoints(years: number): number {
  if (years >= 2) return 80;
  if (years === 1) return 40;
  return 0;
}

export function runDiagnostics(p: BACSProfile): Diagnostics {
  const obstacles: Obstacle[] = [];
  const pathways: PathwaySignal[] = [];
  const breakdown: ScoreComponent[] = [];
  const occ = (p.occupation || '').toLowerCase();

  const hasLanguage = p.hasLanguageTest && p.clb > 0;
  const ecaOk = p.educationCountry === 'inside' || p.ecaStatus === 'done';
  const hasExperience = p.experienceYears >= 1;
  const req = requiredFunds(p.familySize);
  const langLevel = !hasLanguage ? 'none' : p.clb >= 9 ? 'clb9' : p.clb >= 7 ? 'clb7_8' : 'below7';

  // --- Component 1: Age (always countable) ---
  const agePts = agePoints(p.age);
  breakdown.push({ label: `Age factor (${p.age} yrs)`, points: agePts, note: p.age >= 20 && p.age <= 29 ? 'Optimum age band.' : p.age >= 45 ? 'No age points at 45+.' : 'Standard age points.' });

  // --- Component 2: Education (locked without ECA) ---
  const eduPts = ecaOk ? educationPoints(p.education) : 0;
  breakdown.push({ label: `Education (${p.education})`, points: eduPts, note: ecaOk ? 'Verified or Canadian credential.' : 'ECA pending — foreign education counts 0 until assessed.' });

  // --- Component 3: Language (locked without test) ---
  const langPts = hasLanguage ? languagePointsPerSkill(p.clb) * 4 : 0;
  breakdown.push({ label: `Language (CLB ${hasLanguage ? p.clb : 0})`, points: langPts, note: hasLanguage ? 'Based on your exact IELTS bands.' : 'No test on record — 0 pts.' });

  // --- Component 4: Foreign work ---
  const workPts = foreignWorkPoints(p.experienceYears);
  breakdown.push({ label: `Foreign skilled work (${p.experienceYears} yrs)`, points: workPts, note: p.experienceYears >= 1 ? 'Countable skilled experience.' : 'Needs 12+ months continuous skilled experience.' });

  // --- Component 5: Canadian work ---
  const cecPts = p.canadianExperience ? canadianWorkPoints(Math.max(1, p.experienceYears)) : 0;
  breakdown.push({ label: 'Canadian work experience', points: cecPts, note: p.canadianExperience ? 'Adds CRS and unlocks CEC.' : 'None declared.' });

  // --- Component 6: Job offer ---
  const offerPts = p.jobOffer ? 50 : 0;
  breakdown.push({ label: 'Job offer / boosts', points: offerPts, note: p.jobOffer ? 'Arranged employment (TEER 1-3). TEER 0 may be 200.' : 'No offer declared.' });

  const crsEstimate = agePts + eduPts + langPts + workPts + cecPts + offerPts;

  // --- Readiness (behavioral 0-100) ---
  let readiness = 0;
  if (hasLanguage) readiness += p.clb >= 9 ? 25 : p.clb >= 7 ? 20 : 10;
  if (ecaOk) readiness += 20;
  if (hasExperience) readiness += 20;
  if (p.fundsCAD >= req) readiness += 15;
  readiness += p.age >= 20 && p.age <= 34 ? 10 : p.age <= 44 ? 5 : 0;
  if (p.nocCode !== 'Unmapped' && p.nocCode !== '') readiness += 10;

  // --- Obstacles ---
  if (!hasLanguage) obstacles.push({ severity: 'high', title: 'No language test yet', fix: 'Book IELTS or CELPIP now. Every federal and provincial pathway requires it, and your CRS is 0 for language until then.' });
  else if (p.clb < 7) obstacles.push({ severity: 'medium', title: 'Language below competitive threshold', fix: 'Retake IELTS/CELPIP and target CLB 9+. Language is the fastest CRS lever you control.' });

  if (!ecaOk && p.educationCountry === 'outside') obstacles.push({ severity: 'high', title: 'Missing Educational Credential Assessment (ECA)', fix: 'Start an ECA with a designated body (e.g., WES). Foreign education counts for zero points without it.' });
  if (p.ecaStatus === 'done' && p.ecaValid === false) obstacles.push({ severity: 'high', title: 'ECA expired or expiring', fix: 'ECAs must be less than 5 years old at application. You may need to renew it.' });

  if (!hasExperience) obstacles.push({ severity: 'high', title: 'Insufficient skilled work experience', fix: 'Most economic pathways need 12+ months of continuous skilled experience. Consider study-to-PR or employer-driven routes.' });

  if (p.fundsCAD < req && !p.jobOffer) obstacles.push({ severity: 'medium', title: `Settlement funds below 2026 threshold ($${req.toLocaleString()} CAD)`, fix: 'Build liquid savings, or pursue an LMIA-based job offer / CEC route, which are exempt.' });
  if (p.fundsHistory === false && p.fundsCAD >= req) obstacles.push({ severity: 'medium', title: 'Proof of funds history risk', fix: 'IRCC requires a 6-month transaction history. Large recent deposits will be flagged as borrowed.' });

  if (p.nocCode === 'Unmapped' || p.nocCode === '') obstacles.push({ severity: 'medium', title: 'Occupation not mapped to NOC', fix: 'Use the official NOC 2021 tool to confirm your code and verify your daily duties match the lead statement. Title alone is not enough.' });

  if (p.visaRefusals || p.criminalMedical) obstacles.push({ severity: 'high', title: 'Potential admissibility issue', fix: 'Visa refusals or criminal/medical conditions require immediate legal review by an RCIC or lawyer before proceeding.' });
  if (hasLanguage && p.languageTestValid === false) obstacles.push({ severity: 'high', title: 'Language test expired', fix: 'Language tests are only valid for 2 years. You must retake it before submission.' });
  if (p.jobOffer && p.jalEpaApproved === 'no') obstacles.push({ severity: 'medium', title: 'Employer JAL/EPA missing', fix: 'For provincial streams like Saskatchewan, your employer must obtain a Job Approval Letter (JAL) or EPA.' });

  // --- Intent vs Merit ---
  if (p.primaryGoal === 'Express Entry (PR)') {
    const strong = (p.education === 'Bachelors' || p.education === 'Masters' || p.education === 'PhD') && hasLanguage;
    if (!strong) obstacles.push({ severity: 'high', title: 'Strategy mismatch: Express Entry vs. academic merit', fix: 'Your current profile makes direct Express Entry highly competitive. Consider a Study-to-PR route or Provincial Semi-Skilled streams.' });
  }

  // --- Pathways ---
  if (p.canadianExperience) pathways.push({ name: 'Canadian Experience Class (CEC)', fit: 78, note: 'Canadian skilled work unlocks CEC eligibility.' });
  if (p.jobOffer) pathways.push({ name: 'Employer-driven pathway (AIP / PNP with job offer)', fit: 80, note: 'A genuine full-time offer materially changes your options.' });
  if (p.teerLevel === '0' || p.teerLevel === '1') pathways.push({ name: 'Express Entry — Federal Skilled Worker', fit: 60 + (langLevel === 'clb9' ? 20 : langLevel === 'clb7_8' ? 10 : 0), note: 'Degree-level TEER 0-1 roles align with FSW.' });
  else if (p.teerLevel === '2' || p.teerLevel === '3') pathways.push({ name: 'Express Entry / Technical & Trades PNP', fit: 55, note: 'TEER 2-3 roles match technical streams and trades lists.' });
  else if (p.teerLevel === '4' || p.teerLevel === '5') pathways.push({ name: 'Provincial demand streams (PEI / NS / Yukon)', fit: 55, note: 'TEER 4-5 roles appear on in-demand occupation lists.' });

  if (/(software|developer|data|engineer|tech|analyst)/.test(occ)) pathways.push({ name: 'BC PNP Tech / SINP Technology', fit: 70, note: 'Tech prioritized by BC and SK.' });
  if (/(nurse|care|health|medical|psw)/.test(occ)) pathways.push({ name: 'Healthcare demand streams', fit: 74, note: 'Care economy in continuous demand.' });
  if (/(truck|driver|weld|electric|construction|trades|mechanic|cook|chef)/.test(occ)) pathways.push({ name: 'Trades & food demand streams', fit: 70, note: 'Skilled trades and food services on provincial priority lists.' });

  // --- Real province matching (replaces the old placeholder that just
  // echoed back whatever the user typed with a flat 60% fit) ---
  const provinceMatches = matchProvinces(p.nocCode, p.occupation);
  if (p.provinceInterest && p.provinceInterest !== 'No preference') {
    const declared = provinceMatches.find((m) => m.province.toLowerCase() === p.provinceInterest.toLowerCase());
    if (declared) {
      pathways.push({ name: `${declared.province} — ${declared.programName}`, fit: Math.min(95, declared.fit + 8), note: `${declared.note} Boosted for declared intent.` });
    } else {
      pathways.push({ name: `${p.provinceInterest} (unverified fit for your occupation)`, fit: 40, note: 'Your declared province isn\'t among the verified demand matches for your NOC — worth double-checking against the official PNP list before committing.' });
    }
  }
  for (const m of provinceMatches.slice(0, 2)) {
    if (m.province !== 'Not yet verified') pathways.push({ name: `${m.province} — ${m.programName}`, fit: m.fit, note: m.note });
  }

  pathways.sort((a, b) => b.fit - a.fit);
  const topPathways = pathways.slice(0, 3);
  obstacles.sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]);

  // --- Hard gates & classification ---
  let classification: Diagnostics['classification'];
  if (!hasLanguage || !ecaOk || !hasExperience) {
    classification = 'Action Required';
    readiness = Math.min(readiness, 35);
  } else {
    classification = readiness >= 75 ? 'Ready' : readiness >= 60 ? 'Nearly Ready' : readiness >= 40 ? 'Needs Preparation' : 'Not Currently Eligible';
  }

  const crsBand = `≈ ${crsEstimate} pts`;
  const nextStep = obstacles.length > 0 ? obstacles[0].fix : 'Book a strategy review with your consultant.';

  const strategyText = [
    `### STATUS: ${classification} (Readiness ${readiness}/100)`,
    `**Estimated CRS:** ${crsBand} (component-based, indicative)`,
    `**Top Pathways:** ${topPathways.map((t) => t.name).join(' | ') || 'To be determined'}`,
    '',
    `### SCORE BREAKDOWN`,
    ...breakdown.map((b) => `- ${b.label}: ${b.points} pts — ${b.note}`),
    '',
    `### ACTION PLAN`,
    ...obstacles.slice(0, 4).map((o, i) => `${i + 1}. **${o.title}** — ${o.fix}`),
    ...(obstacles.length === 0 ? ['1. No critical gaps detected. Maintain document validity and monitor program draws.'] : []),
    '',
    `### NEXT STEP`,
    nextStep,
  ].join('\n');

  return {
    readinessScore: Math.max(5, Math.min(95, readiness)),
    classification,
    crsEstimate,
    crsBand,
    pathways: topPathways,
    provinceMatches,
    obstacles,
    breakdown,
    nextStep,
    strategyText,
  };
}