<script setup lang="ts">
import { computed } from 'vue'
import { Ellipsis } from '@lucide/vue'
import BaseBadge from '../common/BaseBadge.vue'
import BaseCard from '../common/BaseCard.vue'
import InitialsAvatar from '../common/InitialsAvatar.vue'
import DataTable, { type TableColumn } from '../tables/DataTable.vue'
import { PROJECT_STATUS_META } from '../../utils/projectStatus'
import { fullName, initials } from '../../utils/student'
import type { Student } from '../../types/student'

const props = defineProps<{
  students: Student[]
  promotion: string
}>()

const emit = defineEmits<{
  'open-actions': [student: Student]
}>()

const columns: TableColumn[] = [
  { key: 'student', label: 'Étudiant' },
  { key: 'matricule', label: 'Matricule' },
  { key: 'specialty', label: 'Spécialité' },
  { key: 'group', label: 'Groupe' },
  { key: 'status', label: 'Statut PFE' },
  { key: 'action', label: 'Action', align: 'right' },
]

const countLabel = computed(() =>
  props.students.length > 1 ? 'étudiants affichés' : 'étudiant affiché',
)
</script>

<template>
  <BaseCard :padded="false">
    <div
      class="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-4"
    >
      <p class="text-sm text-text-body">
        <span class="mr-1 font-display text-2xl leading-none text-ink tabular-nums">
          {{ students.length }}
        </span>
        {{ countLabel }}
      </p>
      <p class="text-xs text-text-muted">Promotion {{ promotion }}</p>
    </div>

    <DataTable
      :columns="columns"
      :rows="students"
      :row-key="(student) => student.id"
      empty-text="Aucun étudiant ne correspond à votre recherche."
    >
      <template #cell-student="{ row }">
        <div class="flex items-center gap-3">
          <InitialsAvatar :initials="initials(row)" />
          <div class="min-w-0">
            <p class="truncate text-sm font-semibold text-ink">{{ fullName(row) }}</p>
            <p class="truncate text-xs text-text-muted">{{ row.email }}</p>
          </div>
        </div>
      </template>

      <template #cell-matricule="{ row }">
        <span class="text-xs font-medium tabular-nums text-text-secondary">{{ row.matricule }}</span>
      </template>

      <template #cell-specialty="{ row }">{{ row.specialty }}</template>

      <template #cell-group="{ row }">
        <span class="text-xs font-medium tabular-nums text-text-secondary">{{ row.group }}</span>
      </template>

      <template #cell-status="{ row }">
        <BaseBadge :tone="PROJECT_STATUS_META[row.projectStatus].tone">
          {{ PROJECT_STATUS_META[row.projectStatus].label }}
        </BaseBadge>
      </template>

      <template #cell-action="{ row }">
        <button
          type="button"
          class="inline-flex h-9 w-9 items-center justify-center rounded-full text-text-muted transition hover:bg-surface-muted hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
          :aria-label="`Actions pour ${fullName(row)}`"
          @click="emit('open-actions', row)"
        >
          <Ellipsis class="h-5 w-5" aria-hidden="true" />
        </button>
      </template>
    </DataTable>
  </BaseCard>
</template>