import type {
  DefenseBreakdownItem,
  StatSummary,
  TodoAction,
  UpcomingDefense,
} from '../types/dashboard'

// Données fictives : à remplacer par les appels API (api/ + store)

export const adminStats: StatSummary[] = [
  { id: 'students', label: 'Étudiants', value: 248, hint: '+12 cette année' },
  { id: 'professors', label: 'Professeurs', value: 42, hint: '38 disponibles' },
  { id: 'projects', label: 'Projets PFE', value: 126, hint: '8 en attente' },
  { id: 'defenses', label: 'Soutenances', value: 38, hint: '24 planifiées' },
]

export const defenseBreakdown: DefenseBreakdownItem[] = [
  { id: 'planned', label: 'Planifiées', value: 38 },
  { id: 'done', label: 'Terminées', value: 52 },
  { id: 'toPlan', label: 'À planifier', value: 28 },
  { id: 'cancelled', label: 'Annulées', value: 8 },
]

export const upcomingDefenses: UpcomingDefense[] = [
  {
    id: 1,
    date: '2025-06-18',
    time: '09:00',
    room: 'Salle A12',
    student: 'Lina Bensaid',
    project: 'Détection précoce des maladies par IA',
    status: 'confirmed',
  },
  {
    id: 2,
    date: '2025-06-18',
    time: '11:00',
    room: 'Amphi B',
    student: 'Yacine Haddad',
    project: 'Plateforme intelligente de gestion universitaire',
    status: 'planned',
  },
  {
    id: 3,
    date: '2025-06-19',
    time: '14:30',
    room: 'Salle C04',
    student: 'Sarah Khelifi',
    project: 'Système de détection d’intrusions réseau',
    status: 'confirmed',
  },
]

export const todoActions: TodoAction[] = [
  {
    id: 'pendingProjects',
    count: 8,
    label: 'projets en attente',
    description: 'À examiner et valider',
    to: '/admin/projects',
  },
  {
    id: 'incompleteJuries',
    count: 3,
    label: 'jurys incomplets',
    description: 'Membres à affecter',
    to: '/admin/juries',
  },
  {
    id: 'resultsToPublish',
    count: 5,
    label: 'résultats à publier',
    description: 'Notes validées',
    to: '/admin/results',
  },
]