<script setup lang="ts">
import { computed } from 'vue'
import { Info, Lock } from '@lucide/vue'
import BaseBadge from '../common/BaseBadge.vue'
import BaseButton from '../common/BaseButton.vue'
import BaseCard from '../common/BaseCard.vue'
import BaseTextarea from '../forms/BaseTextarea.vue'
import { MAX_SCORE, formatPreciseGrade } from '../../utils/grading'

const props = defineProps<{
  members: { id: number; name: string; grade: number | null }[]
  average: number | null
  finalGrade: number | null // note retenue (par défaut : la moyenne)
  justification: string
  observations: string
  locked: boolean
  deviation: boolean // la note retenue diffère de la moyenne
  canLock: boolean // toutes les conditions de validation sont réunies
  blockedReason: string // pourquoi la validation est impossible (affiché à gauche du bouton)
}>()

const emit = defineEmits<{
  'update:finalGrade': [value: number | null]
  'update:justification': [value: string]
  'update:observations': [value: string]
  lock: []
}>()

const isReady = computed(() => props.average !== null)

const formula = computed(() => {
  const grades = props.members.map((member) => member.grade)
  if (props.average === null || grades.some((grade) => grade === null)) return ''
  return `(${grades.map((grade) => formatPreciseGrade(grade ?? 0)).join(' + ')}) / ${grades.length}`
})

function onFinalGrade(event: Event) {
  const input = event.target as HTMLInputElement
  const raw = input.value.trim().replace(',', '.')
  if (raw === '') {
    emit('update:finalGrade', null)
    return
  }
  const value = Number(raw)
  if (!Number.isFinite(value)) return
  const clamped = Math.min(MAX_SCORE, Math.max(0, value))
  input.value = String(clamped)
  emit('update:finalGrade', clamped)
}
</script>

<template>
  <BaseCard :padded="false" class="overflow-hidden">
    <header
      class="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4 sm:px-6"
    >
      <div class="min-w-0">
        <h2 class="font-display text-xl text-ink">Délibération</h2>
        <p class="mt-1 text-xs text-text-muted">
          {{
            isReady
              ? 'Toutes les évaluations sont complétées. Le jury peut arrêter la note finale.'
              : 'La délibération sera possible quand tous les jurés auront complété leur grille.'
          }}
        </p>
      </div>
      <BaseBadge v-if="locked" tone="success">Note verrouillée</BaseBadge>
      <BaseBadge v-else-if="isReady" tone="success">Prêt à délibérer</BaseBadge>
      <BaseBadge v-else tone="warning">Évaluations en cours</BaseBadge>
    </header>

    <div class="grid grid-cols-1 gap-6 px-5 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
      <div class="rounded-lg bg-surface p-4">
        <p class="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-text-secondary">
          Notes pondérées du jury
        </p>

        <ul class="mt-3 divide-y divide-border">
          <li
            v-for="member in members"
            :key="member.id"
            class="flex items-center justify-between gap-3 py-2.5 text-sm"
          >
            <span class="min-w-0 truncate text-text-body">{{ member.name }}</span>
            <span class="font-semibold tabular-nums text-ink">
              {{ member.grade === null ? '—' : formatPreciseGrade(member.grade) }}
            </span>
          </li>
        </ul>

        <div class="mt-3 flex items-end justify-between gap-3 border-t border-border-strong pt-4">
          <span class="text-sm font-semibold text-ink">Moyenne du jury</span>
          <span class="font-display text-3xl leading-none tabular-nums text-ink">
            {{ average === null ? '—' : formatPreciseGrade(average) }}
            <small class="text-sm text-text-muted">/{{ MAX_SCORE }}</small>
          </span>
        </div>
        <p v-if="formula" class="mt-2 text-right text-[0.6875rem] tabular-nums text-text-muted">
          {{ formula }}
        </p>
      </div>

      <div class="flex min-w-0 flex-col gap-5">
        <div>
          <label for="final-grade" class="mb-1.5 block text-[0.8125rem] font-semibold text-ink">
            Note finale retenue
          </label>
          <div class="flex items-center gap-2">
            <input
              id="final-grade"
              type="number"
              min="0"
              :max="MAX_SCORE"
              step="0.05"
              inputmode="decimal"
              :value="finalGrade ?? ''"
              :disabled="locked || !isReady"
              aria-describedby="final-grade-hint"
              class="h-11 w-32 rounded-lg border border-border-strong bg-card px-3.5 text-sm tabular-nums text-ink outline-none transition focus:border-ink focus:ring-4 focus:ring-ink/10 disabled:cursor-not-allowed disabled:opacity-60"
              @change="onFinalGrade"
            />
            <span class="text-sm text-text-muted">/{{ MAX_SCORE }}</span>
          </div>
          <p id="final-grade-hint" class="mt-1.5 text-xs text-text-muted">
            Par défaut, mise à la moyenne du jury. Vous pouvez l’ajuster avant validation.
          </p>
        </div>

        <BaseTextarea
          id="deliberation-justification"
          :modelValue="justification"
          label="Justification en cas d’ajustement"
          :rows="3"
          :required="deviation"
          :optional="!deviation"
          hint="Obligatoire si la note finale diffère de la moyenne du jury."
          placeholder="Principaux éléments qui justifient l’ajustement…"
          @update:modelValue="emit('update:justification', $event)"
        />

        <BaseTextarea
          id="deliberation-observations"
          :modelValue="observations"
          label="Observations / mention"
          :rows="3"
          optional
          placeholder="Appréciation générale du jury…"
          @update:modelValue="emit('update:observations', $event)"
        />
      </div>
    </div>

    <footer
      class="flex flex-col gap-3 border-t border-border bg-surface px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
    >
      <p class="flex min-w-0 items-start gap-2 text-xs text-text-secondary">
        <Info class="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>
          <span class="font-semibold text-ink">
            {{ locked ? 'Note verrouillée.' : 'Note non verrouillée.' }}
          </span>
          {{
            locked
              ? 'Elle sera reportée dans le procès-verbal.'
              : blockedReason || 'La validation verrouille la note, qui sera reportée dans le procès-verbal.'
          }}
        </span>
      </p>

      <BaseButton
        v-if="!locked"
        size="md"
        class="w-full shrink-0 sm:w-auto"
        :disabled="!canLock"
        @click="emit('lock')"
      >
        <Lock class="h-4 w-4" aria-hidden="true" />
        Valider et verrouiller la note
      </BaseButton>
    </footer>
  </BaseCard>
</template>