<script setup lang="ts">
import { ref, watch } from 'vue'
import { FileText } from '@lucide/vue'
import BaseBadge from '../common/BaseBadge.vue'
import BaseButton from '../common/BaseButton.vue'
import BaseCard from '../common/BaseCard.vue'
import BaseInput from '../forms/BaseInput.vue'
import BaseTextarea from '../forms/BaseTextarea.vue'
import type { ProjectDocument } from '../../types/document'
import { DOCUMENT_STATUS_META, documentStatusOf } from '../../utils/documentStatus'
import { formatFileSize } from '../../utils/document'
import { formatDayMonth } from '../../utils/format'
import { MAX_SCORE } from '../../utils/grading'

const props = withDefaults(
  defineProps<{
    document: ProjectDocument | null
    saving?: boolean
  }>(),
  { saving: false },
)

const emit = defineEmits<{
  save: [grade: number | null, comment: string]
}>()

const grade = ref('')
const comment = ref('')
const error = ref('')

// Le formulaire se remplit avec l'évaluation existante à chaque changement de dépôt
watch(
  () => props.document,
  (current) => {
    grade.value = current?.grade == null ? '' : String(current.grade).replace('.', ',')
    comment.value = current?.comment ?? ''
    error.value = ''
  },
  { immediate: true },
)

function submit() {
  const raw = grade.value.trim().replace(',', '.')
  if (raw === '') {
    error.value = ''
    emit('save', null, comment.value.trim())
    return
  }

  const value = Number(raw)
  if (!Number.isFinite(value) || value < 0 || value > MAX_SCORE) {
    error.value = `Saisissez une note entre 0 et ${MAX_SCORE}.`
    return
  }
  error.value = ''
  emit('save', value, comment.value.trim())
}
</script>

<template>
  <BaseCard class="h-full">
    <div
      v-if="!document"
      class="flex h-full min-h-48 flex-col items-center justify-center text-center"
    >
      <FileText class="h-6 w-6 text-text-muted" :stroke-width="1.5" aria-hidden="true" />
      <p class="mt-3 font-display text-lg text-ink">Sélectionnez un dépôt</p>
      <p class="mt-1 max-w-56 text-xs text-text-muted">
        Choisissez un document pour consulter ou ajouter son évaluation.
      </p>
    </div>

    <form v-else class="flex flex-col gap-5" novalidate @submit.prevent="submit">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <h3 class="break-words font-display text-lg text-ink">{{ document.name }}</h3>
          <p class="mt-1 text-xs text-text-muted">
            Déposé le {{ formatDayMonth(document.submittedOn) }} ·
            {{ formatFileSize(document.sizeKb) }}
            <template v-if="document.evaluatedOn">
              · Évalué le {{ formatDayMonth(document.evaluatedOn) }}
            </template>
          </p>
        </div>
        <BaseBadge :tone="DOCUMENT_STATUS_META[documentStatusOf(document)].tone" class="shrink-0">
          {{ DOCUMENT_STATUS_META[documentStatusOf(document)].label }}
        </BaseBadge>
      </div>

      <BaseInput
        id="document-grade"
        v-model="grade"
        variant="boxed"
        label="Note sur 20"
        placeholder="Ex. : 16"
        optional
        hint="Sans note, le dépôt reste « en attente d’évaluation » (commentaire seul)."
        :error="error"
      />

      <BaseTextarea
        id="document-comment"
        v-model="comment"
        label="Commentaire"
        placeholder="Votre appréciation de ce dépôt…"
        optional
      />

      <BaseButton
        type="submit"
        size="md"
        class="w-full sm:w-auto sm:self-end"
        :loading="saving"
      >
        Enregistrer l’évaluation
      </BaseButton>
    </form>
  </BaseCard>
</template>