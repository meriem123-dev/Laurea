export type StatId = 'students' | 'professors' | 'projects' | 'defenses'

export interface StatSummary {
  id: StatId
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

export interface UpcomingDefense {
  id: number
  date: string // ISO : 2025-06-18
  time: string
  room: string
  student: string
  project: string
  status: DefenseStatus
}

export type TodoActionId = 'pendingProjects' | 'incompleteJuries' | 'resultsToPublish'

export interface TodoAction {
  id: TodoActionId
  count: number
  label: string
  description: string
  to: string
}