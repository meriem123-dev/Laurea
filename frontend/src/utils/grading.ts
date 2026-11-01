import type { Criterion, CriterionScores } from '../types/evaluation'

// Mêmes règles que backend/src/grading/grading.service.ts (moyenne pondérée, moyenne du jury,
// arrondi à 2 décimales). TODO backend : le serveur reste la référence pour la note validée.
export const MAX_SCORE = 20

const round2 = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100

const preciseFormat = new Intl.NumberFormat('fr-FR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** 16.4 -> « 16,40 » */
export function formatPreciseGrade(value: number): string {
  return preciseFormat.format(value)
}

export function totalCoefficient(criteria: Criterion[]): number {
  return criteria.reduce((sum, criterion) => sum + criterion.coefficient, 0)
}

/** Part d'un critère dans la note, en pourcentage entier */
export function coefficientShare(criterion: Criterion, criteria: Criterion[]): number {
  return Math.round((criterion.coefficient / totalCoefficient(criteria)) * 100)
}

export function filledCount(scores: CriterionScores | undefined, criteria: Criterion[]): number {
  return criteria.filter((criterion) => scores?.[criterion.id] !== undefined).length
}

/** Note pondérée d'un juré sur 20, ou null tant que sa grille est incomplète */
export function weightedGrade(
  scores: CriterionScores | undefined,
  criteria: Criterion[],
): number | null {
  if (filledCount(scores, criteria) < criteria.length) return null
  const sum = criteria.reduce(
    (total, criterion) => total + (scores?.[criterion.id] ?? 0) * criterion.coefficient,
    0,
  )
  return round2(sum / totalCoefficient(criteria))
}

/** Moyenne du jury, ou null si une grille est incomplète */
export function juryAverage(grades: (number | null)[]): number | null {
  if (grades.length === 0 || grades.some((grade) => grade === null)) return null
  const sum = grades.reduce<number>((total, grade) => total + (grade ?? 0), 0)
  return round2(sum / grades.length)
}