export interface NocMapping {
  noc: string;
  teer: string;
  title: string;
  keywords: string[];
}

export const NOC_MAPPINGS: NocMapping[] = [
  { noc: '21232', teer: '1', title: 'Software developers and programmers', keywords: ['software', 'developer', 'programmer', 'frontend', 'backend', 'web developer', 'full stack'] },
  { noc: '21211', teer: '1', title: 'Data scientists', keywords: ['data scientist', 'machine learning', 'ai engineer'] },
  { noc: '21221', teer: '1', title: 'Business systems specialists', keywords: ['business analyst', 'systems analyst', 'it analyst'] },
  { noc: '21300', teer: '1', title: 'Civil engineers', keywords: ['civil engineer'] },
  { noc: '21301', teer: '1', title: 'Mechanical engineers', keywords: ['mechanical engineer'] },
  { noc: '21310', teer: '1', title: 'Electrical and electronics engineers', keywords: ['electrical engineer', 'electronics engineer'] },
  { noc: '31301', teer: '1', title: 'Registered nurses', keywords: ['registered nurse', 'nurse', 'rn'] },
  { noc: '31102', teer: '1', title: 'General practitioners and family physicians', keywords: ['doctor', 'physician', 'medical practitioner'] },
  { noc: '31120', teer: '1', title: 'Pharmacists', keywords: ['pharmacist'] },
  { noc: '33102', teer: '3', title: 'Nurse aides, orderlies and patient service associates', keywords: ['caregiver', 'personal support worker', 'psw', 'nurse aide', 'care aide', 'orderly'] },
  { noc: '42202', teer: '2', title: 'Early childhood educators and assistants', keywords: ['early childhood', 'ece', 'preschool teacher'] },
  { noc: '44101', teer: '4', title: 'Home child care providers', keywords: ['home child care', 'nanny', 'babysitter'] },
  { noc: '41220', teer: '1', title: 'Secondary school teachers', keywords: ['teacher', 'secondary school', 'high school teacher'] },
  { noc: '11100', teer: '1', title: 'Financial auditors and accountants', keywords: ['accountant', 'auditor', 'cpa'] },
  { noc: '11202', teer: '1', title: 'Professional occupations in advertising, marketing and public relations', keywords: ['marketing', 'advertising', 'public relations'] },
  { noc: '13110', teer: '3', title: 'Administrative assistants', keywords: ['administrative assistant', 'admin assistant', 'office assistant', 'secretary'] },
  { noc: '52111', teer: '2', title: 'Graphic designers and illustrators', keywords: ['graphic designer', 'illustrator'] },
  { noc: '62200', teer: '2', title: 'Chefs', keywords: ['chef'] },
  { noc: '63200', teer: '3', title: 'Cooks', keywords: ['cook'] },
  { noc: '73300', teer: '3', title: 'Transport truck drivers', keywords: ['truck driver', 'driver'] },
  { noc: '72106', teer: '2', title: 'Welders and related machine operators', keywords: ['welder'] },
  { noc: '72200', teer: '2', title: 'Electricians', keywords: ['electrician'] },
  { noc: '72310', teer: '2', title: 'Carpenters', keywords: ['carpenter'] },
  { noc: '72300', teer: '2', title: 'Plumbers', keywords: ['plumber'] },
  { noc: '65310', teer: '5', title: 'Light duty cleaners', keywords: ['cleaner', 'janitor', 'housekeeper'] },
  { noc: '85101', teer: '5', title: 'General farm workers', keywords: ['farm worker', 'agricultural worker', 'farm labourer'] },
];

export function inferNoc(occupation: string): NocMapping | null {
  const q = occupation.toLowerCase().trim();
  if (!q) return null;
  for (const m of NOC_MAPPINGS) {
    if (m.keywords.some((k) => q.includes(k))) return m;
  }
  return null;
}