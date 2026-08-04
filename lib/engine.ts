import { BACSProfile, Diagnostics, PathwaySignal, Obstacle } from './types';

// A lightweight diagnostics engine to produce a deterministic but simple assessment.
export function runDiagnostics(profile: BACSProfile): Diagnostics {
  // Base score
  let score = 50;

  // Language
  switch (profile.languageLevel) {
    case 'clb9':
      score += 20;
      break;
    case 'clb7_8':
      score += 5;
      break;
    case 'below7':
      score -= 10;
      break;
    default:
      score -= 25; // no test
  }

  if (profile.french) score += 5;

  // Education
  switch (profile.education) {
    case 'PhD':
      score += 12;
      break;
    case 'Masters':
      score += 10;
      break;
    case 'Bachelors':
      score += 5;
      break;
    case 'Diploma':
      score -= 3;
      break;
    case 'High School':
      score -= 8;
      break;
    default:
      break;
  }

  if (profile.educationCountry === 'inside') score += 5;
  if (profile.educationCountry === 'outside' && profile.ecaStatus !== 'done') score -= 7;
  if (profile.ecaStatus === 'done') score += 3;

  // Experience
  if (profile.experienceYears >= 5) score += 6;
  else if (profile.experienceYears >= 3) score += 2;
  else score -= 3;

  if (profile.canadianExperience) score += 8;
  if (profile.jobOffer) score += 10;

  // Funds
  if (profile.fundsCAD >= 20000) score += 5;
  else if (profile.fundsCAD >= 10000) score += 0;
  else score -= 5;

  // Age (rough adjustment)
  if (profile.age >= 18 && profile.age <= 35) score += 5;
  else if (profile.age > 45) score -= 8;

  // Clamp
  score = Math.max(0, Math.min(100, Math.round(score)));

  // Classification
  const classification: Diagnostics['classification'] =
    score >= 75 ? 'Ready' : score >= 40 ? 'Nearly Ready' : score >= 20 ? 'Needs Preparation' : 'Not Currently Eligible';

  // CRS estimate (simple mapping)
  let crsBand = '<380';
  if (score >= 80) crsBand = '480+';
  else if (score >= 65) crsBand = '460-479';
  else if (score >= 50) crsBand = '430-459';
  else if (score >= 35) crsBand = '380-429';

  // Pathway signals
  const pathways: PathwaySignal[] = [];
  const expressFit = Math.min(100, Math.max(0, 40 + (profile.languageLevel === 'clb9' ? 25 : profile.languageLevel === 'clb7_8' ? 10 : profile.languageLevel === 'below7' ? -10 : -30) + (profile.education === 'Bachelors' || profile.education === 'Masters' ? 10 : 0) + (profile.canadianExperience ? 10 : 0)));
  pathways.push({ name: 'Express Entry (CEC/Federal Skilled Worker)', fit: expressFit, note: 'Based on language, education and skilled experience.' });

  const pnpFit = Math.min(100, Math.max(0, 35 + (profile.jobOffer ? 25 : 0) + (profile.provinceInterest !== 'No preference' ? 10 : 0) + (profile.canadianExperience ? 10 : 0)));
  pathways.push({ name: 'Provincial Nominee Programs (PNP)', fit: pnpFit, note: 'PNPs often favour local ties, job offers, or in-demand occupations.' });

  const employerFit = Math.min(100, Math.max(0, 20 + (profile.jobOffer ? 45 : 0) + (profile.teerBand === 'professional' ? 10 : 0)));
  pathways.push({ name: 'Employer-driven pathways', fit: employerFit, note: 'If you have a valid job offer or recognized credentials this pathway strengthens.' });

  // Obstacles
  const obstacles: Obstacle[] = [];
  if (profile.languageLevel === 'none' || profile.languageLevel === 'none') {
    obstacles.push({ severity: 'high', title: 'Language test not completed', fix: 'Take an approved English or French test (IELTS/CELPIP or TEF) and aim for CLB 9+ to maximise CRS points.' });
  }
  if (profile.educationCountry === 'outside' && profile.ecaStatus !== 'done') {
    obstacles.push({ severity: 'medium', title: 'ECA required for foreign education', fix: 'Obtain an Educational Credential Assessment (ECA) so your foreign degree counts for CRS points.' });
  }
  if (profile.experienceYears < 2) {
    obstacles.push({ severity: 'medium', title: 'Limited skilled experience', fix: 'Gain additional skilled experience or take steps to upskill to reach competitive experience thresholds.' });
  }
  if (!profile.jobOffer && !profile.canadianExperience) {
    obstacles.push({ severity: 'low', title: 'No Canadian connections', fix: 'Consider networking, Canadian work experience, or employer outreach to improve provincial/offer chances.' });
  }
  if (profile.fundsCAD < 8000) {
    obstacles.push({ severity: 'low', title: 'Insufficient settlement funds', fix: 'Increase accessible funds or document additional financial resources to meet requirements.' });
  }

  // Keep top 5
  const topObstacles = obstacles.slice(0, 5);

  // Next step recommendation
  const nextStep = topObstacles.length > 0 ? topObstacles[0].fix : 'Your profile looks strong — consider applying when language and documentation are in place.';

  const strategyText = `Brief strategy: focus on ${topObstacles.length > 0 ? topObstacles.map((o) => o.title).join(', ') : 'finalising language and documents'}. Primary recommended pathway: ${pathways[0].name}.`;

  return {
    readinessScore: score,
    classification,
    crsBand,
    pathways,
    obstacles: topObstacles,
    nextStep,
    strategyText,
  };
}
