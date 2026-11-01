<script setup lang="ts">
import { computed } from 'vue'
import type { DefenseView } from '../../composables/useDefensesData'
import { formatDayNumber, formatWeekdayShort, layoutEvents } from '../../utils/calendar'
import {
  DAY_END,
  DAY_START,
  ROOM_TONES,
  defenseSlot,
  shortRoomName,
} from '../../utils/defense'

const props = defineProps<{
  days: string[] // 1 jour (vue Jour) ou 5 jours (vue Semaine)
  items: DefenseView[]
  today: string
}>()

const emit = defineEmits<{
  select: [view: DefenseView]
}>()

const HOUR_HEIGHT = 4 // rem par heure

const hours = Array.from({ length: DAY_END - DAY_START }, (_, index) => DAY_START + index)
const gridHeight = `${(DAY_END - DAY_START) * HOUR_HEIGHT}rem`
const columnsStyle = computed(() => ({
  gridTemplateColumns: `3.5rem repeat(${props.days.length}, minmax(0, 1fr))`,
}))

const columns = computed(() =>
  props.days.map((day) => {
    const events = props.items
      .filter((view) => view.defense.date === day)
      .map((view) => ({ view, ...defenseSlot(view.defense) }))
    return { day, events: layoutEvents(events) }
  }),
)

function eventStyle(event: { item: { start: number; end: number }; lane: number; lanes: number }) {
  const top = ((event.item.start - DAY_START * 60) / 60) * HOUR_HEIGHT
  const height = ((event.item.end - event.item.start) / 60) * HOUR_HEIGHT
  return {
    top: `${top}rem`,
    height: `${height}rem`,
    left: `calc(${(event.lane / event.lanes) * 100}% + 0.125rem)`,
    width: `calc(${100 / event.lanes}% - 0.25rem)`,
  }
}
</script>

<template>
  <div class="overflow-x-auto">
    <div :class="days.length > 1 ? 'min-w-[34rem]' : ''">
      <div class="grid border-b border-border" :style="columnsStyle">
        <div class="flex items-end justify-center pb-3 text-[0.625rem] font-bold uppercase tracking-[0.14em] text-text-muted">
          Heure
        </div>
        <div
          v-for="day in days"
          :key="day"
          class="flex flex-col items-center gap-1 border-l border-border py-3"
        >
          <p class="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-text-muted">
            {{ formatWeekdayShort(day) }}
          </p>
          <p
            class="flex h-8 min-w-8 items-center justify-center rounded-full px-1 font-display text-xl leading-none"
            :class="day === today ? 'bg-ink text-on-ink' : 'text-ink'"
          >
            {{ formatDayNumber(day) }}
          </p>
        </div>
      </div>

      <div class="grid" :style="columnsStyle">
        <div class="relative" :style="{ height: gridHeight }" aria-hidden="true">
          <span
            v-for="(hour, index) in hours"
            :key="hour"
            class="absolute right-2 translate-y-1 text-[0.625rem] tabular-nums text-text-muted"
            :style="{ top: `${index * HOUR_HEIGHT}rem` }"
          >
            {{ String(hour).padStart(2, '0') }}:00
          </span>
        </div>

        <div
          v-for="column in columns"
          :key="column.day"
          class="relative border-l border-border"
          :style="{ height: gridHeight }"
        >
          <span
            v-for="(hour, index) in hours"
            :key="hour"
            class="pointer-events-none absolute inset-x-0 border-t border-border/60"
            :style="{ top: `${index * HOUR_HEIGHT}rem` }"
            aria-hidden="true"
          />

          <button
            v-for="event in column.events"
            :key="event.item.view.defense.id"
            type="button"
            class="absolute overflow-hidden rounded-md border-l-[3px] px-2 py-1.5 text-left transition hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/40"
            :class="ROOM_TONES[event.item.view.room?.tone ?? 'blue'].box"
            :style="eventStyle(event)"
            :aria-label="`Soutenance de ${event.item.view.studentNames}, ${event.item.view.defense.time}`"
            @click="emit('select', event.item.view)"
          >
            <p
              class="truncate text-[0.6875rem] font-bold tabular-nums"
              :class="ROOM_TONES[event.item.view.room?.tone ?? 'blue'].text"
            >
              {{ event.item.view.defense.time }}
              <span v-if="event.item.view.room"> · {{ shortRoomName(event.item.view.room.name) }}</span>
            </p>
            <p class="mt-0.5 truncate text-xs font-semibold text-ink">
              {{ event.item.view.studentNames }}
            </p>
            <p class="truncate text-[0.6875rem] text-text-secondary">
              {{ event.item.view.project?.domain }}
            </p>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>