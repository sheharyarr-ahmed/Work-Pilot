export const SHORTLIST_THRESHOLD = 70;

export function statusForScore(score: number) {
  return score >= SHORTLIST_THRESHOLD ? "SHORTLISTED" : "NEW";
}
