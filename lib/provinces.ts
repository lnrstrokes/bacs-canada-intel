// ─────────────────────────────────────────────────────────────
//  PROVINCE / PNP DEMAND MATCHING
//
//  Replaces the placeholder single-line province logic in engine.ts
//  (previously: only echoed back whatever province the user typed,
//  with a flat 60% fit — no real matching existed).
//
//  Data source: Job Bank's federal Outlook ratings (3-star scale,
//  published per NOC per province on canada.ca) plus each PNP's
//  published priority-occupation list, as researched Aug 2026.
//
//  ⚠️ EVIDENCE STANDARD (per BACS): PNP lists are refreshed
//  quarterly-to-annually and change without notice. Treat every
//  fit score below as an INDICATIVE SIGNAL, not a guarantee.
//  "asOf" is stamped per entry — surface it in the UI, and re-verify
//  this table against official sources on a recurring basis (see
//  TODO at bottom).
// ─────────────────────────────────────────────────────────────

import { ProvinceMatch } from './types';

interface NocProvinceEntry {
  noc: string;
  matches: Omit<ProvinceMatch, 'asOf'>[];
}

const ASOF = '2026-08-27';

// One entry per NOC currently in noc.ts. Extend this table whenever
// NOC_MAPPINGS in noc.ts grows — the two are meant to stay in sync.
const NOC_PROVINCE_DEMAND: NocProvinceEntry[] = [
  {
    noc: '21232', // Software developers and programmers
    matches: [
      { province: 'British Columbia', programName: 'BC PNP Tech', fit: 85, note: 'Tech is a standing BC PNP priority category with a dedicated fast-track queue.' },
      { province: 'Saskatchewan', programName: 'SINP Technology Sector', fit: 78, note: 'Added to SINP priority list in 2026.' },
      { province: 'Ontario', programName: 'OINP Human Capital Priorities', fit: 70, note: 'IT roles consistently prioritized in OINP targeted draws.' },
    ],
  },
  {
    noc: '21211', // Data scientists
    matches: [
      { province: 'British Columbia', programName: 'BC PNP Tech', fit: 82, note: 'Included in BC\'s tech occupation list.' },
      { province: 'Ontario', programName: 'OINP Human Capital Priorities', fit: 68, note: 'STEM roles feature in Ontario targeted draws.' },
    ],
  },
  {
    noc: '21221', // Business/systems analysts
    matches: [
      { province: 'British Columbia', programName: 'BC PNP Tech', fit: 70, note: 'IT analyst roles included in BC tech list.' },
      { province: 'Ontario', programName: 'OINP Human Capital Priorities', fit: 65, note: 'General IT/business analyst demand in urban Ontario.' },
    ],
  },
  {
    noc: '31301', // Registered nurses
    matches: [
      { province: 'Nova Scotia', programName: 'Nova Scotia Health Authority stream', fit: 88, note: 'Requires a job offer from NSHA/IWK, but this is an active, employer-driven fast route.' },
      { province: 'Ontario', programName: 'OINP In-Demand Skills / Healthcare', fit: 80, note: 'Healthcare consistently on Ontario\'s priority list.' },
      { province: 'British Columbia', programName: 'BC PNP Healthcare Professional', fit: 78, note: 'Dedicated healthcare stream, minimal wait for eligible occupations.' },
      { province: 'Alberta', programName: 'Alberta Express Entry / Healthcare priority', fit: 74, note: 'Healthcare listed among Alberta\'s priority sectors.' },
    ],
  },
  {
    noc: '31102', // Physicians
    matches: [
      { province: 'Nova Scotia', programName: 'Physician stream (NSHA/IWK offer required)', fit: 85, note: 'Active province-specific physician pathway.' },
      { province: 'Ontario', programName: 'OINP Healthcare priority', fit: 75, note: 'Physicians included in 2026 federal category-based draws as well.' },
    ],
  },
  {
    noc: '31120', // Pharmacists
    matches: [
      { province: 'Ontario', programName: 'OINP Healthcare priority', fit: 68, note: 'Regulated occupation — licensing timeline matters more than PNP fit here.' },
    ],
  },
  {
    noc: '33102', // Nurse aides, PSWs, orderlies
    matches: [
      { province: 'Ontario', programName: 'OINP In-Demand Skills Stream', fit: 80, note: 'Explicitly named on Ontario\'s published in-demand list.' },
      { province: 'Nova Scotia', programName: 'Care economy demand', fit: 70, note: 'Continuous demand across Atlantic care sector via AIP.' },
    ],
  },
  {
    noc: '44101', // Home child care / home support / caregivers
    matches: [
      { province: 'Ontario', programName: 'OINP In-Demand Skills Stream', fit: 75, note: 'Explicitly named on Ontario\'s published in-demand list (as "home support workers, caregivers").' },
    ],
  },
  {
    noc: '73300', // Transport truck drivers
    matches: [
      { province: 'Alberta', programName: 'Alberta Opportunity Stream', fit: 76, note: 'Transport/logistics named among Alberta priority sectors.' },
      { province: 'Saskatchewan', programName: 'SINP Employment Offer / In-Demand', fit: 68, note: 'Trades and transport roles regularly nominated.' },
    ],
  },
  {
    noc: '72200', // Electricians
    matches: [
      { province: 'Alberta', programName: 'Alberta Opportunity Stream', fit: 78, note: 'Construction/trades named among Alberta priority sectors.' },
      { province: 'Ontario', programName: 'OINP Skilled Trades Stream', fit: 70, note: 'Construction trades consistently in demand in Ontario.' },
      { province: 'Saskatchewan', programName: 'SINP Skilled Trades', fit: 66, note: 'Trades on SINP occupation lists.' },
    ],
  },
  {
    noc: '72300', // Plumbers
    matches: [
      { province: 'Alberta', programName: 'Alberta Opportunity Stream', fit: 76, note: 'Construction trades among Alberta priorities.' },
      { province: 'Ontario', programName: 'OINP Skilled Trades Stream', fit: 68, note: 'Steady demand in Ontario construction sector.' },
    ],
  },
  {
    noc: '72310', // Carpenters
    matches: [
      { province: 'Alberta', programName: 'Alberta Opportunity Stream', fit: 72, note: 'Construction trades among Alberta priorities.' },
      { province: 'Nova Scotia', programName: 'Skilled Worker stream', fit: 62, note: 'General trades demand via AIP employer routes.' },
    ],
  },
  {
    noc: '72106', // Welders
    matches: [
      { province: 'Alberta', programName: 'Alberta Opportunity Stream', fit: 80, note: 'Energy-sector-adjacent trade, strong Alberta priority.' },
      { province: 'Saskatchewan', programName: 'SINP Skilled Trades', fit: 68, note: 'Trades regularly nominated.' },
    ],
  },
  {
    noc: '62200', // Chefs
    matches: [
      { province: 'Nova Scotia', programName: 'AIP employer-driven route', fit: 60, note: 'Food service demand via Atlantic employer sponsorship — no points test.' },
    ],
  },
  {
    noc: '63200', // Cooks
    matches: [
      { province: 'Saskatchewan', programName: 'SINP In-Demand (TEER 4/food)', fit: 58, note: 'Food services on some provincial priority lists — verify current status, as Manitoba recently removed hospitality from its list.' },
    ],
  },
  {
    noc: '85101', // General farm workers
    matches: [
      { province: 'Saskatchewan', programName: 'SINP In-Demand Skills (TEER 4)', fit: 62, note: 'Agriculture named as an active demand category.' },
      { province: 'Ontario', programName: 'OINP In-Demand Skills Stream', fit: 55, note: 'Farm/agri-food roles appear on Ontario\'s list.' },
    ],
  },
];

