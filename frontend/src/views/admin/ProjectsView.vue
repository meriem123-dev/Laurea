<script setup lang="ts">
import { computed, ref } from 'vue'
import { BookOpen, Pencil, Plus } from '@lucide/vue'
import BaseButton from '../../components/common/BaseButton.vue'
import ConfirmDialog from '../../components/common/ConfirmDialog.vue'
import DetailsModal from '../../components/common/DetailsModal.vue'
import FilterBar from '../../components/common/FilterBar.vue'
import EntityFormModal from '../../components/forms/EntityFormModal.vue'
import PageHeader from '../../components/layout/PageHeader.vue'
import ProjectCard from '../../components/projects/ProjectCard.vue'
import { useProjectFilters } from '../../composables/useProjectFilters'
import { professors as professorsMock } from '../../mocks/professors'
import { projects as projectsMock } from '../../mocks/projects'
import { students as studentsMock } from '../../mocks/students'
import { displayName } from '../../utils/professor'
import { TEAM_TYPES, teamMembers } from '../../utils/project'
import {
  buildProjectFields,
  defaultProjectValues,
  projectToFormValues,
  toProjectData,
} from '../../utils/projectForm'
import { PROJECT_STATUS_META } from '../../utils/projectStatus'
import { fullName } from '../../utils/student'
import type { FormValues } from '../../types/form'
import type { Project } from '../../types/project'

// TODO backend : charger projets, étudiants et professeurs via api/ + stores
const projects = ref(projectsMock)
const students = ref(studentsMock)
const professors = ref(professorsMock)

const { search, status, domain, statusOptions, domainOptions, filtered } = useProjectFilters(
  projects,
  students,
)

const filterSelects = computed(() => [
  { key: 'status', ariaLabel: 'Filtrer par statut', options: statusOptions, modelValue: status.value },
  { key: 'domain', ariaLabel: 'Filtrer par domaine', options: domainOptions, modelValue: domain.value },
])

function setFilter(key: string, value: string) {
  if (key === 'status') status.value = value
  else if (key === 'domain') domain.value = value
}

// Projet ciblé par la modification, le dossier ou la suppression (null = création)
const selected = ref<Project | null>(null)
const isFormOpen = ref(false)
const isDetailsOpen = ref(false)
const isDeleteOpen = ref(false)

const isEdit = computed(() => selected.value !== null)

// Un étudiant ne peut être que dans un seul projet : on propose ceux qui n'en ont pas
// (et, en modification, ceux du projet modifié)
const takenStudentIds = computed(
  () =>
    new Set(
      projects.value
        .filter((project) => project.id !== selected.value?.id)
        .flatMap((project) => project.studentIds),
    ),
)

const studentOptions = computed(() =>
  students.value
    .filter((student) => !takenStudentIds.value.has(student.id))
    .map((student) => ({ value: String(student.id), label: `${fullName(student)} · ${student.matricule}` })),
)

const professorOptions = computed(() =>
  professors.value.map((professor) => ({ value: String(professor.id), label: displayName(professor) })),
)

const formFields = computed(() =>
  buildProjectFields({
    studentOptions: studentOptions.value,
    professorOptions: professorOptions.value,
  }),
)

const initialValues = computed(() =>
  selected.value ? projectToFormValues(selected.value) : defaultProjectValues(),
)

function professorLabel(id: number | null): string {
  const professor = professors.value.find((item) => item.id === id)
  return professor ? displayName(professor) : ''
}

const detailsFields = computed(() => {
  const project = selected.value
  if (!project) return []
  return [
    { label: 'Domaine', value: project.domain },
    { label: 'Année académique', value: project.academicYear },
    { label: 'Type d’équipe', value: TEAM_TYPES[project.teamType].label },
    { label: 'Entreprise', value: project.company },
    {
      label: 'Étudiants',
      value: teamMembers(project, students.value)
        .map((student) => fullName(student))
        .join(', '),
    },
    { label: 'Encadrant principal', value: professorLabel(project.supervisorId) },
    { label: 'Co-encadrant', value: professorLabel(project.coSupervisorId) },
    { label: 'Notes', value: project.notes },
  ]
})

const detailsBadge = computed(() => {
  const project = selected.value
  if (!project) return undefined
  const meta = PROJECT_STATUS_META[project.status]
  return { label: 'Statut', text: meta.label, tone: meta.tone }
})

