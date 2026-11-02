// Données fictives : à remplacer par les appels API.
// Les identifiants de projet renvoient à mocks/projects.ts.
export interface ProjectMeta {
  validatedOn: string // date ISO : validation du sujet
  reportDeadline: string // date ISO : dépôt du rapport final
  description: string
}

export const projectMeta: Record<number, ProjectMeta> = {
  1: {
    validatedOn: '2025-05-28',
    reportDeadline: '2025-06-12',
    description:
      'Conception d’un système d’aide au diagnostic basé sur l’apprentissage profond, permettant d’analyser des images médicales et de détecter précocement certaines pathologies.',
  },
}

export type StepState = 'done' | 'current' | 'upcoming'

export interface ProjectStep {
  id: 'proposed' | 'validated' | 'report' | 'defense'
  label: string
  state: StepState
  detail: string // pour « defense », remplacé par la date de la soutenance
}

// TODO backend : les étapes et leur état viendront de l'API (workflow du projet)
export const projectSteps: ProjectStep[] = [
  { id: 'proposed', label: 'Sujet proposé', state: 'done', detail: 'Terminé' },
  { id: 'validated', label: 'Validation du sujet', state: 'done', detail: 'Terminé' },
  { id: 'report', label: 'Dépôt du rapport', state: 'current', detail: 'En cours · 12 juin' },
  { id: 'defense', label: 'Soutenance finale', state: 'upcoming', detail: 'À planifier' },
]