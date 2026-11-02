import type { UserRole } from '../types/auth'
import type { AppNotification } from '../types/notification'
import { studentNotifications } from './studentNotifications'
// Données fictives : à remplacer par les appels API (api/ + store).
// Les dates sont calculées par rapport à maintenant pour que « il y a 2 h » reste cohérent.
const ago = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString()
const HOUR = 60
const DAY = 24 * 60

const adminNotifications: AppNotification[] = [
  {
    id: 1,
    type: 'result',
    title: 'Résultat à publier',
    message: 'Les 3 notes de Yacine Haddad sont reçues. Le résultat peut être validé et publié.',
    createdAt: ago(12),
    read: false,
    to: '/admin/results',
  },
  {
    id: 2,
    type: 'jury',
    title: 'Jury incomplet',
    message: 'La soutenance du 20 juin à 10:00 n’a que 2 membres sur 3.',
    createdAt: ago(55),
    read: false,
    to: '/admin/juries',
  },
  {
    id: 3,
    type: 'project',
    title: 'Nouveau projet déposé',
    message: 'Sarah Khelifi a déposé « Système de détection d’intrusions réseau ».',
    createdAt: ago(3 * HOUR),
    read: false,
    to: '/admin/projects',
  },
  {
    id: 4,
    type: 'defense',
    title: 'Soutenance planifiée',
    message: 'La soutenance de Lina Bensaïd est planifiée le 18 juin à 09:00 en Salle A12.',
    createdAt: ago(DAY),
    read: true,
    to: '/admin/defenses',
  },
  {
    id: 5,
    type: 'result',
    title: 'Note manquante',
    message: 'Il manque encore 1 note du jury pour Sarah Khelifi.',
    createdAt: ago(DAY + 3 * HOUR),
    read: true,
    to: '/admin/results',
  },
  {
    id: 6,
    type: 'project',
    title: 'Projet validé',
    message: '« Détection précoce des maladies par IA » est passé au statut Validé.',
    createdAt: ago(4 * DAY),
    read: true,
    to: '/admin/projects',
  },
  {
    id: 7,
    type: 'system',
    title: 'Bienvenue sur Laurea',
    message: 'Votre espace administration est prêt. Commencez par ajouter des étudiants et des professeurs.',
    createdAt: ago(9 * DAY),
    read: true,
    to: '/admin/students',
  },
]

// Cohérentes avec mocks/defenses.ts et mocks/projects.ts (professeur n° 1 : Karim Mansouri)
const professorNotifications: AppNotification[] = [
  {
    id: 1,
    type: 'result',
    title: 'Évaluation à compléter',
    message: 'Votre grille d’évaluation de la soutenance de Yacine Haddad n’est pas complète.',
    createdAt: ago(20),
    read: false,
    to: '/professor/defenses/2',
  },
  {
    id: 2,
    type: 'project',
    title: 'Nouveau dépôt',
    message: 'Lina Bensaïd a déposé « Mémoire final.pdf ». Il est prêt à être évalué.',
    createdAt: ago(2 * HOUR),
    read: false,
    to: '/professor/evaluations?project=1',
  },
  {
    id: 3,
    type: 'jury',
    title: 'Affectation au jury',
    message: 'Vous êtes membre du jury de la soutenance de Yacine Haddad le 18 juin à 11:00.',
    createdAt: ago(DAY),
    read: false,
    to: '/professor/defenses/2',
  },
  {
    id: 4,
    type: 'defense',
    title: 'Soutenance planifiée',
    message: 'La soutenance de Lina Bensaïd, que vous encadrez, est planifiée le 18 juin à 09:00 en Salle A12.',
    createdAt: ago(DAY + 5 * HOUR),
    read: true,
    to: '/professor/defenses/1',
  },
  {
    id: 5,
    type: 'result',
    title: 'Résultat publié',
    message: 'Le résultat d’Inès Touati, dont vous encadrez le projet, a été publié.',
    createdAt: ago(5 * DAY),
    read: true,
    to: '/professor/evaluations?project=5',
  },
  {
    id: 6,
    type: 'system',
    title: 'Bienvenue sur Laurea',
    message: 'Votre espace enseignant est prêt. Retrouvez vos projets encadrés et vos soutenances.',
    createdAt: ago(9 * DAY),
    read: true,
    to: '/professor/projects',
  },
]

export const notificationsByRole: Record<UserRole, AppNotification[]> = {
  ADMIN_STAFF: adminNotifications,
  TEACHER: professorNotifications,
    STUDENT: studentNotifications, // TODO : espace étudiant pas encore conçu
}