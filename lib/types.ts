export interface BACSProfile {
  name: string;
  age: number;
  education: string;
  languageScore: string;
  experienceYears: number;
  fundsCAD: number;
  targetOccupation: string;
}

export interface BACSPayload {
  bacs_version: string;
  generated_at: string;
  profile: BACSProfile;
  crs_estimate: string;
  primary_pathway: string;
  strategy_notes: string; // The NotebookLM output goes here
}
