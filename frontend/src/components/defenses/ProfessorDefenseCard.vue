<script setup lang="ts">
import { computed } from 'vue'
import { ArrowRight } from '@lucide/vue'
import BaseBadge from '../common/BaseBadge.vue'
import type { ProfessorDefense } from '../../composables/useProfessorDefenses'
import { formatDay, formatMonthShort } from '../../utils/format'
import { JURY_ROLE_META } from '../../utils/juryRole'

const props = defineProps<{
  item: ProfessorDefense
}>()

const emit = defineEmits<{
  view: [item: ProfessorDefense]
}>()

const meta = computed(() => JURY_ROLE_META[props.item.role])
const defense = computed(() => props.item.view.defense)
const candidateLabel = computed(() =>
  props.item.view.students.length > 1 ? 'Candidats' : 'Candidat',
)
</script>

<template>
  <article
    class="flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition duration-300 hover:-translate-y-0.5 hover:border-border-strong sm:gap-5"
  >
    <div
      class="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-primary-50"
    >
      <p class="font-display text-2xl leading-none text-primary-600">
        {{ formatDay(defense.date) }}
      </p>
      <p class="mt-1 text-[0.625rem] font-bold uppercase tracking-[0.14em] text-primary-600">
        {{ formatMonthShort(defense.date) }}
      </p>
    </div>

    <div class="min-w-0 flex-1">
      <BaseBadge :tone="meta.tone">{{ meta.label }}</BaseBadge>

      <h2 class="mt-2 break-words font-display text-xl leading-snug text-ink">
        {{ item.view.project?.title }}
      </h2>

      <p class="mt-1 text-xs text-text-muted">
        {{ candidateLabel }} :
        <span class="font-semibold text-ink">{{ item.view.studentNames }}</span>
      </p>

      <p class="mt-1.5 text-xs tabular-nums text-text-secondary">
        {{ defense.time }}
        <template v-if="item.view.room">
          <span class="mx-1 text-border-strong">/</span>
          {{ item.view.room.name }}
        </template>
        <template v-if="item.view.project?.domain">
          <span class="mx-1 text-border-strong">/</span>
          {{ item.view.project.domain }}
        </template>
      </p>
    </div>

    <button
      type="button"
      class="group inline-flex shrink-0 items-center gap-1.5 self-center rounded-sm text-xs font-semibold text-ink underline decoration-border-strong underline-offset-4 transition hover:decoration-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
      @click="emit('view', item)"
    >
      <span class="hidden sm:inline">Voir les détails</span>
      <span class="sr-only sm:hidden">Voir les détails</span>
      <ArrowRight
        class="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </button>
  </article>
</template>