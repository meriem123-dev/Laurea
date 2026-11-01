const MS_DAY = 86_400_000

// Toutes les dates sont des chaînes ISO « AAAA-MM-JJ », calculées en UTC pour éviter
// les décalages liés au fuseau horaire.

export function parseISO(iso: string): Date {
  const [year = 1970, month = 1, day = 1] = iso.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

export function toISO(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function todayISO(): string {
  const now = new Date()
  return toISO(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())))
}

export function addDays(iso: string, days: number): string {
  return toISO(new Date(parseISO(iso).getTime() + days * MS_DAY))
}

export function addMonths(iso: string, months: number): string {
  const date = parseISO(iso)
  const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1))
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate()
  target.setUTCDate(Math.min(date.getUTCDate(), lastDay))
  return toISO(target)
}

/** Lundi de la semaine contenant la date */
export function startOfWeek(iso: string): string {
  const dayOfWeek = (parseISO(iso).getUTCDay() + 6) % 7 // lundi = 0
  return addDays(iso, -dayOfWeek)
}

// Jours ouvrés affichés par le calendrier : dimanche à jeudi.
export const WEEK_DAYS = 5

export function isWeekend(iso: string): boolean {
  const day = parseISO(iso).getUTCDay()
  return day === 5 || day === 6
}

export function nearestWeekday(iso: string): string {
  let current = iso
  while (isWeekend(current)) current = addDays(current, 1)
  return current
}

export function weekDays(iso: string, count = WEEK_DAYS): string[] {
  const start = startOfWeek(iso)
  return Array.from({ length: count }, (_, index) =>
    addDays(start, (index + 6) % 7),
  )
}

export function monthBounds(iso: string): { from: string; to: string } {
  const date = parseISO(iso)
  const from = toISO(new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)))
  const to = toISO(new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)))
  return { from, to }
}

/** Semaines (lundi à vendredi) couvrant le mois de la date donnée */
export function monthWeeks(iso: string): string[][] {
  const { from, to } = monthBounds(iso)
  const monthKey = from.slice(0, 7)
  const weeks: string[][] = []
  let cursor = startOfWeek(from)

  while (cursor <= to) {
    weeks.push(weekDays(cursor))
    cursor = addDays(cursor, 7)
  }
  // Écarte les semaines dont aucun jour ouvré n'appartient au mois
  return weeks.filter((week) => week.some((day) => day.slice(0, 7) === monthKey))
}

/** Date d'ouverture du calendrier : prochaine soutenance, sinon la dernière, sinon aujourd'hui */
export function initialCursor(dates: string[], today = todayISO()): string {
  const sorted = [...dates].sort()
  return sorted.find((date) => date >= today) ?? sorted[sorted.length - 1] ?? today
}

// Formats en français
const make = (options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('fr-FR', { ...options, timeZone: 'UTC' })

const weekdayShortFormat = make({ weekday: 'short' })
const longDayFormat = make({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
const monthYearFormat = make({ month: 'long', year: 'numeric' })
const dayFormat = make({ day: 'numeric' })
const monthFormat = make({ month: 'long' })

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)

/** '2025-06-16' -> 'Lun' */
export function formatWeekdayShort(iso: string): string {
  return capitalize(weekdayShortFormat.format(parseISO(iso)).replace('.', ''))
}

/** '2025-06-16' -> '16' */
export function formatDayNumber(iso: string): string {
  return dayFormat.format(parseISO(iso))
}

/** '2025-06-18' -> 'Mercredi 18 juin 2025' */
export function formatLongDay(iso: string): string {
  return capitalize(longDayFormat.format(parseISO(iso)))
}

/** '2025-06-18' -> 'Juin 2025' */
export function formatMonthYear(iso: string): string {
  return capitalize(monthYearFormat.format(parseISO(iso)))
}

/** ('2025-06-16', '2025-06-22') -> '16 – 22 juin 2025' */
export function formatRange(from: string, to: string): string {
  const start = parseISO(from)
  const end = parseISO(to)
  const sameMonth =
    start.getUTCMonth() === end.getUTCMonth() && start.getUTCFullYear() === end.getUTCFullYear()
  const year = end.getUTCFullYear()

  return sameMonth
    ? `${dayFormat.format(start)} – ${dayFormat.format(end)} ${monthFormat.format(end)} ${year}`
    : `${dayFormat.format(start)} ${monthFormat.format(start)} – ${dayFormat.format(end)} ${monthFormat.format(end)} ${year}`
}

// Répartition des événements qui se chevauchent en colonnes côte à côte
export interface PositionedEvent<T> {
  item: T
  lane: number
  lanes: number
}

export function layoutEvents<T extends { start: number; end: number }>(
  items: T[],
): PositionedEvent<T>[] {
  const sorted = [...items].sort((a, b) => a.start - b.start || a.end - b.end)
  const result: PositionedEvent<T>[] = []
  let cluster: PositionedEvent<T>[] = []
  let clusterEnd = 0

  const flush = () => {
    const lanes = cluster.reduce((max, entry) => Math.max(max, entry.lane + 1), 1)
    for (const entry of cluster) result.push({ ...entry, lanes })
    cluster = []
  }

  for (const item of sorted) {
    if (cluster.length > 0 && item.start >= clusterEnd) flush()

    const used = new Set(cluster.filter((entry) => entry.item.end > item.start).map((e) => e.lane))
    let lane = 0
    while (used.has(lane)) lane++

    cluster.push({ item, lane, lanes: 1 })
    clusterEnd = cluster.length === 1 ? item.end : Math.max(clusterEnd, item.end)
  }
  flush()

  return result
}