import { computed, ref, toValue, type MaybeRefOrGetter, type Ref } from 'vue'
import { notificationsByRole } from '../mocks/notifications'
import type { UserRole } from '../types/auth'
import type { AppNotification } from '../types/notification'
import { useSettings } from './useSettings'

// État partagé au niveau du module, un jeu de notifications par rôle : la cloche, la page et la
// barre latérale d'un même espace voient les mêmes données.
// TODO backend : remplacer par un store Pinia branché sur l'API (avec états chargement / erreur).
const stores: Record<UserRole, Ref<AppNotification[]>> = {
  ADMIN_STAFF: ref(notificationsByRole.ADMIN_STAFF.map((item) => ({ ...item }))),
  TEACHER: ref(notificationsByRole.TEACHER.map((item) => ({ ...item }))),
  STUDENT: ref(notificationsByRole.STUDENT.map((item) => ({ ...item }))),
}

// `role` peut être une valeur, une ref ou un getter (le layout est réutilisé d'un espace à l'autre)
export function useNotifications(role: MaybeRefOrGetter<UserRole>) {
  const { settings } = useSettings()

  const store = () => stores[toValue(role)]

  // Les catégories désactivées dans les paramètres sont masquées
  const notifications = computed(() =>
    store()
      .value.filter((item) => settings.notifyTypes[item.type])
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  )

  const unreadCount = computed(() => notifications.value.filter((item) => !item.read).length)

  function markAsRead(id: number) {
    store().value = store().value.map((item) => (item.id === id ? { ...item, read: true } : item))
  }

  function markAllAsRead() {
    store().value = store().value.map((item) => ({ ...item, read: true }))
  }

  function remove(id: number) {
    store().value = store().value.filter((item) => item.id !== id)
  }

  return { notifications, unreadCount, markAsRead, markAllAsRead, remove }
}