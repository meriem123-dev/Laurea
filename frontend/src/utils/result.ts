import type { DefenseResult, PublicationState } from '../types/result'
import type { BadgeTone } from '../types/ui'

export const PUBLICATION_META: Record<PublicationState, { label: string; tone: BadgeTone }> = {
  published: { label: 'Publié', tone: 'success' },
  toValidate: { label: 'À valider', tone: 'info' },
  missing: { label: 'Note manquante', tone: 'danger' },
}

export function missingGrades(result: DefenseResult): number {
  return Math.max(0, result.expectedGrades - result.grades.length)
}

export function publicationState(result: DefenseResult): PublicationState {
  if (result.published) return 'published'
  return missingGrades(result) > 0 ? 'missing' : 'toValidate'
}

// TODO : moyenne simple. À remplacer si l'établissement applique des coefficients ou
// des règles différentes selon le cursus (Master / Ingénieur).
export function finalGrade(result: DefenseResult): number | null {
  if (result.grades.length === 0 || missingGrades(result) > 0) return null
  const sum = result.grades.reduce((total, grade) => total + grade.value, 0)
  return Math.round((sum / result.grades.length) * 10) / 10
}

const gradeFormat = new Intl.NumberFormat('fr-FR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 2,
})

/** 16.4 -> « 16,4 » */
export function formatGrade(value: number): string {
  return gradeFormat.format(value)
}