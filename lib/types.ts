export interface BACSProfile {
  name: string;
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
  classification: 'Ready' | 'Nearly Ready' | 'Needs Preparation' | 'Not Currently Eligible';
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
