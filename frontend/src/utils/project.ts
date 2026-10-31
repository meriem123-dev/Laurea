import type { Project, TeamType } from '../types/project'
import type { Student } from '../types/student'

export const TEAM_TYPES: Record<TeamType, { label: string; size: number }> = {
  solo: { label: 'Monôme', size: 1 },
  pair: { label: 'Binôme', size: 2 },
  trio: { label: 'Trinôme', size: 3 },
}

export const TEAM_TYPE_OPTIONS = (Object.keys(TEAM_TYPES) as TeamType[]).map((value) => ({
  value,
  label: TEAM_TYPES[value].label,
}))

// TODO backend : ces listes de référence viendront d'une API
export const ACADEMIC_YEARS = ['2025-2026', '2024-2025']

export const PROJECT_DOMAINS = [
  'Intelligence artificielle',
  'Systèmes d’information',
  'Cybersécurité',
  'Data Science',
  'Génie logiciel',
  'Réseaux et télécoms',
  'Bases de données',
]

export function teamSize(teamType: string): number {
  return TEAM_TYPES[teamType as TeamType]?.size ?? 0
}

export function teamMembers(project: Pick<Project, 'studentIds'>, students: Student[]): Student[] {
  return project.studentIds
    .map((id) => students.find((student) => student.id === id))
    .filter((student): student is Student => student !== undefined)
}