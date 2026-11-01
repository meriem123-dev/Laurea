import { computed, ref } from 'vue'
import { notifications as notificationsMock } from '../mocks/notifications'
import type { AppNotification } from '../types/notification'
import { useSettings } from './useSettings'

// État partagé au niveau du module : la cloche, la page et la barre latérale voient les mêmes données.
// TODO backend : remplacer par un store Pinia branché sur l'API (avec états chargement / erreur).
const all = ref<AppNotification[]>(notificationsMock.map((item) => ({ ...item })))

export function useNotifications() {
  const { settings } = useSettings()

  // Les catégories désactivées dans les paramètres sont masquées
  const notifications = computed(() =>
    all.value
      .filter((item) => settings.notifyTypes[item.type])
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  )

  const unreadCount = computed(() => notifications.value.filter((item) => !item.read).length)

  function markAsRead(id: number) {
    all.value = all.value.map((item) => (item.id === id ? { ...item, read: true } : item))
  }

  function markAllAsRead() {
    all.value = all.value.map((item) => ({ ...item, read: true }))
  }

  function remove(id: number) {
    all.value = all.value.filter((item) => item.id !== id)
  }

  return { notifications, unreadCount, markAsRead, markAllAsRead, remove }
}