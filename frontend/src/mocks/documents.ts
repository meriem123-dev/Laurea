import type { ProjectDocument } from '../types/document'

// Données fictives : à remplacer par les appels API.
// projectId renvoie à mocks/projects.ts.
export const documents: ProjectDocument[] = [
  {
    id: 1,
    projectId: 1,
    name: 'Rapport intermédiaire.pdf',
    submittedOn: '2025-05-12',
    sizeKb: 1800,
    grade: 16,
    comment: 'Bonne problématique, méthode claire.',
  },
  {
    id: 2,
    projectId: 1,
    name: 'Mémoire final.pdf',
    submittedOn: '2025-06-02',
    sizeKb: 4300,
    grade: 17,
    comment: '',
  },
  {
    id: 3,
    projectId: 2,
    name: 'Cahier des charges.pdf',
    submittedOn: '2025-04-20',
    sizeKb: 640,
    grade: null,
    comment: '',
  },
  {
    id: 4,
    projectId: 3,
    name: 'Rapport intermédiaire.pdf',
    submittedOn: '2025-05-18',
    sizeKb: 2100,
    grade: 15,
    comment: '',
  },
  {
    id: 5,
    projectId: 5,
    name: 'Rapport de stage.pdf',
    submittedOn: '2025-03-14',
    sizeKb: 3200,
    grade: 15,
    comment: 'Travail sérieux, à mieux documenter.',
  },
]