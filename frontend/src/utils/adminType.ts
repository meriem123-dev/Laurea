import type { AdminType } from '../types/admin'

export const ADMIN_TYPE_LABELS: Record<AdminType, string> = {
  DEPARTMENT_HEAD: 'Responsable de département',
  ADMINISTRATION: 'Administration / Scolarité',
}

export const ADMIN_TYPE_OPTIONS = (Object.keys(ADMIN_TYPE_LABELS) as AdminType[]).map(
  (value) => ({ value, label: ADMIN_TYPE_LABELS[value] }),
)