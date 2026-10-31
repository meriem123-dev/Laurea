<script setup lang="ts">
import { computed, ref } from 'vue'
import BaseCard from '../common/BaseCard.vue'
import SegmentedBar from '../common/SegmentedBar.vue'
import BaseSelect from '../forms/BaseSelect.vue'
import { toPercentages } from '../../utils/format'
import type { BreakdownId, DefenseBreakdownItem } from '../../types/dashboard'

const props = defineProps<{
  items: DefenseBreakdownItem[]
  subtitle: string
}>()

const COLORS: Record<BreakdownId, string> = {
  planned: 'bg-ink',
  done: 'bg-primary-400',
  toPlan: 'bg-brass',
  cancelled: 'bg-danger',
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

    <div class="flex items-baseline gap-2">
      <p class="font-display text-5xl leading-none tracking-tight text-ink tabular-nums">
        {{ total }}
      </p>
      <p class="text-xs text-text-muted">au total</p>
    </div>

    <SegmentedBar
      :segments="segments"
      aria-label="Répartition des soutenances par statut"
      class="mt-5"
    />

    <ul class="mt-4 divide-y divide-border">
      <li v-for="row in rows" :key="row.id" class="flex items-center gap-3 py-3">
        <span
          class="h-2.5 w-2.5 shrink-0 rounded-full"
          :class="row.colorClass"
          aria-hidden="true"
        />
        <span class="flex-1 text-sm text-text-body">{{ row.label }}</span>
        <span class="text-sm font-semibold text-ink tabular-nums">{{ row.value }}</span>
        <span class="w-10 text-right text-xs text-text-muted tabular-nums">{{ row.percent }}%</span>
      </li>
    </ul>
  </BaseCard>
</template>