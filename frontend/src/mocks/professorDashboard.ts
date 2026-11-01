import type { ProfessorStat, ProfessorTodo, UpcomingDefense } from '../types/dashboard'

// Données fictives : à remplacer par les appels API (api/ + store)

export const professorStats: ProfessorStat[] = [
  { id: 'supervised', label: 'Projets encadrés', value: 6, hint: '2 rapports à examiner' },
  { id: 'upcoming', label: 'Soutenances à venir', value: 4, hint: 'Prochaine dans 3 jours' },
  { id: 'juries', label: 'Participations aux jurys', value: 9, hint: 'Promotion 2025' },
]

export const professorUpcomingDefenses: UpcomingDefense[] = [
  {
    id: 1,
    date: '2025-06-18',
    time: '09:00',
    room: 'Salle A12',
    student: 'Lina Bensaid',
    project: 'Détection précoce des maladies par IA',
    role: 'president',
  },
  {
    id: 2,
    date: '2025-06-18',
    time: '11:00',
    room: 'Amphi B',
    student: 'Yacine Haddad',
    project: 'Plateforme intelligente de gestion universitaire',
    role: 'examiner',
  },
  {
    id: 3,
    date: '2025-06-19',
    time: '14:30',
    room: 'Salle C04',
    student: 'Sarah Khelifi',
    project: 'Système de détection d’intrusions réseau',
    role: 'supervisor',
  },
]

export const professorTodos: ProfessorTodo[] = [
  {
    id: 'evaluations',
    count: 2,
    label: 'évaluations à saisir',
    description: 'Échéance le 20 juin',
    to: '/professor/evaluations',
  },
  {
    id: 'reports',
    count: 2,
    label: 'rapports à examiner',
    description: 'Nouveaux dépôts étudiants',
    to: '/professor/projects',
  },
]

export const professorPriority = 'Finaliser les évaluations avant la prochaine soutenance.'