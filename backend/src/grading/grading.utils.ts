export interface CriterionLike {
  id: string;
  coefficient: number;
}

export const MAX_SCORE = 20;
const round2 = (n: number) => Math.round(n * 100) / 100;

// null tant qu'il manque un critère
export function weightedGrade(
  scores: Record<string, number>,
  criteria: CriterionLike[],
): number | null {
  if (criteria.length === 0) return null;
  let sum = 0;
  let total = 0;
  for (const c of criteria) {
    const value = scores[c.id];
    if (value === undefined) return null;
    sum += value * c.coefficient;
    total += c.coefficient;
  }
  return total === 0 ? null : round2(sum / total);
}

// null si un juré n'a pas fini sa grille
export function juryAverage(grades: (number | null)[]): number | null {
  if (grades.length === 0 || grades.some((g) => g === null)) return null;
  const sum = (grades as number[]).reduce((a, b) => a + b, 0);
  return round2(sum / grades.length);
}