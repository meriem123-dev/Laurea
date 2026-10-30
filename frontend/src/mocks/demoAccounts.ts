import type { UserRole } from '../types/auth'

// Identifiants de démonstration (prototype uniquement, à supprimer avec le vrai backend)
export const demoEmails: Record<UserRole, string> = {
  admin: 'admin@univ-demo.fr',
  professor: 'professeur@univ-demo.fr',
  student: 'etudiant@univ-demo.fr',
}