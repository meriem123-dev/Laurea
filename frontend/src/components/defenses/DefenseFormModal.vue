<script setup lang="ts">
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
import { computed, ref, watch } from 'vue'
import { useAdminDefenses } from '../../composables/useAdminDefenses'
import type { DefenseNotifications } from '../../views/admin/api/defenses.api'
import { getErrorMessage } from '../../utils/apiError'

const props = defineProps<{
  modelValue: boolean
  defense: Defense | null // null = création
  initialDate: string // date proposée à la création
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  // notifications : mails envoyés par le back (convocations, rectificatifs)
  saved: [date: string, notifications: DefenseNotifications]
}>()

// branché sur l'API (le formulaire n'est utilisé que par les pages admin)
const { defenses, projects, professors, rooms, addDefense, updateDefense } = useAdminDefenses()

// Retours de l'API
const isSaving = ref(false)
const formError = ref<string | null>(null)
watch(
  () => props.modelValue,
  (open) => {
    if (open) formError.value = null
  },
)

const isEdit = computed(() => props.defense !== null)
const otherDefenses = computed(() => defenses.value.filter((item) => item.id !== props.defense?.id))

const fields = computed(() =>
  buildDefenseFields({
    // Un projet n'a qu'une soutenance, et il doit être validé (règle du back) :
    // on propose les projets validés pas encore planifiés (+ celui de la soutenance modifiée)
    projectOptions: projects.value
      .filter(
        (project) =>
          project.id === props.defense?.projectId ||
          (project.status === 'validated' &&
            !otherDefenses.value.some((item) => item.projectId === project.id)),
      )
      .map((project) => ({ value: String(project.id), label: project.title })),
    professorOptions: professors.value.map((professor) => ({
      value: String(professor.id),
      label: displayName(professor),
    })),
    roomOptions: rooms.value.map((room) => ({ value: String(room.id), label: room.name })),
    professors: professors.value,
    projects: projects.value,
    otherDefenses: otherDefenses.value,
    duration: props.defense?.duration ?? DEFAULT_DURATION,
  }),
)

const initialValues = computed(() =>
  props.defense ? defenseToFormValues(props.defense) : defaultDefenseValues(props.initialDate),
)

// POST /defenses ou PATCH /defenses/:id : le back revérifie les règles et les conflits,
// puis envoie les convocations par mail
async function save(values: FormValues) {
  const data = toDefenseData(values)
  formError.value = null
  isSaving.value = true
  try {
    const notifications = props.defense
      ? await updateDefense(props.defense.id, data)
      : await addDefense({ ...data, duration: DEFAULT_DURATION })
    emit('update:modelValue', false) // on ne ferme que si tout s'est bien passé
    emit('saved', data.date, notifications)
  } catch (e) {
    formError.value = getErrorMessage(e, 'Enregistrement impossible.')
  } finally {
    isSaving.value = false
  }
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
    :error="formError"
    :loading="isSaving"
    @update:modelValue="emit('update:modelValue', $event)"
    @submit="save"
  />
</template>