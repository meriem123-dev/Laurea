export type PublicationState = 'published' | 'toValidate' | 'missing'

export interface Grade {
  professorId: number
  value: number // sur 20
}

export interface DefenseResult {
  id: number
  studentId: string
  expectedGrades: number
  grades: Grade[]
  published: boolean
}