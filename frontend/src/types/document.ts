export type DocumentStatus = 'PENDING' | 'EVALUATED'

export interface ProjectDocument {
  id: number
  projectId: string
  name: string
  submittedOn: string // date ISO : 2025-06-02
  sizeKb: number
  status?: DocumentStatus // absent dans les données fictives
  grade: number | null // sur 20 ; null = pas encore évalué
  comment: string
  evaluatedOn?: string | null
}