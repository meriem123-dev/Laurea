import type { DocumentStatus, ProjectDocument } from '../types/document'
import type { BadgeTone } from '../types/ui'

export const DOCUMENT_STATUS_META: Record<DocumentStatus, { label: string; tone: BadgeTone }> = {
  PENDING: { label: 'En attente d’évaluation', tone: 'info' },
  EVALUATED: { label: 'Évalué', tone: 'success' },
}

// Statut fourni par l'API, sinon déduit de la note (données fictives)
export function documentStatusOf(document: Pick<ProjectDocument, 'status' | 'grade'>): DocumentStatus {
  return document.status ?? (document.grade === null ? 'PENDING' : 'EVALUATED')
}