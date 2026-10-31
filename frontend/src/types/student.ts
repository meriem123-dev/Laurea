export type Cursus = 'MASTER' | 'INGENIEUR'

// États du workflow : DÉPOSÉ → VALIDÉ → PLANIFIÉ → SOUTENU → NOTÉ → CLOS
export type ProjectStatus = 'deposited' | 'validated' | 'planned' | 'defended' | 'graded' | 'closed'

export interface Student {
  id: number
  firstName: string
  lastName: string
  email: string
  matricule: string
  specialty: string
  group: string
  cursus: Cursus
  projectStatus: ProjectStatus
}