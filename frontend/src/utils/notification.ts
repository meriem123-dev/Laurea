import type { Component } from 'vue'
import { Award, BookOpen, CalendarDays, Info, Users } from '@lucide/vue'
import type { NotificationType } from '../types/notification'
import type { IconTone } from '../types/ui'

export const NOTIFICATION_META: Record<
  NotificationType,
  { label: string; icon: Component; tone: IconTone }
> = {
  defense: { label: 'Soutenances', icon: CalendarDays, tone: 'blue' },
  project: { label: 'Projets', icon: BookOpen, tone: 'violet' },
  jury: { label: 'Jurys', icon: Users, tone: 'orange' },
  result: { label: 'Résultats', icon: Award, tone: 'teal' },
  system: { label: 'Système', icon: Info, tone: 'blue' },
}

const relativeFormat = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' })
const dateFormat = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' })

/** « à l’instant », « il y a 12 minutes », « hier », « 3 juin » */
export function formatRelative(iso: string, now = Date.now()): string {
  const diff = (new Date(iso).getTime() - now) / 1000
  const abs = Math.abs(diff)

  if (abs < 60) return 'à l’instant'
  if (abs < 3600) return relativeFormat.format(Math.round(diff / 60), 'minute')
  if (abs < 86_400) return relativeFormat.format(Math.round(diff / 3600), 'hour')
  if (abs < 86_400 * 7) return relativeFormat.format(Math.round(diff / 86_400), 'day')
  return dateFormat.format(new Date(iso))
}