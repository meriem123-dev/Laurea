import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useMyDefensesStore } from '../stores/useMyDefensesStore'
import type { TeacherDefenseDto, TeacherRole } from '../api/defense.api'
import type { JuryRole } from '../../../types/dashboard'

// Forme attendue par ProfessorDefenseCard
export interface ProfessorDefenseItem {
  role: JuryRole
  view: {
    defense: {
      id: number
      date: string
      time: string
      duration: number
    }
    project: { id: string; title: string; domain: string }
    students: { id: string }[]
    studentNames: string
    room: { id: string; name: string }
  }
  myResponse: TeacherDefenseDto['myResponse']
  status: TeacherDefenseDto['status']
}

// président > encadrant (ou co-encadrant) > examinateur
function mainRole(roles: TeacherRole[]): JuryRole {
  if (roles.includes('president')) return 'president'
  if (roles.includes('supervisor') || roles.includes('coSupervisor')) return 'supervisor'
  return 'examiner'
}

// transforme la réponse de l'API en la forme que la carte sait afficher
function toItem(d: TeacherDefenseDto): ProfessorDefenseItem {
  return {
    role: mainRole(d.roles),
    view: {
      defense: { id: d.id, date: d.date, time: d.time, duration: d.duration },
      project: { id: d.project.id, title: d.project.title, domain: '' },
      students: d.students.map((s) => ({ id: s.id })),
      studentNames: d.students.map((s) => `${s.firstName} ${s.lastName}`).join(', '),
      room: { id: d.room.id, name: d.room.name },
    },
    myResponse: d.myResponse,
    status: d.status,
  }
}

export function useMyProfessorDefenses() {
  const store = useMyDefensesStore()
  const { defenses, loading, error } = storeToRefs(store)

  // charge les soutenances à l'ouverture de la page
  onMounted(store.fetchMine)

  // l'API renvoie déjà les soutenances triées par date puis heure
  const items = computed<ProfessorDefenseItem[]>(() => defenses.value.map(toItem))

  return { items, loading, error }
}