import { http } from "./http";
import type { AppNotification } from "../types/notification";

// Le back renvoie déjà le format AppNotification (type en minuscules, lien dans `to`)
// Chaque utilisateur ne reçoit que ses propres notifications (token JWT)

export async function fetchMyNotifications(): Promise<AppNotification[]> {
  const { data } = await http.get<AppNotification[]>("api/notifications/me");
  return data;
}

export async function markNotificationAsRead(id: number): Promise<void> {
  await http.patch(`api/notifications/${id}/read`);
}

export async function markAllNotificationsAsRead(): Promise<void> {
  await http.patch("api/notifications/read-all");
}

export async function deleteNotification(id: number): Promise<void> {
  await http.delete(`api/notifications/${id}`);
}
