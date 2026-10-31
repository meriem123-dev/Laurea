export type ProfessorTitle = 'Pr.' | 'Dr.'

export interface Professor {
  id: number
  title?: ProfessorTitle
  name: string
  email: string
  specialty: string
  busyOn?: string // date ISO : présent = occupé à cette date, absent = disponible
  juryCount: number
  projectCount: number
}

// Données saisies dans le formulaire de création
export interface ProfessorFormData {
  name: string
  email: string
  specialty: string
  temporaryPassword: string // à envoyer au backend uniquement, jamais conservé côté client
}