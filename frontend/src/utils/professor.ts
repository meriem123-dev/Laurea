import type { Professor } from '../types/professor'
import type { BadgeTone } from '../types/ui'
import { formatDayMonth } from './format'

/** « Pr. Karim Mansouri » (le titre est facultatif) */
export function displayName(professor: Pick<Professor, 'title' | 'name'>): string {
  return [professor.title, professor.name].filter(Boolean).join(' ')
}

/** « Karim Mansouri » -> « KM » */
export function initials(professor: Pick<Professor, 'name'>): string {
  const parts = professor.name.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.charAt(0) ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? '') : ''
  return `${first}${last}`.toUpperCase()
}

export function availability(professor: Pick<Professor, 'busyOn'>): {
  label: string
  tone: BadgeTone
} {
  return professor.busyOn
    ? { label: `Occupé le ${formatDayMonth(professor.busyOn)}`, tone: 'danger' }
    : { label: 'Disponible', tone: 'success' }
}