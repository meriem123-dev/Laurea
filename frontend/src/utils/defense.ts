import type { Defense } from '../types/defense'
import type { Professor } from '../types/professor'
import type { Room, RoomTone } from '../types/room'
import type { BadgeTone } from '../types/ui'
import { formatDayMonth } from './format'
import { displayName } from './professor'

export const DAY_START = 8 // heure de début de la grille
export const DAY_END = 17 // heure de fin de la grille
export const DEFAULT_DURATION = 60 // minutes
// TODO : le nombre de membres peut varier selon le cursus (Master / Ingénieur) et les règles de l'établissement
export const JURY_MEMBER_COUNT = 3

export interface Slot {
  date: string
  start: number // minutes depuis minuit
  end: number
}

export function toMinutes(time: string): number {
  const [hours = 0, minutes = 0] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return `${String(hours).padStart(2, '0')}:${String(rest).padStart(2, '0')}`
}

export function defenseSlot(defense: Defense): Slot {
  const start = toMinutes(defense.time)
  return { date: defense.date, start, end: start + defense.duration }
}

export function slotOverlaps(a: Slot, b: Slot): boolean {
  return a.date === b.date && a.start < b.end && b.start < a.end
}

export function juryIdsOf(defense: Defense): string[] {
  return [defense.presidentId, ...defense.memberIds]
}

export function juryState(defense: Defense): { label: string; tone: BadgeTone } {
  return defense.memberIds.length >= JURY_MEMBER_COUNT
    ? { label: 'Jury confirmé', tone: 'success' }
    : { label: 'Jury incomplet', tone: 'warning' }
}

/** « Salle A12 » -> « A12 » */
export function shortRoomName(name: string): string {
  return name.replace(/^salle\s+/i, '')
}

export const ROOM_TONES: Record<RoomTone, { box: string; text: string; dot: string }> = {
  blue: { box: 'border-primary-600 bg-primary-50', text: 'text-primary-600', dot: 'bg-primary-600' },
  violet: { box: 'border-violet bg-violet-soft', text: 'text-violet-dark', dot: 'bg-violet' },
  orange: { box: 'border-warning bg-warning-soft', text: 'text-warning-dark', dot: 'bg-warning' },
  green: { box: 'border-success bg-success-soft', text: 'text-success-dark', dot: 'bg-success' },
}

// Conflits : même salle, ou même professeur, sur des créneaux qui se chevauchent
export interface Conflict {
  kind: 'room' | 'professor'
  ids: [number, number] // les deux soutenances concernées
  subjectId: number | string  // identifiant de la salle ou du professeur
}

export function findConflicts(defenses: Defense[]): Conflict[] {
  const conflicts: Conflict[] = []

  for (let i = 0; i < defenses.length; i++) {
    for (let j = i + 1; j < defenses.length; j++) {
      const a = defenses[i]
      const b = defenses[j]
      if (!a || !b || !slotOverlaps(defenseSlot(a), defenseSlot(b))) continue

      if (a.roomId === b.roomId) {
        conflicts.push({ kind: 'room', ids: [a.id, b.id], subjectId: a.roomId })
      }
      const bJury = juryIdsOf(b)
      for (const professorId of juryIdsOf(a)) {
        if (bJury.includes(professorId)) {
          conflicts.push({ kind: 'professor', ids: [a.id, b.id], subjectId: professorId })
        }
      }
    }
  }
  return conflicts
}

export function describeConflict(
  conflict: Conflict,
  rooms: Room[],
  professors: Professor[],
  defenses: Defense[],
): string {
  const first = defenses.find((defense) => defense.id === conflict.ids[0])
  const when = first ? `le ${formatDayMonth(first.date)} à ${first.time}` : 'sur ce créneau'

  if (conflict.kind === 'room') {
    const room = rooms.find((item) => item.id === conflict.subjectId)
    return `${room?.name ?? 'Une salle'} est réservée deux fois ${when}.`
  }
  const professor = professors.find((item) => item.id === conflict.subjectId)
  return `${professor ? displayName(professor) : 'Un membre du jury'} est affecté à deux jurys ${when}.`
}