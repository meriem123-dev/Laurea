export interface Criterion {
  id: string
  label: string
  description: string
  coefficient: number
}

// Notes d'un juré : identifiant du critère -> note sur 20
export type CriterionScores = Record<string, number>

export interface DefenseEvaluation {
  defenseId: number
  scores: Record<number, CriterionScores> // identifiant du professeur -> ses notes
  finalGrade: number | null // note retenue ; null = moyenne du jury
  justification: string
  observations: string
  locked: boolean
}