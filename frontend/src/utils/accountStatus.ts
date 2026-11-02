import type { AccountStatus } from '../types/student'

export const ACCOUNT_STATUS_META: Record<
  AccountStatus,
  { label: string; tone: 'success' | 'warning' | 'danger' }
> = {
  ACTIVE: { label: 'Actif', tone: 'success' },
  PENDING: { label: 'Invitation en attente', tone: 'warning' },
  DISABLED: { label: 'Désactivé', tone: 'danger' },
}