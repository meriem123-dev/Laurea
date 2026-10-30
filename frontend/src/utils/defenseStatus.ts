import type { DefenseStatus } from '../types/dashboard'
import type { BadgeTone } from '../types/ui'

export const DEFENSE_STATUS_META: Record<DefenseStatus, { label: string; tone: BadgeTone }> = {
  confirmed: { label: 'Confirmée', tone: 'success' },
  planned: { label: 'Planifiée', tone: 'warning' },
}