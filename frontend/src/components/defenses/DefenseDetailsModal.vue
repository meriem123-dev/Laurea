<script setup lang="ts">
import { computed } from 'vue'
import { CalendarDays } from '@lucide/vue'
import DetailsModal from '../common/DetailsModal.vue'
import { useDefensesData } from '../../composables/useDefensesData'
import { formatLongDay } from '../../utils/calendar'
import { defenseSlot, formatTime, juryState } from '../../utils/defense'
import { displayName } from '../../utils/professor'
import type { Defense } from '../../types/defense'

const props = defineProps<{
  modelValue: boolean
  defense: Defense | null
  editable?: boolean
  deletable?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  edit: []
  delete: []
}>()

const { toView } = useDefensesData()
const view = computed(() => (props.defense ? toView(props.defense) : null))

const fields = computed(() => {
  const current = view.value
  if (!current) return []
  const slot = defenseSlot(current.defense)
  return [
    { label: 'Projet', value: current.project?.title ?? '' },
    { label: 'Étudiants', value: current.studentNames },
    { label: 'Date', value: formatLongDay(current.defense.date) },
    { label: 'Horaire', value: `${formatTime(slot.start)} – ${formatTime(slot.end)}` },
    { label: 'Salle', value: current.room?.name ?? '' },
    { label: 'Président du jury', value: current.president ? displayName(current.president) : '' },
    {
      label: 'Membres du jury',
      value: current.members.map((member) => displayName(member)).join(', '),
    },
  ]
})

const badge = computed(() => {
  if (!props.defense) return undefined
  const state = juryState(props.defense)
  return { label: 'Jury', text: state.label, tone: state.tone }
})
</script>

<template>
  <DetailsModal
    :modelValue="modelValue"
    :title="view ? `Soutenance de ${view.studentNames}` : ''"
    :subtitle="view?.project?.domain"
    :icon="CalendarDays"
    :fields="fields"
    :badge="badge"
    :editable="editable"
    :deletable="deletable"
    @update:modelValue="emit('update:modelValue', $event)"
    @edit="emit('edit')"
    @delete="emit('delete')"
  />
</template>