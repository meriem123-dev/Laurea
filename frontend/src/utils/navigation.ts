import {
  Award,
  Bell,
  BookOpen,
  Building2,
  CalendarDays,
  ClipboardCheck,
  FileText,
  GraduationCap,
  LayoutGrid,
  Settings,
  Users,
} from 'lucide-vue-next'
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
      // TODO backend : le badge viendra d'un store de notifications
      { label: 'Notifications', to: '/admin/notifications', icon: Bell, badge: 3 },
      { label: 'Paramètres', to: '/admin/settings', icon: Settings },
    ],
  },
]

// PROVISOIRE : pas de design pour ces deux menus, libellés et icônes de ma part
const professorNav: NavSection[] = [
  {
    label: 'Encadrement',
    items: [
      { label: 'Tableau de bord', to: '/professor/dashboard', icon: LayoutGrid },
      { label: 'Projets encadrés', to: '/professor/projects', icon: BookOpen },
      { label: 'Jurys', to: '/professor/juries', icon: Users },
    ],
  },
  {
    label: 'Soutenances',
    items: [
      { label: 'Soutenances', to: '/professor/defenses', icon: CalendarDays },
      { label: 'Évaluations', to: '/professor/evaluations', icon: ClipboardCheck },
    ],
  },
]

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
  admin: adminNav,
  professor: professorNav,
  student: studentNav,
}