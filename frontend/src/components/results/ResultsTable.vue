<script setup lang="ts">
import BaseBadge from '../common/BaseBadge.vue'
import BaseButton from '../common/BaseButton.vue'
import BaseCard from '../common/BaseCard.vue'
import DataTable, { type TableColumn } from '../tables/DataTable.vue'
import type { ResultView } from '../../composables/useResultsData'
import { PUBLICATION_META, formatGrade } from '../../utils/result'
import { fullName } from '../../utils/student'

defineProps<{
  views: ResultView[]
}>()

const emit = defineEmits<{
  check: [view: ResultView]
  pv: [view: ResultView]
}>()

const columns: TableColumn[] = [
  { key: 'student', label: 'Étudiant' },
  { key: 'project', label: 'Projet' },
  { key: 'grades', label: 'Notes reçues' },
  { key: 'final', label: 'Note finale' },
  { key: 'publication', label: 'Publication' },
  { key: 'action', label: 'Action', align: 'right' },
]
</script>

<template>
  <BaseCard :padded="false">
    <div class="border-b border-border px-5 py-4">
      <h2 class="font-display text-xl text-ink">Résultats des soutenances</h2>
      <p class="mt-1 text-xs text-text-muted">
        {{ views.length }} {{ views.length > 1 ? 'étudiants affichés' : 'étudiant affiché' }}
      </p>
    </div>

    <DataTable
      :columns="columns"
      :rows="views"
      :row-key="(view) => view.result.id"
      empty-text="Aucun résultat ne correspond à vos filtres."
    >
      <template #cell-student="{ row }">
        <p class="text-sm font-semibold text-ink">
          {{ row.student ? fullName(row.student) : 'Étudiant inconnu' }}
        </p>
        <p class="text-xs text-text-muted">{{ row.student?.matricule }}</p>
      </template>

      <template #cell-project="{ row }">
        <span class="line-clamp-2">{{ row.project?.title }}</span>
      </template>

      <template #cell-grades="{ row }">
        <span
          class="rounded bg-surface-muted px-2 py-0.5 text-xs font-semibold tabular-nums text-text-body"
        >
          {{ row.result.grades.length }}/{{ row.result.expectedGrades }}
        </span>
      </template>

      <template #cell-final="{ row }">
        <span v-if="row.finalGrade !== null" class="font-display text-lg text-ink tabular-nums">
          {{ formatGrade(row.finalGrade) }}
        </span>
        <span v-else class="text-text-muted">—</span>
      </template>

      <template #cell-publication="{ row }">
        <BaseBadge :tone="PUBLICATION_META[row.state].tone">
          {{ PUBLICATION_META[row.state].label }}
        </BaseBadge>
      </template>

      <template #cell-action="{ row }">
        <BaseButton
          v-if="row.state === 'published'"
          variant="secondary"
          size="sm"
          @click="emit('pv', row)"
        >
          PV
        </BaseButton>
        <BaseButton v-else variant="secondary" size="sm" @click="emit('check', row)">
          Vérifier
        </BaseButton>
      </template>
    </DataTable>
  </BaseCard>
</template>