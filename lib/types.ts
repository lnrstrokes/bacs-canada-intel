export interface BACSProfile {
  // Phase 1: Diagnostic
  name: string;
  primaryGoal: string;
  age: number;
  familySize: number;
  provinceInterest: string;
  languageLevel: string;
  french: boolean;
  education: string;
  educationCountry: string;
  ecaStatus: string;
  occupation: string;
  teerBand: string;
  experienceYears: number;
  canadianExperience: boolean;
  fundsCAD: number;
  jobOffer: boolean;
  timeline: string;
  
  // Phase 2: Precision (The 28 Questions)
  ecaValid: boolean;
  canadianEducation: boolean;
  regulatedOccupation: boolean;
  languageTestValid: boolean;
  secondLanguage: boolean;
  consecutive12Months: boolean;
  prioritySector: boolean;
  relativeInProvince: boolean;
  previousProvinceTies: boolean;
  jalEpaApproved: string; 
  maritalStatus: string;
  spouseAccompanying: boolean;
  spousePoints: boolean;
  fundsHistory: boolean;
  visaRefusals: boolean;
  criminalMedical: boolean;
  inCanada: boolean;
  permitExpirySoon: boolean;
}

export interface PathwaySignal {
  name: string;
  fit: number;
  note: string;
}

export interface Obstacle {
  severity: 'high' | 'medium' | 'low';
  title: string;
  fix: string;
}

export interface Diagnostics {
  readinessScore: number;
  classification: 'Ready' | 'Nearly Ready' | 'Needs Preparation' | 'Action Required' | 'Not Currently Eligible';
  crsBand: string;
  pathways: PathwaySignal[];
  obstacles: Obstacle[];
  nextStep: string;
  strategyText: string;
}

export interface BACSPayload {
  bacs_version: string;
  generated_at: string;
  profile: BACSProfile;
  diagnostics?: Diagnostics;
  crs_estimate: string;
  primary_pathway: string;
  strategy_notes: string;
}