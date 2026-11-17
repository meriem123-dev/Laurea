import { computed, type MaybeRefOrGetter } from "vue";
import { storeToRefs } from "pinia";
import { useNotificationsStore } from "../stores/notifications";
import type { UserRole } from "../types/auth";
import { useSettings } from "./useSettings";

// Notifications de l'utilisateur connecté, chargées depuis le back (store Pinia partagé) :
// la cloche, la page et la barre latérale voient les mêmes données.
// `role` est gardé pour ne pas changer les composants qui appellent useNotifications
// (le back sait déjà qui est connecté grâce au token).
export function useNotifications(_role?: MaybeRefOrGetter<UserRole>) {
  const { settings } = useSettings();
  const store = useNotificationsStore();
  const { items, loading, error } = storeToRefs(store);

  store.startAutoRefresh();

  // Les catégories désactivées dans les paramètres sont masquées
  const notifications = computed(() =>
    items.value
      .filter((item) => settings.notifyTypes[item.type])
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  );

  const unreadCount = computed(
    () => notifications.value.filter((item) => !item.read).length,
  );

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refresh: () => store.fetchAll(),
    markAsRead: store.markAsRead,
    markAllAsRead: store.markAllAsRead,
    remove: store.remove,
  };
}
