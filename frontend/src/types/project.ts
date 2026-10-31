import type { ProjectStatus } from './student'

export type TeamType = 'solo' | 'pair' | 'trio'

export interface Project {
  id: number
  title: string
  domain: string
  company: string // entreprise éventuelle : chaîne vide si aucune
  academicYear: string
  teamType: TeamType
  studentIds: number[]
  supervisorId: number
  coSupervisorId: number | null
  notes: string
  status: ProjectStatus
}

// Données saisies dans le formulaire
export interface ProjectFormData {
  title: string
  academicYear: string
  domain: string
  company: string
  teamType: TeamType
  studentIds: number[]
  supervisorId: number
  coSupervisorId: number | null
  notes: string
}