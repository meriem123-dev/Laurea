<script setup lang="ts">
import { computed } from 'vue'
import { Award } from '@lucide/vue'
import BaseButton from '../common/BaseButton.vue'
import DetailsModal from '../common/DetailsModal.vue'
import type { ResultView } from '../../composables/useResultsData'
import { displayName } from '../../utils/professor'
import { PUBLICATION_META, formatGrade, missingGrades } from '../../utils/result'
import { fullName } from '../../utils/student'

const props = defineProps<{
  modelValue: boolean
  view: ResultView | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  publish: []
  pv: []
}>()

const fields = computed(() => {
  const current = props.view
  if (!current) return []

  const missing = missingGrades(current.result)
  const list = [
    {
      label: 'Étudiant',
      value: current.student ? `${fullName(current.student)} (${current.student.matricule})` : '',
    },
    { label: 'Spécialité', value: current.student?.specialty ?? '' },
    {
      label: 'Notes reçues',
      value: `${current.result.grades.length} sur ${current.result.expectedGrades}`,
    },
    {
      label: 'Note finale',
      value: current.finalGrade === null ? '' : `${formatGrade(current.finalGrade)} / 20`,
    },
    ...current.graders.map((grader, index) => ({
      label: grader.professor ? displayName(grader.professor) : `Membre ${index + 1}`,
      value: `${formatGrade(grader.value)} / 20`,
    })),
  ]

  if (missing > 0) {
    list.push({
      label: 'Notes en attente',
      value: `${missing} note(s) manquante(s) : le résultat ne pourra être publié qu’une fois toutes les notes reçues.`,
    })
  }
  return list
})

const badge = computed(() => {
  if (!props.view) return undefined
  const meta = PUBLICATION_META[props.view.state]
  return { label: 'Publication', text: meta.label, tone: meta.tone }
})
</script>

<template>
  <DetailsModal
    :modelValue="modelValue"
    :title="view?.student ? fullName(view.student) : 'Résultat'"
    :subtitle="view?.project?.title"
    :icon="Award"
    :fields="fields"
    :badge="badge"
    @update:modelValue="emit('update:modelValue', $event)"
  >
    <template #actions>
      <BaseButton
        v-if="view?.state === 'toValidate'"
        size="md"
        class="w-full sm:w-auto"
        @click="emit('publish')"
      >
        Valider et publier
      </BaseButton>
      <BaseButton
        v-else-if="view?.state === 'published'"
        size="md"
        class="w-full sm:w-auto"
        @click="emit('pv')"
      >
        Générer le PV
      </BaseButton>
    </template>
  </DetailsModal>
</template>