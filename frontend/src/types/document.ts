export interface ProjectDocument {
  id: number
  projectId: number
  name: string
  submittedOn: string // date ISO : 2025-06-02
  sizeKb: number
  grade: number | null // sur 20 ; null = pas encore évalué
  comment: string
}