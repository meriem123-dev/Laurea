<script setup lang="ts">
import { computed, ref } from 'vue'
import { BookOpen } from '@lucide/vue'
import DetailsModal from '../../components/common/DetailsModal.vue'
import EmptyState from '../../components/common/EmptyState.vue'
import FilterBar from '../../components/common/FilterBar.vue'
import PageHeader from '../../components/layout/PageHeader.vue'
import ProfessorProjectCard from '../../components/projects/ProfessorProjectCard.vue'
import { useProjectFilters } from '../../composables/useProjectFilters'
import { professors } from '../../mocks/professors'
import { projects as projectsMock } from '../../mocks/projects'
import { students as studentsMock } from '../../mocks/students'
import { displayName } from '../../utils/professor'
import { TEAM_TYPES, teamMembers } from '../../utils/project'
import { PROJECT_STATUS_META } from '../../utils/projectStatus'
import { fullName } from '../../utils/student'
import type { Project } from '../../types/project'
import { CURRENT_PROFESSOR_ID } from '../../mocks/currentProfessor.js'



const students = ref(studentsMock)
const myProjects = computed(() =>
  projectsMock.filter(
    (project) =>
      project.supervisorId === CURRENT_PROFESSOR_ID ||
      project.coSupervisorId === CURRENT_PROFESSOR_ID,
  ),
)

const { search, status, domain, statusOptions, domainOptions, filtered } = useProjectFilters(
  myProjects,
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

const selected = ref<Project | null>(null)
const isDetailsOpen = ref(false)

function openDetails(project: Project) {
  selected.value = project
  isDetailsOpen.value = true
}

function professorLabel(id: string | null): string {
  const professor = professors.find((item) => item.id === id)
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
      value: teamMembers(project, students.value).map((student) => fullName(student)).join(', '),
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
</script>

<template>
  <div class="mx-auto flex w-full max-w-6xl flex-col gap-6">
    <PageHeader
      eyebrow="Espace enseignant"
      title="Mes projets encadrés"
      subtitle="Suivez l’avancement des projets et accompagnez vos étudiants."
    />

    <FilterBar
      v-model:search="search"
      searchLabel="Rechercher un projet ou un étudiant"
      searchPlaceholder="Rechercher un projet ou étudiant…"
      :selects="filterSelects"
      @update:select="setFilter"
    />

    <EmptyState v-if="filtered.length === 0" message="Aucun projet ne correspond à votre recherche." />

    <ul v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <li
        v-for="(project, index) in filtered"
        :key="project.id"
        class="min-w-0 motion-safe:animate-fade-up"
        :style="{ animationDelay: `${Math.min(index, 8) * 60}ms` }"
      >
        <ProfessorProjectCard
          :project="project"
          :members="teamMembers(project, students)"
          @view="openDetails"
        />
      </li>
    </ul>

    <DetailsModal
      v-model="isDetailsOpen"
      :title="selected?.title ?? ''"
      :subtitle="selected?.domain"
      :icon="BookOpen"
      :fields="detailsFields"
      :badge="detailsBadge"
    />
  </div>
</template>