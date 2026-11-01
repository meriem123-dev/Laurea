export type StatId = 'students' | 'professors' | 'projects' | 'defenses'

export interface StatSummary<Id extends string = StatId> {
  id: Id
  label: string
  value: number
  hint: string
}

export type BreakdownId = 'planned' | 'done' | 'toPlan' | 'cancelled'

export interface DefenseBreakdownItem {
  id: BreakdownId
  label: string
  value: number
}

export type DefenseStatus = 'planned' | 'confirmed'

// Rôle du professeur connecté dans une soutenance (espace enseignant)
export type JuryRole = 'president' | 'examiner' | 'supervisor'

export interface UpcomingDefense {
  id: number
  date: string // ISO : 2025-06-18
  time: string
  room: string
  student: string
  project: string
  status?: DefenseStatus // vue admin
  role?: JuryRole // vue enseignant (remplace le statut dans le badge)
}

export type TodoActionId = 'pendingProjects' | 'incompleteJuries' | 'resultsToPublish'

export interface TodoAction<Id extends string = TodoActionId> {
  id: Id
  count: number
  label: string
  description: string
  to: string
}

// Espace enseignant
export type ProfessorStatId = 'supervised' | 'upcoming' | 'juries'
export type ProfessorStat = StatSummary<ProfessorStatId>

export type ProfessorTodoId = 'evaluations' | 'reports'
export type ProfessorTodo = TodoAction<ProfessorTodoId>