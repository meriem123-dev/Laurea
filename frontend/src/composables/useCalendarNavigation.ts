import { computed, ref } from 'vue'
import {
  addDays,
  addMonths,
  formatLongDay,
  formatMonthYear,
  formatRange,
  isWeekend,
  monthBounds,
  monthWeeks,
  nearestWeekday,
  startOfWeek,
  todayISO,
  weekDays,
} from '../utils/calendar'

export type CalendarView = 'day' | 'week' | 'month' | 'list'

export const VIEW_OPTIONS: { value: CalendarView; label: string }[] = [
  { value: 'day', label: 'Jour' },
  { value: 'week', label: 'Semaine' },
  { value: 'month', label: 'Mois' },
  { value: 'list', label: 'Liste' },
]

export function useCalendarNavigation(initialDate: string) {
  const view = ref<CalendarView>('week')
  const cursor = ref(initialDate)

  // Jours affichés dans la grille horaire (vues Jour et Semaine)
  const days = computed(() =>
    view.value === 'day' ? [nearestWeekday(cursor.value)] : weekDays(cursor.value),
  )

  const weeks = computed(() => monthWeeks(cursor.value))

  // Période couverte par la vue courante (pour filtrer les soutenances et détecter les conflits)
  const range = computed(() => {
    if (view.value === 'day') {
      const day = nearestWeekday(cursor.value)
      return { from: day, to: day }
    }
    if (view.value === 'week') {
      const start = startOfWeek(cursor.value)
      return { from: start, to: addDays(start, 6) }
    }
    return monthBounds(cursor.value)
  })

  const rangeLabel = computed(() => {
    if (view.value === 'day') return formatLongDay(days.value[0] ?? cursor.value)
    if (view.value === 'week') return formatRange(range.value.from, range.value.to)
    return formatMonthYear(cursor.value)
  })

  function shift(direction: 1 | -1) {
    if (view.value === 'day') {
      let next = addDays(cursor.value, direction)
      while (isWeekend(next)) next = addDays(next, direction)
      cursor.value = next
    } else if (view.value === 'week') {
      cursor.value = addDays(cursor.value, 7 * direction)
    } else {
      cursor.value = addMonths(cursor.value, direction)
    }
  }

  function goToday() {
    cursor.value = todayISO()
  }

  function goTo(date: string) {
    cursor.value = date
  }

  return { view, cursor, days, weeks, range, rangeLabel, shift, goToday, goTo }
}