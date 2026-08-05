export interface IELTSScores {
  reading: number;
  writing: number;
  listening: number;
  speaking: number;
}

export type IELTSSkill = keyof IELTSScores;

const TABLES: Record<IELTSSkill, [number, number][]> = {
  listening: [[4.5, 4], [5, 5], [5.5, 6], [6, 7], [7.5, 8], [8, 9], [8.5, 10]],
  reading: [[3.5, 4], [4, 5], [5, 6], [6, 7], [6.5, 8], [7, 9], [8, 10]],
  writing: [[4, 4], [5, 5], [5.5, 6], [6, 7], [6.5, 8], [7, 9], [7.5, 10]],
  speaking: [[4, 4], [5, 5], [5.5, 6], [6, 7], [6.5, 8], [7, 9], [7.5, 10]],
};

export function ieltsToClb(skill: IELTSSkill, band: number): number {
  let clb = 0;
  for (const [b, c] of TABLES[skill]) {
    if (band >= b) clb = c;
  }
  return clb;
}

export function overallClb(scores: IELTSScores): number {
  if (!scores.reading && !scores.writing && !scores.listening && !scores.speaking) return 0;
  return Math.min(
    ieltsToClb('reading', scores.reading),
    ieltsToClb('writing', scores.writing),
    ieltsToClb('listening', scores.listening),
    ieltsToClb('speaking', scores.speaking)
  );
}