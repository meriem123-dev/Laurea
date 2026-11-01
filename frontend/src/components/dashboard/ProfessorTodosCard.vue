<script setup lang="ts">
import { computed, type Component } from 'vue'
import { RouterLink } from 'vue-router'
import { Award, ChevronRight, FileText } from '@lucide/vue'
import BaseBadge from '../common/BaseBadge.vue'
import BaseCard from '../common/BaseCard.vue'
import IconTile from '../common/IconTile.vue'
import type { ProfessorTodo, ProfessorTodoId } from '../../types/dashboard'
import type { IconTone } from '../../types/ui'

const props = defineProps<{
  actions: ProfessorTodo[]
  priority?: string // encadré « Priorité » en bas de la carte
}>()

const TILES: Record<ProfessorTodoId, { icon: Component; tone: IconTone }> = {
  evaluations: { icon: Award, tone: 'orange' },
  reports: { icon: FileText, tone: 'blue' },
}

const total = computed(() => props.actions.reduce((sum, action) => sum + action.count, 0))
</script>

<template>
  <BaseCard title="Actions requises" subtitle="À finaliser cette semaine">
    <template #action>
      <BaseBadge v-if="total > 0" tone="warning" :dot="false">{{ total }}</BaseBadge>
    </template>

    <p v-if="actions.length === 0" class="py-4 text-center text-sm text-text-muted">
      Rien à traiter pour le moment.
    </p>

    <ul v-else class="space-y-3">
      <li v-for="action in actions" :key="action.id">
        <RouterLink
          :to="action.to"
          class="group flex items-center gap-4 rounded-lg border border-border px-4 py-3 transition hover:border-border-strong hover:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
        >
          <IconTile :icon="TILES[action.id].icon" :tone="TILES[action.id].tone" size="sm" />

          <span class="min-w-0 flex-1">
            <span class="block truncate text-sm font-semibold text-ink">
              {{ action.count }} {{ action.label }}
            </span>
            <span class="mt-0.5 block truncate text-xs text-text-muted">
              {{ action.description }}
            </span>
          </span>

          <ChevronRight
            class="h-4 w-4 shrink-0 text-text-muted transition group-hover:translate-x-0.5 group-hover:text-ink"
            aria-hidden="true"
          />
        </RouterLink>
      </li>
    </ul>

    <div v-if="priority" class="mt-5 rounded-lg bg-surface p-4">
      <p class="text-[0.625rem] font-bold uppercase tracking-[0.14em] text-text-secondary">
        Priorité
      </p>
      <p class="mt-1.5 text-xs leading-relaxed text-text-body">{{ priority }}</p>
    </div>
  </BaseCard>
</template>