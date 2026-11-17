import type { AccountStatus } from './student'

export type AdminType = 'DEPARTMENT_HEAD' | 'ADMINISTRATION'

export interface Admin {
  id: string
  firstName: string
  lastName: string
  email: string
  adminType: AdminType | null
  accountStatus: AccountStatus
  isSystemAdmin: boolean
  createdAt: string // ISO
}

// Données envoyées au back (pas de mot de passe : lien d'activation par e-mail)
export interface AdminPayload {
  firstName: string
  lastName: string
  email: string
  adminType: AdminType
}