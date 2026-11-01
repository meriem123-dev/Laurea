import type { Room } from '../types/room'

// Données fictives : à remplacer par les appels API
export const rooms: Room[] = [
  {
    id: 1,
    name: 'Salle A12',
    block: 'Bâtiment Sciences',
    pole: '',
    equipment: 'Vidéoprojecteur, tableau',
    capacity: 24,
    tone: 'blue',
  },
  {
    id: 2,
    name: 'Amphi B',
    block: 'Bâtiment Central',
    pole: '',
    equipment: 'Vidéoconférence, sonorisation, micro',
    capacity: 120,
    tone: 'violet',
  },
  {
    id: 3,
    name: 'Salle C04',
    block: '',
    pole: 'Pôle Numérique',
    equipment: 'Vidéoprojecteur, visioconférence',
    capacity: 32,
    tone: 'green',
  },
  {
    id: 4,
    name: 'Salle A08',
    block: 'Bâtiment Sciences',
    pole: '',
    equipment: 'Tableau',
    capacity: 20,
    tone: 'orange',
  },
]