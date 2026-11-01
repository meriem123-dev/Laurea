import {
  Award,
  Bell,
  BookOpen,
  Building2,
  CalendarDays,
  FileText,
  GraduationCap,
  LayoutGrid,
  Settings,
  Users,
} from '@lucide/vue'
import type { UserRole } from '../types/auth'
import type { NavSection } from '../types/navigation'

const adminNav: NavSection[] = [
  {
    label: 'Pilotage académique',
    items: [
      { label: 'Tableau de bord', to: '/admin/dashboard', icon: LayoutGrid },
      { label: 'Soutenances', to: '/admin/defenses', icon: CalendarDays },
      { label: 'Jurys', to: '/admin/juries', icon: Users },
    ],
  },
  {
    label: 'Ressources & cohortes',
    items: [
      { label: 'Étudiants', to: '/admin/students', icon: Users },
      { label: 'Professeurs', to: '/admin/professors', icon: GraduationCap },
      { label: 'Projets PFE', to: '/admin/projects', icon: BookOpen },
      { label: 'Salles', to: '/admin/rooms', icon: Building2 },
    ],
  },
  {
    label: 'Résultats',
    items: [{ label: 'Notes et résultats', to: '/admin/results', icon: Award }],
  },
  {
    label: 'Notifications et réglages',
    items: [
      // Le badge est calculé dans AppLayout à partir des notifications non lues
      { label: 'Notifications', to: '/admin/notifications', icon: Bell },
      { label: 'Paramètres', to: '/admin/settings', icon: Settings },
    ],
  },
]

const professorNav: NavSection[] = [
  {
    label: 'Espace enseignant',
    items: [
      { label: 'Tableau de bord', to: '/professor/dashboard', icon: LayoutGrid },
      { label: 'Mes projets', to: '/professor/projects', icon: BookOpen },
      { label: 'Mes soutenances', to: '/professor/defenses', icon: GraduationCap },
      { label: 'Mon planning', to: '/professor/planning', icon: CalendarDays },
      { label: 'Évaluations et documents', to: '/professor/evaluations', icon: Award },
      { label: 'Notifications', to: '/professor/notifications', icon: Bell },
      { label: 'Mon profil', to: '/professor/profile', icon: Users },
    ],
  },
]

// PROVISOIRE : pas de design pour ce menu, libellés et icônes de ma part
const studentNav: NavSection[] = [
  {
    label: 'Mon parcours',
    items: [
      { label: 'Tableau de bord', to: '/student/dashboard', icon: LayoutGrid },
      { label: 'Mon projet', to: '/student/project', icon: BookOpen },
      { label: 'Documents', to: '/student/documents', icon: FileText },
      { label: 'Ma soutenance', to: '/student/defense', icon: CalendarDays },
      { label: 'Résultats', to: '/student/results', icon: Award },
    ],
  },
]

export const NAV_BY_ROLE: Record<UserRole, NavSection[]> = {
  ADMIN_STAFF: adminNav,
  TEACHER: professorNav,
  STUDENT: studentNav,
}