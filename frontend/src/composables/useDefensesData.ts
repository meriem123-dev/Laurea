import { computed, ref } from 'vue'
import { defenses as defensesMock } from '../mocks/defenses'
import { professors } from '../mocks/professors'
import { projects } from '../mocks/projects'
import { rooms } from './useRoomsData'
import { students } from '../mocks/students'
import type { Defense } from '../types/defense'
import type { Professor } from '../types/professor'
import type { Project } from '../types/project'
import type { Room } from '../types/room'
import type { Student } from '../types/student'
import { teamMembers } from '../utils/project'
import { fullName } from '../utils/student'

// État partagé au niveau du module : la page Jurys et la page Soutenances voient les mêmes données.
// TODO backend : remplacer par un store Pinia branché sur l'API (avec états chargement / erreur).
const defenses = ref<Defense[]>([...defensesMock])

// Soutenance enrichie avec les objets liés, prête à être affichée
export interface DefenseView {
  defense: Defense
  project: Project | undefined
  students: Student[]
  studentNames: string
  room: Room | undefined
  president: Professor | undefined
  members: Professor[]
}

function toView(defense: Defense): DefenseView {
  const project = projects.find((item) => item.id === defense.projectId)
  const team = project ? teamMembers(project, students) : []

  return {
    defense,
    project,
    students: team,
    studentNames: team.map((student) => fullName(student)).join(', '),
    room: rooms.find((item) => item.id === defense.roomId),
    president: professors.find((item) => item.id === defense.presidentId),
    members: defense.memberIds
      .map((id) => professors.find((item) => item.id === id))
      .filter((professor): professor is Professor => professor !== undefined),
  }
}

export function useDefensesData() {
  const views = computed(() =>
    [...defenses.value]
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
      .map(toView),
  )

  function addDefense(data: Omit<Defense, 'id'>): Defense {
    const id = Math.max(0, ...defenses.value.map((defense) => defense.id)) + 1
    const created: Defense = { id, ...data }
    defenses.value = [...defenses.value, created]
    return created
  }

  function updateDefense(id: number, data: Partial<Omit<Defense, 'id'>>) {
    defenses.value = defenses.value.map((defense) =>
      defense.id === id ? { ...defense, ...data } : defense,
    )
  }

  function removeDefense(id: number) {
    defenses.value = defenses.value.filter((defense) => defense.id !== id)
  }

  return {
    defenses,
    views,
    projects,
    professors,
    rooms,
    toView,
    addDefense,
    updateDefense,
    removeDefense,
  }
}