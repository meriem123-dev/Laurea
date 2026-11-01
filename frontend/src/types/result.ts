export type PublicationState = 'published' | 'toValidate' | 'missing'

export interface Grade {
  professorId: number
  value: number // sur 20
}

export interface DefenseResult {
  id: number
  studentId: number
  expectedGrades: number // nombre de notes attendues du jury
  grades: Grade[] // notes déjà reçues
  published: boolean
}