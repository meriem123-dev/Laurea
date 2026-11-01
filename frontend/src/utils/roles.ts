import type { UserRole } from '../types/auth'

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN_STAFF: 'Administration',
  TEACHER: 'Professeur',
  STUDENT: 'Étudiant',
}

export const ROLE_HOME_PATH: Record<UserRole, string> = {
  ADMIN_STAFF: '/admin/dashboard',
  TEACHER: '/professor/dashboard',
  STUDENT: '/student/dashboard',
}

export const ROLE_OPTIONS = (Object.keys(ROLE_LABELS) as UserRole[]).map((value) => ({
  value,
  label: ROLE_LABELS[value],
}))