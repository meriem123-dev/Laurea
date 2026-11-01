<script setup lang="ts">
import { computed } from 'vue'
import type { DefenseView } from '../../composables/useDefensesData'
import { formatDayNumber, formatWeekdayShort } from '../../utils/calendar'
import { ROOM_TONES, shortRoomName } from '../../utils/defense'

const MAX_VISIBLE = 2

const props = defineProps<{
  weeks: string[][]
  month: string // n'importe quelle date du mois affiché
  items: DefenseView[]
  today: string
}>()

const emit = defineEmits<{
  select: [view: DefenseView]
  'select-day': [date: string]
}>()

const header = computed(() => (props.weeks[0] ?? []).map((day) => formatWeekdayShort(day)))

const byDate = computed(() => {
  const map = new Map<string, DefenseView[]>()
  for (const view of props.items) {
    const list = map.get(view.defense.date) ?? []
    list.push(view)
    map.set(view.defense.date, list)
  }
  return map
})

function eventsOf(day: string): DefenseView[] {
  return byDate.value.get(day) ?? []
}

function inMonth(day: string): boolean {
  return day.slice(0, 7) === props.month.slice(0, 7)
}
</script>

<template>
  <div class="overflow-x-auto">
    <div class="min-w-[34rem]">
      <div class="grid grid-cols-5 border-b border-border">
        <p
          v-for="label in header"
          :key="label"
          class="py-3 text-center text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-text-muted"
        >
          {{ label }}
        </p>
      </div>

      <div
        v-for="(week, index) in weeks"
        :key="index"
        class="grid grid-cols-5 divide-x divide-border border-t border-border first:border-t-0"
      >
        <div
          v-for="day in week"
          :key="day"
          class="min-h-28 min-w-0 p-2"
          :class="inMonth(day) ? '' : 'bg-surface/60'"
        >
          <p
            class="mb-1.5 flex h-6 min-w-6 items-center justify-center self-start rounded-full px-1 text-xs font-semibold tabular-nums"
            :class="
              day === today
                ? 'w-fit bg-ink text-on-ink'
                : inMonth(day)
                  ? 'w-fit text-ink'
                  : 'w-fit text-text-muted'
            "
          >
            {{ formatDayNumber(day) }}
          </p>

          <ul class="space-y-1">
            <li v-for="view in eventsOf(day).slice(0, MAX_VISIBLE)" :key="view.defense.id">
              <button
                type="button"
                class="block w-full truncate rounded border-l-2 px-1.5 py-1 text-left text-[0.6875rem] font-semibold text-ink transition hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/40"
                :class="ROOM_TONES[view.room?.tone ?? 'blue'].box"
                @click="emit('select', view)"
              >
                <span class="tabular-nums" :class="ROOM_TONES[view.room?.tone ?? 'blue'].text">
                  {{ view.defense.time }}
                </span>
                <span v-if="view.room" class="text-text-secondary">
                  {{ shortRoomName(view.room.name) }}
                </span>
                · {{ view.studentNames }}
              </button>
            </li>
          </ul>

          <button
            v-if="eventsOf(day).length > MAX_VISIBLE"
            type="button"
            class="mt-1 rounded px-1 text-[0.6875rem] font-semibold text-text-secondary underline underline-offset-2 hover:text-ink"
            @click="emit('select-day', day)"
          >
            +{{ eventsOf(day).length - MAX_VISIBLE }} autre(s)
          </button>
        </div>
      </div>
    </div>
  </div>
</template>