<script setup lang="ts">
import { computed } from 'vue'
import type { Criterion, CriterionScores } from '../../types/evaluation'
import {
  MAX_SCORE,
  coefficientShare,
  formatPreciseGrade,
  totalCoefficient,
} from '../../utils/grading'

export interface GridJuror {
  id: string
  name: string
  roleLabel: string
  scores: CriterionScores
  grade: number | null // note pondérée, null tant que la grille est incomplète
}

const props = defineProps<{
  criteria: Criterion[]
  jurors: GridJuror[]
  currentId: string // professeur connecté : sa colonne est mise en évidence
  editable: boolean // sa colonne est-elle modifiable ?
}>()

const emit = defineEmits<{
  score: [criterionId: string, value: number | null]
}>()

const total = computed(() => totalCoefficient(props.criteria))

function onInput(criterionId: string, event: Event) {
  const input = event.target as HTMLInputElement
  const raw = input.value.trim().replace(',', '.')

  if (raw === '') {
    emit('score', criterionId, null)
    return
  }
  const value = Number(raw)
  if (!Number.isFinite(value)) return

  const clamped = Math.min(MAX_SCORE, Math.max(0, value))
  if (clamped !== value) input.value = String(clamped)
  emit('score', criterionId, clamped)
}

const headCell = 'px-3 py-3 text-center align-bottom'
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full min-w-[40rem] border-collapse text-left">
      <thead>
        <tr class="border-b border-border">
          <th
            scope="col"
            class="px-5 py-3 text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-text-secondary"
          >
            Critères d’évaluation
          </th>
          <th
            scope="col"
            :class="headCell"
            class="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-text-secondary"
          >
            Coefficient
          </th>
          <th
            v-for="juror in jurors"
            :key="juror.id"
            scope="col"
            :class="[headCell, juror.id === currentId ? 'bg-primary-50' : '']"
          >
            <span class="block text-xs font-semibold text-ink">
              {{ juror.name }}<template v-if="juror.id === currentId"> · vous</template>
            </span>
            <span class="block text-[0.625rem] font-normal text-text-muted">
              {{ juror.roleLabel }} · /{{ MAX_SCORE }}
            </span>
          </th>
        </tr>
      </thead>

      <tbody class="divide-y divide-border">
        <tr v-for="criterion in criteria" :key="criterion.id">
          <td class="px-5 py-4">
            <p class="text-sm font-semibold text-ink">{{ criterion.label }}</p>
            <p class="text-xs text-text-muted">{{ criterion.description }}</p>
          </td>

          <td class="px-3 py-4 text-center">
            <p class="text-sm font-semibold tabular-nums text-ink">{{ criterion.coefficient }}</p>
            <p class="text-[0.6875rem] tabular-nums text-text-muted">
              {{ coefficientShare(criterion, criteria) }} %
            </p>
          </td>

          <td
            v-for="juror in jurors"
            :key="juror.id"
            class="px-3 py-4 text-center text-sm tabular-nums"
            :class="juror.id === currentId ? 'bg-primary-50' : 'text-text-body'"
          >
            <input
              v-if="juror.id === currentId && editable"
              type="number"
              min="0"
              :max="MAX_SCORE"
              step="0.25"
              inputmode="decimal"
              :value="juror.scores[criterion.id] ?? ''"
              :aria-label="`Votre note pour ${criterion.label}`"
              class="h-9 w-20 rounded-lg border border-border-strong bg-card px-2 text-center text-sm text-ink outline-none transition focus:border-ink focus:ring-4 focus:ring-ink/10"
              @input="onInput(criterion.id, $event)"
            />
            <span v-else>{{ juror.scores[criterion.id] ?? '—' }}</span>
          </td>
        </tr>
      </tbody>

      <tfoot>
        <tr class="border-t border-border-strong bg-surface">
          <td class="px-5 py-4">
            <p class="text-sm font-semibold text-ink">Note pondérée /{{ MAX_SCORE }}</p>
            <p class="text-xs text-text-muted">Σ (notes × coefficients) / {{ total }}</p>
          </td>
          <td class="px-3 py-4 text-center text-sm font-semibold tabular-nums text-ink">
            {{ total }}
          </td>
          <td
            v-for="juror in jurors"
            :key="juror.id"
            class="px-3 py-4 text-center font-display text-lg tabular-nums text-ink"
            :class="juror.id === currentId ? 'bg-primary-50' : ''"
          >
            {{ juror.grade === null ? '—' : formatPreciseGrade(juror.grade) }}
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>