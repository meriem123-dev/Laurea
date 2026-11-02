import { parseISO } from './calendar'

const weekdayDayMonth = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
})
const fullDate = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

/** '2025-06-18' -> 'Mercredi 18 juin' */
export function formatWeekdayDayMonth(iso: string): string {
  const value = weekdayDayMonth.format(parseISO(iso))
  return value.charAt(0).toUpperCase() + value.slice(1)
}

/** '2025-05-28' -> '28 mai 2025' */
export function formatFullDate(iso: string): string {
  return fullDate.format(parseISO(iso))
}