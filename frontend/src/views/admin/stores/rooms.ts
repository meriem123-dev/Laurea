import { defineStore } from "pinia";
import { ref } from "vue";
import {
  createRoom,
  deleteRoom,
  fetchRooms,
  updateRoom,
} from "../api/rooms.api";
import { getErrorMessage } from "../../../utils/apiError";
import type { Room, RoomFormData } from "../../../types/room";

export const useRoomsStore = defineStore("rooms", () => {
  const items = ref<Room[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchAll() {
    loading.value = true;
    error.value = null;
    try {
      items.value = await fetchRooms();
    } catch (e) {
      error.value = getErrorMessage(e, "Impossible de charger les salles.");
    } finally {
      loading.value = false;
    }
  }

  // create / update / remove (laissent remonter l'erreur)

  async function create(data: RoomFormData) {
    const room = await createRoom(data);
    items.value.push(room);
    return room;
  }

  async function update(id: string, data: RoomFormData) {
    const room = await updateRoom(id, data);
    const index = items.value.findIndex((item) => item.id === id);
    if (index !== -1) items.value[index] = room;
    return room;
  }

  async function remove(id: string) {
    await deleteRoom(id);
    items.value = items.value.filter((item) => item.id !== id);
  }

  return { items, loading, error, fetchAll, create, update, remove };
});