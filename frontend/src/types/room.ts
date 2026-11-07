export type RoomTone = 'blue' | 'violet' | 'orange' | 'green'

export interface Room {
  id: string
  name: string
  block: string // bloc ou bâtiment (chaîne vide si non renseigné)
  pole: string // pôle (chaîne vide si non renseigné)
  equipment: string // équipements (chaîne vide si non renseigné)
  capacity: number
  tone: RoomTone // couleur de la salle dans le calendrier
}

// Données saisies dans le formulaire (la couleur est attribuée automatiquement)
export type RoomFormData = Omit<Room, 'id' | 'tone'>