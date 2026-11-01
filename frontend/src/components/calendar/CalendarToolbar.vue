<script setup lang="ts">
import { CalendarDays, ChevronLeft, ChevronRight } from '@lucide/vue'
import BaseButton from '../common/BaseButton.vue'
import SegmentedControl from '../common/SegmentedControl.vue'
import { VIEW_OPTIONS, type CalendarView } from '../../composables/useCalendarNavigation'

defineProps<{
  view: CalendarView
  rangeLabel: string
}>()

const emit = defineEmits<{
  'update:view': [value: CalendarView]
  prev: []
  next: []
  today: []
}>()

const arrowClasses =
  'flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-text-secondary transition hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/30'
</script>

<template>
  <div
    class="flex flex-col gap-4 rounded-xl border border-border bg-card p-3 sm:p-4 lg:flex-row lg:items-center lg:justify-between"
  >
    <SegmentedControl
      :modelValue="view"
      :options="VIEW_OPTIONS"
      ariaLabel="Affichage du calendrier"
      class="self-start lg:self-auto"
      @update:modelValue="emit('update:view', $event)"
    />

    <div class="flex items-center justify-between gap-3 lg:justify-center">
      <button type="button" :class="arrowClasses" aria-label="Période précédente" @click="emit('prev')">
        <ChevronLeft class="h-4 w-4" aria-hidden="true" />
      </button>
      <p class="min-w-40 text-center font-display text-lg text-ink sm:min-w-52" aria-live="polite">
        {{ rangeLabel }}
      </p>
      <button type="button" :class="arrowClasses" aria-label="Période suivante" @click="emit('next')">
        <ChevronRight class="h-4 w-4" aria-hidden="true" />
      </button>
    </div>

    <BaseButton variant="secondary" size="md" class="w-full lg:w-auto" @click="emit('today')">
      <CalendarDays class="h-4 w-4" aria-hidden="true" />
      Aujourd’hui
    </BaseButton>
  </div>
</template>