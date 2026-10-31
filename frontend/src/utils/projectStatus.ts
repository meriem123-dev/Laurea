import type { ProjectStatus } from '../types/student'
import type { BadgeTone } from '../types/ui'

export const PROJECT_STATUS_META: Record<ProjectStatus, { label: string; tone: BadgeTone }> = {
  deposited: { label: 'Déposé', tone: 'neutral' },
  validated: { label: 'Validé', tone: 'info' },
  planned: { label: 'Planifié', tone: 'warning' },
  defended: { label: 'Soutenu', tone: 'violet' },
  graded: { label: 'Noté', tone: 'success' },
  closed: { label: 'Clos', tone: 'neutral' },
}