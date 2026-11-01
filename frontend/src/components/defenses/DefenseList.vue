<script setup lang="ts">
import BaseBadge from '../common/BaseBadge.vue'
import DataTable, { type TableColumn } from '../tables/DataTable.vue'
import type { DefenseView } from '../../composables/useDefensesData'
import { ROOM_TONES, juryState, shortRoomName } from '../../utils/defense'
import { formatDayMonth } from '../../utils/format'

defineProps<{
  items: DefenseView[]
}>()

const emit = defineEmits<{
  select: [view: DefenseView]
}>()

const columns: TableColumn[] = [
  { key: 'when', label: 'Date et heure' },
  { key: 'students', label: 'Étudiants' },
  { key: 'project', label: 'Projet' },
  { key: 'room', label: 'Salle' },
  { key: 'jury', label: 'Jury' },
  { key: 'action', label: 'Détail', align: 'right' },
]
</script>

<template>
  <DataTable
    :columns="columns"
    :rows="items"
    :row-key="(view) => view.defense.id"
    empty-text="Aucune soutenance sur cette période."
  >
    <template #cell-when="{ row }">
      <p class="font-semibold text-ink">{{ formatDayMonth(row.defense.date) }}</p>
      <p class="text-xs tabular-nums text-text-muted">{{ row.defense.time }}</p>
    </template>

    <template #cell-students="{ row }">
      <span class="text-sm font-semibold text-ink">{{ row.studentNames }}</span>
    </template>

    <template #cell-project="{ row }">
      <span class="line-clamp-2">{{ row.project?.title }}</span>
    </template>

    <template #cell-room="{ row }">
      <span v-if="row.room" class="inline-flex items-center gap-2">
        <span class="h-2 w-2 rounded-full" :class="ROOM_TONES[row.room.tone].dot" aria-hidden="true" />
        {{ shortRoomName(row.room.name) }}
      </span>
    </template>

    <template #cell-jury="{ row }">
      <BaseBadge :tone="juryState(row.defense).tone">{{ juryState(row.defense).label }}</BaseBadge>
    </template>

    <template #cell-action="{ row }">
      <button
        type="button"
        class="rounded-sm text-xs font-semibold text-ink underline decoration-border-strong underline-offset-4 transition hover:decoration-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
        @click="emit('select', row)"
      >
        Voir le détail
      </button>
    </template>
  </DataTable>
</template>