/**
 * Return ranked, real province matches for a given NOC code.
 * Falls back to a lower-confidence sector guess only if the exact
 * NOC isn't in the table yet — and labels it clearly as such rather
 * than presenting it with the same confidence as a verified entry.
 */
export function matchProvinces(nocCode: string, occupation: string): ProvinceMatch[] {
  const exact = NOC_PROVINCE_DEMAND.find((e) => e.noc === nocCode);
  if (exact) {
    return exact.matches
      .map((m) => ({ ...m, asOf: ASOF }))
      .sort((a, b) => b.fit - a.fit);
  }

  // No verified entry yet for this NOC — say so honestly instead of
  // fabricating a confident-looking score.
  return [
    {
      province: 'Not yet verified',
      programName: 'Manual research required',
      fit: 0,
      note: `No verified PNP demand data on file for NOC ${nocCode || 'unmapped'} (occupation: "${occupation || 'unspecified'}"). Check the official PNP occupation lists directly before relying on a province recommendation.`,
      asOf: ASOF,
    },
  ];
}

// TODO(recurring): PNP lists refresh quarterly. Re-check this table
// against official provincial sources roughly every 3 months, and
// bump ASOF when you do. Sources to re-check:
//  - Job Bank Outlook ratings: canada.ca (per NOC, per province)
//  - Each province's own PNP occupation-in-demand page