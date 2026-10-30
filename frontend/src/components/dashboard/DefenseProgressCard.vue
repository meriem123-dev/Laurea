<script setup lang="ts">
import { computed, ref } from 'vue'
import BaseCard from '../common/BaseCard.vue'
import DonutChart from '../common/DonutChart.vue'
import BaseSelect from '../forms/BaseSelect.vue'
import { toPercentages } from '../../utils/format'
import type { BreakdownId, DefenseBreakdownItem } from '../../types/dashboard'

const props = defineProps<{
  items: DefenseBreakdownItem[]
  subtitle: string
}>()

const COLORS: Record<BreakdownId, string> = {
  planned: 'text-navy-900',
  done: 'text-primary-400',
  toPlan: 'text-primary-200',
  cancelled: 'text-danger',
}

// TODO backend : le filtre de période devra recharger les données
const period = ref('year')
const periodOptions = [{ value: 'year', label: 'Cette année' }]

const total = computed(() => props.items.reduce((sum, item) => sum + item.value, 0))

const rows = computed(() => {
  const percents = toPercentages(props.items.map((item) => item.value))
  return props.items.map((item, index) => ({
    ...item,
    colorClass: COLORS[item.id],
    percent: percents[index] ?? 0,
  }))
})

const segments = computed(() =>
  rows.value.map((row) => ({ value: row.value, colorClass: row.colorClass })),
)
</script>

<template>
  <BaseCard title="Avancement des soutenances" :subtitle="subtitle">
    <template #action>
      <BaseSelect v-model="period" :options="periodOptions" :ariaLabel="'Période'" />
    </template>

    <div class="flex flex-col items-center justify-center gap-8 sm:flex-row sm:gap-12">
      <DonutChart :segments="segments" aria-label="Répartition des soutenances par statut">
        <p class="text-2xl font-semibold leading-none text-ink">{{ total }}</p>
        <p class="mt-1 text-[11px] text-text-muted">Total</p>
      </DonutChart>

      <ul class="w-full max-w-56 space-y-4">
        <li v-for="row in rows" :key="row.id" class="flex items-center gap-3">
          <span
            class="h-2 w-2 shrink-0 rounded-full bg-current"
            :class="row.colorClass"
            aria-hidden="true"
          />
          <div class="flex-1">
            <p class="text-sm font-semibold leading-none text-ink">{{ row.value }}</p>
            <p class="mt-1 text-[11px] text-text-muted">{{ row.label }}</p>
          </div>
          <span class="text-xs text-text-secondary">{{ row.percent }}%</span>
        </li>
      </ul>
    </div>
  </BaseCard>
</template>