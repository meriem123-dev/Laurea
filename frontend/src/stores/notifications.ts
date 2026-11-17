import { defineStore } from "pinia";
import { ref } from "vue";
import * as api from "../api/notifications.api";
import { getErrorMessage } from "../utils/apiError";
import type { AppNotification } from "../types/notification";

// la cloche se met à jour toute seule (pas besoin de recharger la page)
const REFRESH_EVERY_MS = 60_000;

export const useNotificationsStore = defineStore("notifications", () => {
  const items = ref<AppNotification[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  let timer: number | undefined;
  let lastToken: string | null = null;

  // silent : rafraîchissement automatique, sans état de chargement
  async function fetchAll(silent = false) {
    const token = localStorage.getItem("token");
    // autre compte (déconnexion / reconnexion) : on repart de zéro
    if (token !== lastToken) {
      items.value = [];
      lastToken = token;
    }
    if (!token) return; // pas connecté : rien à charger

    if (!silent) loading.value = true;
    error.value = null;
    try {
      items.value = await api.fetchMyNotifications();
    } catch (e) {
      error.value = getErrorMessage(
        e,
        "Impossible de charger les notifications.",
      );
    } finally {
      loading.value = false;
    }
  }

  // lancé une seule fois, au premier affichage de la cloche
  function startAutoRefresh() {
    if (timer !== undefined) {
      // déjà lancé, mais un autre compte s'est connecté : on recharge tout de suite
      if (localStorage.getItem("token") !== lastToken) void fetchAll();
      return;
    }
    void fetchAll();
    timer = window.setInterval(() => void fetchAll(true), REFRESH_EVERY_MS);
    // retour sur l'onglet : on rafraîchit tout de suite
    window.addEventListener("focus", () => void fetchAll(true));
  }

  // Les actions modifient l'affichage tout de suite, puis l'API ;
  // en cas d'erreur, on recharge la liste depuis le back
  async function markAsRead(id: number) {
    const item = items.value.find((n) => n.id === id);
    if (!item || item.read) return;
    items.value = items.value.map((n) =>
      n.id === id ? { ...n, read: true } : n,
    );
    try {
      await api.markNotificationAsRead(id);
    } catch {
      await fetchAll(true);
    }
  }

  async function markAllAsRead() {
    items.value = items.value.map((n) => ({ ...n, read: true }));
    try {
      await api.markAllNotificationsAsRead();
    } catch {
      await fetchAll(true);
    }
  }

  async function remove(id: number) {
    items.value = items.value.filter((n) => n.id !== id);
    try {
      await api.deleteNotification(id);
    } catch {
      await fetchAll(true);
    }
  }

  return {
    items,
    loading,
    error,
    fetchAll,
    startAutoRefresh,
    markAsRead,
    markAllAsRead,
    remove,
  };
});
