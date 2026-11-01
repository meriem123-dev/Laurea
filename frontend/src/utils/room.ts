import type { Defense } from '../types/defense'
import type { Room } from '../types/room'
import type { BadgeTone } from '../types/ui'

/** « Bâtiment Sciences », « Pôle Numérique » ou les deux séparés par « · » */
export function roomLocation(room: Pick<Room, 'block' | 'pole'>): string {
  return [room.block, room.pole].filter(Boolean).join(' · ')
}

export function capacityLabel(capacity: number): string {
  return `${capacity} ${capacity > 1 ? 'places' : 'place'}`
}

/** « Bâtiment Sciences · 24 places » */
export function roomSubtitle(room: Room): string {
  return [roomLocation(room), capacityLabel(room.capacity)].filter(Boolean).join(' · ')
}

export function roomBookings(room: Room, defenses: Defense[], date: string): Defense[] {
  return defenses
    .filter((defense) => defense.roomId === room.id && defense.date === date)
    .sort((a, b) => a.time.localeCompare(b.time))
}

/** Disponible, ou « Occupée à HH:MM » (première soutenance de la journée dans cette salle) */
export function roomAvailability(
  room: Room,
  defenses: Defense[],
  date: string,
): { label: string; tone: BadgeTone } {
  const first = roomBookings(room, defenses, date)[0]
  return first
    ? { label: `Occupée à ${first.time}`, tone: 'danger' }
    : { label: 'Disponible', tone: 'success' }
}