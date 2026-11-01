export interface Defense {
  id: number
  projectId: number
  date: string // ISO : 2025-06-18
  time: string // HH:MM
  duration: number // minutes
  roomId: number
  presidentId: number
  memberIds: number[]
}

// Données saisies dans le formulaire (la durée est gérée par l'application)
export type DefenseFormData = Omit<Defense, 'id' | 'duration'>