// Avertit si le projet est déjà avancé dans le workflow
const deleteMessage = computed(() => {
  const project = selected.value
  if (!project) return ''
  const advanced =
    project.status === 'deposited'
      ? ''
      : ` Il est au statut « ${PROJECT_STATUS_META[project.status].label} ».`
  return `Le projet « ${project.title} » sera supprimé.${advanced} Cette action est irréversible.`
})

function openCreate() {
  selected.value = null
  isFormOpen.value = true
}

function openDetails(project: Project) {
  selected.value = project
  isDetailsOpen.value = true
}

function openEdit(project: Project) {
  selected.value = project
  isFormOpen.value = true
}

function editFromDetails() {
  isDetailsOpen.value = false
  isFormOpen.value = true
}

function openDelete(project: Project) {
  selected.value = project
  isDeleteOpen.value = true
}

function saveProject(values: FormValues) {
  // TODO backend : POST /projects ou PUT /projects/:id. Le backend doit vérifier qu'aucun étudiant
  // n'est déjà rattaché à un autre projet. Ici : modification locale, non enregistrée.
  const data = toProjectData(values)
  const current = selected.value

  if (current) {
    // Le statut du workflow est conservé tel quel
    projects.value = projects.value.map((project) =>
      project.id === current.id ? { ...project, ...data } : project,
    )
  } else {
    const nextId = Math.max(0, ...projects.value.map((project) => project.id)) + 1
    projects.value = [{ id: nextId, ...data, status: 'deposited' }, ...projects.value]
  }
  isFormOpen.value = false
}

function deleteProject() {
  // TODO backend : DELETE /projects/:id. Ici : suppression locale, non enregistrée.
  const current = selected.value
  if (!current) return
  projects.value = projects.value.filter((project) => project.id !== current.id)
  isDeleteOpen.value = false
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-6xl flex-col gap-6">
    <PageHeader
      eyebrow="Ressources & cohortes"
      title="Projets PFE"
      subtitle="Pilotez la validation, l’affectation des projets et la composition des équipes."
    >
      <BaseButton size="md" class="w-full sm:w-auto" @click="openCreate">
        <Plus class="h-4 w-4" aria-hidden="true" />
        Nouveau projet
      </BaseButton>
    </PageHeader>

    <FilterBar
      v-model:search="search"
      searchLabel="Rechercher un projet ou un étudiant"
      searchPlaceholder="Rechercher un projet ou étudiant…"
      :selects="filterSelects"
      @update:select="setFilter"
    />

    <p
      v-if="filtered.length === 0"
      class="rounded-xl border border-dashed border-border-strong bg-white/60 py-16 text-center text-sm text-text-muted"
    >
      Aucun projet ne correspond à votre recherche.
    </p>

    <ul v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <li
        v-for="(project, index) in filtered"
        :key="project.id"
        class="min-w-0 motion-safe:animate-fade-up"
        :style="{ animationDelay: `${Math.min(index, 8) * 60}ms` }"
      >
        <ProjectCard
          :project="project"
          :members="teamMembers(project, students)"
          :supervisor="professorLabel(project.supervisorId)"
          :coSupervisor="project.coSupervisorId ? professorLabel(project.coSupervisorId) : undefined"
          @view="openDetails"
          @edit="openEdit"
          @delete="openDelete"
        />
      </li>
    </ul>

    <EntityFormModal
      v-model="isFormOpen"
      size="lg"
      :title="isEdit ? 'Modifier le projet PFE' : 'Créer un projet PFE'"
      :subtitle="
        isEdit
          ? 'Mettez à jour le projet, l’équipe et les encadrants.'
          : 'Configurez le projet, l’équipe et les encadrants avant validation.'
      "
      :icon="isEdit ? Pencil : BookOpen"
      :fields="formFields"
      :initialValues="initialValues"
      :submitLabel="isEdit ? 'Enregistrer' : 'Créer le projet'"
      @submit="saveProject"
    />

    <DetailsModal
      v-model="isDetailsOpen"
      :title="selected?.title ?? ''"
      :subtitle="selected?.domain"
      :icon="BookOpen"
      :fields="detailsFields"
      :badge="detailsBadge"
      editable
      @edit="editFromDetails"
    />

    <ConfirmDialog
      v-model="isDeleteOpen"
      title="Supprimer ce projet ?"
      :message="deleteMessage"
      confirmLabel="Supprimer"
      @confirm="deleteProject"
    />
  </div>
</template>