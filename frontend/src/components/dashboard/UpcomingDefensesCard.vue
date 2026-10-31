<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { ArrowUpRight } from '@lucide/vue'
import BaseBadge from '../common/BaseBadge.vue'
import BaseCard from '../common/BaseCard.vue'
import { DEFENSE_STATUS_META } from '../../utils/defenseStatus'
import { formatDay, formatMonthShort } from '../../utils/format'
import type { UpcomingDefense } from '../../types/dashboard'

defineProps<{
  defenses: UpcomingDefense[]
  subtitle: string
  viewAllTo: string
}>()
</script>

<template>
  <BaseCard title="Prochaines soutenances" :subtitle="subtitle">
    <template #action>
      <RouterLink
        :to="viewAllTo"
        class="inline-flex items-center gap-1 text-xs font-semibold text-ink underline decoration-border-strong underline-offset-4 transition hover:decoration-ink"
      >
        Voir tout
        <ArrowUpRight class="h-3.5 w-3.5" aria-hidden="true" />
      </RouterLink>
    </template>

    <p v-if="defenses.length === 0" class="py-6 text-center text-sm text-text-muted">
      Aucune soutenance prévue.
    </p>

    <ul v-else class="divide-y divide-border">
      <li
        v-for="defense in defenses"
        :key="defense.id"
        class="flex items-start gap-4 py-4 first:pt-0 last:pb-0"
      >
        <div class="w-11 shrink-0 text-center">
          <p class="font-display text-3xl leading-none text-ink">{{ formatDay(defense.date) }}</p>
          <p class="mt-1.5 text-[0.625rem] font-bold uppercase tracking-[0.14em] text-brass-dark">
            {{ formatMonthShort(defense.date) }}
          </p>
        </div>

        <div class="min-w-0 flex-1">
          <p class="text-xs font-semibold text-text-secondary tabular-nums">
            {{ defense.time }}
            <span class="mx-1 text-border-strong">/</span>
            {{ defense.room }}
          </p>
          <p class="mt-1 truncate text-sm font-semibold text-ink">{{ defense.student }}</p>
          <p class="mt-0.5 truncate text-xs text-text-muted">{{ defense.project }}</p>
        </div>

        <BaseBadge :tone="DEFENSE_STATUS_META[defense.status].tone" class="shrink-0">
          {{ DEFENSE_STATUS_META[defense.status].label }}
        </BaseBadge>
      </li>
    </ul>
  </BaseCard>
</template>