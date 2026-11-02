import type { AppNotification } from '../types/notification'

// Données fictives : à remplacer par les appels API (api/ + store).
const ago = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString()
const DAY = 24 * 60

export const studentNotifications: AppNotification[] = [
  {
    id: 1,
    type: 'project',
    title: 'Votre sujet a été validé',
    message: 'Pr. Karim Mansouri a validé « Détection précoce des maladies par IA ».',
    createdAt: ago(2 * DAY),
    read: false,
    to: '/student/project',
  },
  {
    id: 2,
    type: 'defense',
    title: 'Soutenance planifiée le 18 juin',
    message: 'Votre soutenance a lieu le 18 juin à 09:00 en Salle A12.',
    createdAt: ago(4 * DAY),
    read: false,
    to: '/student/defense',
  },
  {
    id: 3,
    type: 'system',
    title: 'Bienvenue sur Laurea',
    message: 'Votre espace étudiant est prêt. Suivez votre projet et déposez vos documents.',
    createdAt: ago(9 * DAY),
    read: false,
    to: '/student/project',
  },
]