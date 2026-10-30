import type { UserRole } from '../types/auth'

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrateur',
  professor: 'Professeur',
  student: 'Étudiant',
}

export const ROLE_OPTIONS = (Object.keys(ROLE_LABELS) as UserRole[]).map((value) => ({
  value,
  label: ROLE_LABELS[value],
}))

export const ROLE_HOME_PATH: Record<UserRole, string> = {
  admin: '/admin/dashboard',
  professor: '/professor/dashboard',
  student: '/student/dashboard',
}