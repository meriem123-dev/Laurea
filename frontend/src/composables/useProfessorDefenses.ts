import { computed } from 'vue'
import { useDefensesData, type DefenseView } from './useDefensesData'
import type { JuryRole } from '../types/dashboard'

// Soutenance enrichie avec le rôle du professeur connecté
export interface ProfessorDefense {
  view: DefenseView
  role: JuryRole
}

// Un professeur peut cumuler plusieurs rôles sur une soutenance : on affiche le principal
// (président > encadrant > examinateur).
function roleOf(view: DefenseView, professorId: string): JuryRole | null {
  if (view.defense.presidentId === professorId) return 'president'
  if (
    view.project?.supervisorId === professorId ||
    view.project?.coSupervisorId === professorId
  ) {
    return 'supervisor'
  }
  if (view.defense.memberIds.includes(professorId)) return 'examiner'
  return null
}

// TODO backend : remplacer par GET /professors/me/defenses
export function useProfessorDefenses(professorId: string) {
  const { views } = useDefensesData()

  // `views` est déjà trié par date puis par heure
  const items = computed<ProfessorDefense[]>(() =>
    views.value.flatMap((view) => {
      const role = roleOf(view, professorId)
      return role ? [{ view, role }] : []
    }),
  )

  return { items }
}