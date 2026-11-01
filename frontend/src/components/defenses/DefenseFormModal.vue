<script setup lang="ts">
import { computed } from 'vue'
import { CalendarDays, Pencil } from '@lucide/vue'
import EntityFormModal from '../forms/EntityFormModal.vue'
import { useDefensesData } from '../../composables/useDefensesData'
import { DEFAULT_DURATION } from '../../utils/defense'
import {
  buildDefenseFields,
  defaultDefenseValues,
  defenseToFormValues,
  toDefenseData,
} from '../../utils/defenseForm'
import { displayName } from '../../utils/professor'
import type { Defense } from '../../types/defense'
import type { FormValues } from '../../types/form'

const props = defineProps<{
  modelValue: boolean
  defense: Defense | null // null = création
  initialDate: string // date proposée à la création
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: [date: string]
}>()

const { defenses, projects, professors, rooms, addDefense, updateDefense } = useDefensesData()

const isEdit = computed(() => props.defense !== null)
const otherDefenses = computed(() => defenses.value.filter((item) => item.id !== props.defense?.id))

const fields = computed(() =>
  buildDefenseFields({
    // Un projet n'a qu'une soutenance : on propose ceux qui ne sont pas encore planifiés
    projectOptions: projects
      .filter((project) => !otherDefenses.value.some((item) => item.projectId === project.id))
      .map((project) => ({ value: String(project.id), label: project.title })),
    professorOptions: professors.map((professor) => ({
      value: String(professor.id),
      label: displayName(professor),
    })),
    roomOptions: rooms.map((room) => ({ value: String(room.id), label: room.name })),
    professors,
    otherDefenses: otherDefenses.value,
    duration: props.defense?.duration ?? DEFAULT_DURATION,
  }),
)

const initialValues = computed(() =>
  props.defense ? defenseToFormValues(props.defense) : defaultDefenseValues(props.initialDate),
)

function save(values: FormValues) {
  // TODO backend : POST /defenses ou PUT /defenses/:id. Le backend doit revérifier les conflits
  // (salle, professeurs). Ici : enregistrement local en mémoire, perdu au rechargement.
  const data = toDefenseData(values)

  if (props.defense) updateDefense(props.defense.id, data)
  else addDefense({ ...data, duration: DEFAULT_DURATION })

  emit('update:modelValue', false)
  emit('saved', data.date)
}
</script>

<template>
  <EntityFormModal
    :modelValue="modelValue"
    :title="isEdit ? 'Modifier la soutenance' : 'Planifier une soutenance'"
    :subtitle="
      isEdit
        ? 'Mettez à jour la date, le jury ou la salle.'
        : 'Définissez la date, l’heure, le projet, le jury et la salle avant validation.'
    "
    :icon="isEdit ? Pencil : CalendarDays"
    :fields="fields"
    :initialValues="initialValues"
    :submitLabel="isEdit ? 'Enregistrer' : 'Enregistrer'"
    notice="Choisissez le projet, les membres du jury et la salle pour cette soutenance."
    footerNote="Tous les champs sont obligatoires."
    @update:modelValue="emit('update:modelValue', $event)"
    @submit="save"
  />
</template>