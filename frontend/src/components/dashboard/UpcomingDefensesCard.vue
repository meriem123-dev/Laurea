<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { ChevronRight } from '@lucide/vue'
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
        class="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:underline"
      >
        Voir tout
        <ChevronRight class="h-3.5 w-3.5" aria-hidden="true" />
      </RouterLink>
    </template>

    <p v-if="defenses.length === 0" class="py-6 text-center text-sm text-text-muted">
      Aucune soutenance prévue.
    </p>

    <ul v-else class="divide-y divide-border border-y border-border">
      <li v-for="defense in defenses" :key="defense.id" class="flex items-center gap-3 py-3.5">
        <div
          class="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-primary-50 text-primary-600"
        >
          <span class="text-base font-semibold leading-none">{{ formatDay(defense.date) }}</span>
          <span class="mt-1 text-[8px] font-medium">{{ formatMonthShort(defense.date) }}</span>
        </div>

        <div class="min-w-0 flex-1">
          <p class="text-[11px] font-medium text-text-body">
            {{ defense.time }} · {{ defense.room }}
          </p>
          <p class="mt-0.5 truncate text-sm font-semibold text-ink">{{ defense.student }}</p>
          <p class="mt-0.5 truncate text-[11px] text-text-muted">{{ defense.project }}</p>
        </div>

        <BaseBadge :tone="DEFENSE_STATUS_META[defense.status].tone">
          {{ DEFENSE_STATUS_META[defense.status].label }}
        </BaseBadge>
      </li>
    </ul>
  </BaseCard>
</template>