import { reactive } from 'vue'
import { rooms as roomsMock } from '../mocks/rooms'
import type { Room, RoomFormData, RoomTone } from '../types/room'

// Tableau réactif partagé au niveau du module : toutes les pages voient les mêmes salles.
// On le modifie « sur place » (push, splice) pour que les anciens lecteurs restent à jour.
// TODO backend : remplacer par un store Pinia branché sur l'API.
export const rooms = reactive<Room[]>(roomsMock.map((room) => ({ ...room })))

const TONE_CYCLE: RoomTone[] = ['blue', 'violet', 'green', 'orange']

export function useRoomsData() {
  function addRoom(data: RoomFormData): Room {
    const id = Math.max(0, ...rooms.map((room) => room.id)) + 1
    // Couleur attribuée en alternance pour distinguer les salles dans le calendrier
    const tone = TONE_CYCLE[rooms.length % TONE_CYCLE.length] ?? 'blue'
    const created: Room = { id, tone, ...data }
    rooms.push(created)
    return created
  }

  function updateRoom(id: number, data: RoomFormData) {
    const room = rooms.find((item) => item.id === id)
    if (room) Object.assign(room, data)
  }

  function removeRoom(id: number) {
    const index = rooms.findIndex((room) => room.id === id)
    if (index >= 0) rooms.splice(index, 1)
  }

  return { rooms, addRoom, updateRoom, removeRoom }
}