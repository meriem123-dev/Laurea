import type { Defense } from '../types/defense'

// Données fictives. projectId, presidentId et memberIds renvoient à mocks/projects.ts
// et mocks/professors.ts. La 4e soutenance a un jury incomplet (2 membres sur 3).
export const defenses: Defense[] = [
  {
    id: 1,
    projectId: 1,
    date: '2025-06-18',
    time: '09:00',
    duration: 60,
    roomId: 1,
    presidentId: 2,
    memberIds: [5, 6, 7],
  },
  {
    id: 2,
    projectId: 2,
    date: '2025-06-18',
    time: '11:00',
    duration: 60,
    roomId: 2,
    presidentId: 2,
    memberIds: [1, 5, 8],
  },
  {
    id: 3,
    projectId: 3,
    date: '2025-06-19',
    time: '14:30',
    duration: 60,
    roomId: 3,
    presidentId: 2,
    memberIds: [5, 6, 7],
  },
  {
    id: 4,
    projectId: 5,
    date: '2025-06-20',
    time: '10:00',
    duration: 60,
    roomId: 4,
    presidentId: 7,
    memberIds: [2, 5],
  },
]