import type { UserRole } from '../types/auth'

// Identifiants de démonstration (prototype uniquement, à supprimer avec le vrai backend)
export const demoEmails: Record<UserRole, string> = {
  ADMIN_STAFF: 'admin@univ-demo.fr',
  TEACHER: 'professeur@univ-demo.fr',
  STUDENT: 'etudiant@univ-demo.fr',
}