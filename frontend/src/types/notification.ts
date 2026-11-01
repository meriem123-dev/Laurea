export type NotificationType = 'defense' | 'project' | 'result' | 'jury' | 'system'

export interface AppNotification {
  id: number
  type: NotificationType
  title: string
  message: string
  createdAt: string // date ISO complète
  read: boolean
  to?: string // page ouverte au clic
}