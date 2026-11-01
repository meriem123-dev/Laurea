<script setup lang="ts">
import { computed } from 'vue'
import { ArrowRight } from '@lucide/vue'
import BaseBadge from '../common/BaseBadge.vue'
import InitialsAvatar from '../common/InitialsAvatar.vue'
import type { DefenseView } from '../../composables/useDefensesData'
import { JURY_MEMBER_COUNT, juryState } from '../../utils/defense'
import { formatDay, formatMonthShort } from '../../utils/format'
import { displayName, initials } from '../../utils/professor'

const props = defineProps<{
  view: DefenseView
}>()

const emit = defineEmits<{
  view: [view: DefenseView]
}>()

// Président + jurés ; un emplacement vide s'affiche « À affecter »
const slots = computed(() => [
  { label: 'Président', professor: props.view.president, highlight: true },
  ...Array.from({ length: JURY_MEMBER_COUNT }, (_, index) => ({
    label: `Juré ${index + 1}`,
    professor: props.view.members[index],
    highlight: false,
  })),
])

const state = computed(() => juryState(props.view.defense))
</script>

<template>
  <article class="overflow-hidden rounded-xl border border-border bg-card">
    <header class="flex items-start gap-4 p-5">
      <div class="w-12 shrink-0 text-center">
        <p class="font-display text-3xl leading-none text-ink">{{ formatDay(view.defense.date) }}</p>
        <p class="mt-1.5 text-[0.625rem] font-bold uppercase tracking-[0.14em] text-brass-dark">
          {{ formatMonthShort(view.defense.date) }}
        </p>
      </div>

      <div class="min-w-0 flex-1">
        <p class="text-xs text-text-muted">Soutenance de {{ view.studentNames }}</p>
        <h2 class="mt-1 break-words font-display text-xl leading-snug text-ink">
          {{ view.project?.title }}
        </h2>
        <p class="mt-1 text-xs tabular-nums text-text-secondary">
          {{ view.defense.time }}
          <span class="mx-1 text-border-strong">/</span>
          {{ view.room?.name }}
        </p>
      </div>
    </header>

    <ul class="grid grid-cols-1 gap-px border-y border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
      <li
        v-for="slot in slots"
        :key="slot.label"
        class="flex min-w-0 items-center gap-3 p-4"
        :class="slot.highlight ? 'bg-brass-soft' : 'bg-card'"
      >
        <InitialsAvatar v-if="slot.professor" :initials="initials(slot.professor)" size="sm" />
        <span
          v-else
          class="h-8 w-8 shrink-0 rounded-full border border-dashed border-border-strong"
          aria-hidden="true"
        />

        <div class="min-w-0">
          <p class="text-[0.625rem] font-bold uppercase tracking-[0.14em] text-text-muted">
            {{ slot.label }}
          </p>
          <p
            v-if="slot.professor"
            class="mt-0.5 truncate text-sm font-semibold text-ink"
          >
            {{ displayName(slot.professor) }}
          </p>
          <p v-else class="mt-0.5 text-sm font-semibold text-warning-dark">À affecter</p>
        </div>
      </li>
    </ul>

    <footer class="flex items-center justify-between gap-3 px-5 py-4">
      <BaseBadge :tone="state.tone">{{ state.label }}</BaseBadge>

      <button
        type="button"
        class="group inline-flex items-center gap-1.5 rounded-sm text-xs font-semibold text-ink underline decoration-border-strong underline-offset-4 transition hover:decoration-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
        @click="emit('view', view)"
      >
        Voir le détail
        <ArrowRight
          class="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </button>
    </footer>
  </article>
</template>