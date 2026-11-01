import type { JuryRole } from '../types/dashboard'
import type { BadgeTone } from '../types/ui'

export const JURY_ROLE_META: Record<JuryRole, { label: string; tone: BadgeTone }> = {
  president: { label: 'Président', tone: 'info' },
  examiner: { label: 'Examinateur', tone: 'violet' },
  supervisor: { label: 'Encadrant', tone: 'success' },
}