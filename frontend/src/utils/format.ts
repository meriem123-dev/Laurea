const dayFormatter = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', timeZone: 'UTC' })
const monthFormatter = new Intl.DateTimeFormat('fr-FR', { month: 'short', timeZone: 'UTC' })
const longDateFormatter = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

/** '2025-06-18' -> '18' */
export function formatDay(iso: string): string {
  return dayFormatter.format(new Date(iso))
}

/** '2025-06-18' -> 'JUIN' */
export function formatMonthShort(iso: string): string {
  return monthFormatter.format(new Date(iso)).replace('.', '').toUpperCase()
}

/** Date du jour -> 'samedi 31 octobre 2026' */
export function formatLongDate(date: Date): string {
  return longDateFormatter.format(date)
}

/** Pourcentages entiers dont la somme fait toujours 100 (méthode du plus fort reste). */
export function toPercentages(values: number[]): number[] {
  const total = values.reduce((sum, value) => sum + value, 0)
  if (total === 0) return values.map(() => 0)

  const raw = values.map((value) => (value / total) * 100)
  const floors = raw.map((value) => Math.floor(value))
  const remaining = 100 - floors.reduce((sum, value) => sum + value, 0)

  const winners = new Set(
    raw
      .map((value, index) => ({ index, rest: value - Math.floor(value) }))
      .sort((a, b) => b.rest - a.rest)
      .slice(0, remaining)
      .map((entry) => entry.index),
  )

  return floors.map((value, index) => value + (winners.has(index) ? 1 : 0))
}
const dayMonthFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
})

/** '2025-06-30' -> '30 juin' */
export function formatDayMonth(iso: string): string {
  return dayMonthFormatter.format(new Date(iso))
}