import type { Project, TeamType } from '../types/project'
import type { ProjectStatus, Student,Speciality } from '../types/student'
import { SPECIALITY_LABELS } from './speciality'

export const TEAM_TYPES: Record<TeamType, { label: string; size: number }> = {
  solo: { label: 'Monôme', size: 1 },
  pair: { label: 'Binôme', size: 2 },
  trio: { label: 'Trinôme', size: 3 },
  quad :{label : 'Quadrinôme' ,size: 4}
}

export const TEAM_TYPE_OPTIONS = (Object.keys(TEAM_TYPES) as TeamType[]).map((value) => ({
  value,
  label: TEAM_TYPES[value].label,
}))

// année universitaire courante : commence en septembre
function currentAcademicStart(date = new Date()): number {
  return date.getMonth() >= 8 ? date.getFullYear() : date.getFullYear() - 1
}

export function academicYearLabel(start: number): string {
  return `${start}-${start + 1}`
}

// courante + 2 précédentes
export const ACADEMIC_YEARS = [0, 1, 2].map((i) =>
  academicYearLabel(currentAcademicStart() - i),
)

export const PROJECT_DOMAIN_OPTIONS = (Object.keys(SPECIALITY_LABELS) as Speciality[]).map(
  (value) => ({ value, label: SPECIALITY_LABELS[value] }),
)

export function teamSize(teamType: string): number {
  return TEAM_TYPES[teamType as TeamType]?.size ?? 0
}

export function teamMembers(project: Pick<Project, 'studentIds'>, students: Student[]): Student[] {
  return project.studentIds
    .map((id) => students.find((student) => student.id === id))
    .filter((student): student is Student => student !== undefined)
}

// TODO backend : l'avancement réel viendra de l'API. En attendant, il est déduit du workflow.
const PROGRESS_BY_STATUS: Record<ProjectStatus, number> = {
  deposited: 20,
  validated: 40,
  planned: 60,
  defended: 80,
  graded: 100,
  closed: 100,
}

export function projectProgress(status: ProjectStatus): number {
  return PROGRESS_BY_STATUS[status]
}