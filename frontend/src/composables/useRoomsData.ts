import { reactive, ref } from 'vue'
import {
  createRoom,
  deleteRoom,
  fetchRooms,
  updateRoom as apiUpdateRoom,
} from '../views/admin/api/rooms.api'
import type { Room, RoomFormData, RoomTone } from '../types/room'

// Tableau réactif partagé (utilisé aussi par useDefensesData), modifié « sur place »
export const rooms = reactive<Room[]>([])

const loading = ref(false)
const error = ref('')

const TONE_CYCLE: RoomTone[] = ['blue', 'violet', 'green', 'orange']

export function useRoomsData() {
  async function loadRooms() {
    loading.value = true
    error.value = ''
    try {
      const list = await fetchRooms()
      rooms.splice(0, rooms.length, ...list)
    } catch {
      error.value = 'Impossible de charger les salles.'
    } finally {
      loading.value = false
    }
  }

  // Ces fonctions laissent remonter l'erreur : c'est la vue qui l'affiche
  async function addRoom(data: RoomFormData): Promise<Room> {
    const tone = TONE_CYCLE[rooms.length % TONE_CYCLE.length] ?? 'blue'
    const created = await createRoom({ ...data, tone })
    rooms.push(created)
    return created
  }

  async function updateRoom(id: string, data: RoomFormData) {
    const updated = await apiUpdateRoom(id, data)
    const index = rooms.findIndex((room) => room.id === id)
    if (index >= 0) rooms[index] = updated
  }

  async function removeRoom(id: string) {
    await deleteRoom(id)
    const index = rooms.findIndex((room) => room.id === id)
    if (index >= 0) rooms.splice(index, 1)
  }

  return { rooms, loading, error, loadRooms, addRoom, updateRoom, removeRoom }
}