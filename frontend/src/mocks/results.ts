import type { DefenseResult } from '../types/result'

// Données fictives : à remplacer par les appels API.
// studentId et professorId renvoient à mocks/students.ts et mocks/professors.ts.
export const results: DefenseResult[] = [
  {
    id: 1,
    studentId: 1,
    expectedGrades: 3,
    grades: [
      { professorId: 5, value: 16.5 },
      { professorId: 6, value: 16 },
      { professorId: 7, value: 16.7 },
    ],
    published: true,
  },
  {
    id: 2,
    studentId: 2,
    expectedGrades: 3,
    grades: [
      { professorId: 1, value: 15 },
      { professorId: 5, value: 14.5 },
      { professorId: 8, value: 14.9 },
    ],
    published: false,
  },
  {
    id: 3,
    studentId: 3,
    expectedGrades: 3,
    grades: [
      { professorId: 5, value: 15 },
      { professorId: 6, value: 16.5 },
    ],
    published: false,
  },
  {
    id: 4,
    studentId: 4,
    expectedGrades: 3,
    grades: [
      { professorId: 2, value: 13 },
      { professorId: 3, value: 14 },
    ],
    published: false,
  },
]