export interface Defense {
  id: number
  projectId: string
  date: string // ISO : 2025-06-18
  time: string // HH:MM
  duration: number // minutes
  roomId: string
  presidentId: string
  memberIds: string[]
}

// Données saisies dans le formulaire (la durée est gérée par l'application)
export type DefenseFormData = Omit<Defense, 'id' | 'duration'>