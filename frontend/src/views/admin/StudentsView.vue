<script setup lang="ts">
import { computed, ref } from 'vue'
import { FileUp, Pencil, Plus, User, UserPlus } from '@lucide/vue'
import BaseButton from '../../components/common/BaseButton.vue'
import ConfirmDialog from '../../components/common/ConfirmDialog.vue'
import DetailsModal from '../../components/common/DetailsModal.vue'
import EntityFormModal from '../../components/forms/EntityFormModal.vue'
import PageHeader from '../../components/layout/PageHeader.vue'
import StudentFilters from '../../components/students/StudentFilters.vue'
import StudentsTable from '../../components/students/StudentsTable.vue'
import { useStudentFilters } from '../../composables/useStudentFilters'
import { students as studentsMock } from '../../mocks/students'
import { invitationNotice } from '../../utils/accountFields'
import { PROJECT_STATUS_META } from '../../utils/projectStatus'
import { fullName } from '../../utils/student'
import { buildStudentFields, studentToFormValues, toStudentData } from '../../utils/studentForm'
import type { FormValues } from '../../types/form'
import type { Student } from '../../types/student'

const CURSUS_LABELS = { MASTER: 'Master', INGENIEUR: 'Ingénieur' } as const

// TODO backend : charger la liste via api/ + store (avec états chargement / erreur)
const students = ref<Student[]>(studentsMock)
const { search, specialty, specialtyOptions, filtered } = useStudentFilters(students)

// Étudiant ciblé par la modification, le détail ou la suppression (null = création)
const selected = ref<Student | null>(null)
const isFormOpen = ref(false)
const isDetailsOpen = ref(false)
const isDeleteOpen = ref(false)

const isEdit = computed(() => selected.value !== null)

// En modification, l'étudiant ne doit pas entrer en conflit avec ses propres valeurs
const others = computed(() => students.value.filter((student) => student.id !== selected.value?.id))

const formFields = computed(() =>
  buildStudentFields({
    specialtyOptions: specialtyOptions.value.filter((option) => option.value !== ''),
    existingMatricules: others.value.map((student) => student.matricule),
    existingEmails: others.value.map((student) => student.email),
    includePassword: !isEdit.value,
  }),
)

const initialValues = computed(() =>
  selected.value ? studentToFormValues(selected.value) : undefined,
)

const detailsFields = computed(() => {
  const student = selected.value
  if (!student) return []
  return [
    { label: 'Adresse e-mail', value: student.email },
    { label: 'Matricule', value: student.matricule },
    { label: 'Spécialité', value: student.specialty },
    { label: 'Groupe', value: student.group },
    { label: 'Cursus', value: CURSUS_LABELS[student.cursus] },
  ]
})

const detailsBadge = computed(() => {
  const student = selected.value
  if (!student) return undefined
  const meta = PROJECT_STATUS_META[student.projectStatus]
  return { label: 'Statut PFE', text: meta.label, tone: meta.tone }
})

function openCreate() {
  selected.value = null
  isFormOpen.value = true
}

function openDetails(student: Student) {
  selected.value = student
  isDetailsOpen.value = true
}

function openEdit(student: Student) {
  selected.value = student
  isFormOpen.value = true
}

function editFromDetails() {
  isDetailsOpen.value = false
  isFormOpen.value = true
}

function openDelete(student: Student) {
  selected.value = student
  isDeleteOpen.value = true
}

function saveStudent(values: FormValues) {
  // TODO backend : POST /students (avec le mot de passe temporaire et l'e-mail d'invitation)
  // ou PUT /students/:id. Ici : modification locale, non enregistrée. Le mot de passe n'est
  // volontairement pas conservé.
  const data = toStudentData(values)
  const current = selected.value

  if (current) {
    students.value = students.value.map((student) =>
      student.id === current.id
        ? {
            ...student,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            matricule: data.matricule,
            specialty: data.specialty,
            group: data.group,
          }
        : student,
    )
  } else {
    const nextId = Math.max(0, ...students.value.map((student) => student.id)) + 1
    students.value = [
      {
        id: nextId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        matricule: data.matricule,
        specialty: data.specialty,
        group: data.group,
        cursus: 'MASTER', // valeur par défaut : le design ne contient pas de champ cursus
        projectStatus: 'deposited',
      },
      ...students.value,
    ]
  }
  isFormOpen.value = false
}

function deleteStudent() {
  // TODO backend : DELETE /students/:id. Ici : suppression locale, non enregistrée.
  const current = selected.value
  if (!current) return
  students.value = students.value.filter((student) => student.id !== current.id)
  isDeleteOpen.value = false
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-6xl flex-col gap-6">
    <PageHeader
      eyebrow="Ressources & cohortes"
      title="Gestion des étudiants"
      subtitle="Consultez, ajoutez et gérez les dossiers des étudiants."
    >
      <BaseButton size="md" class="w-full sm:w-auto" @click="openCreate">
        <Plus class="h-4 w-4" aria-hidden="true" />
        Ajouter un étudiant
      </BaseButton>
    </PageHeader>

    <StudentFilters
      v-model:search="search"
      v-model:specialty="specialty"
      :specialtyOptions="specialtyOptions"
    >
      <template #actions>
        <BaseButton variant="secondary" size="md" class="w-full sm:w-auto">
          <FileUp class="h-4 w-4" aria-hidden="true" />
          Importer
        </BaseButton>
      </template>
    </StudentFilters>

    <StudentsTable
      :students="filtered"
      promotion="2024–2025"
      @view="openDetails"
      @edit="openEdit"
      @delete="openDelete"
    />

    <EntityFormModal
      v-model="isFormOpen"
      :title="isEdit ? 'Modifier l’étudiant' : 'Créer un étudiant'"
      :subtitle="
        isEdit
          ? 'Mettez à jour les informations de l’étudiant.'
          : 'Renseignez les informations du nouvel étudiant.'
      "
      :icon="isEdit ? Pencil : UserPlus"
      :fields="formFields"
      :initialValues="initialValues"
      :submitLabel="isEdit ? 'Enregistrer' : 'Créer l’étudiant'"
      :notice="isEdit ? undefined : invitationNotice('L’étudiant')"
      @submit="saveStudent"
    />

    <DetailsModal
      v-model="isDetailsOpen"
      :title="selected ? fullName(selected) : ''"
      :subtitle="selected?.matricule"
      :icon="User"
      :fields="detailsFields"
      :badge="detailsBadge"
      editable
      @edit="editFromDetails"
    />

    <ConfirmDialog
      v-model="isDeleteOpen"
      title="Supprimer cet étudiant ?"
      :message="
        selected
          ? `Le dossier de ${fullName(selected)} (${selected.matricule}) sera supprimé. Cette action est irréversible.`
          : ''
      "
      confirmLabel="Supprimer"
      @confirm="deleteStudent"
    />
  </div>
</template>