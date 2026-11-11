<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { BookOpen } from '@lucide/vue'
import BaseAlert from '../../components/common/BaseAlert.vue'
import DetailsModal from '../../components/common/DetailsModal.vue'
import EmptyState from '../../components/common/EmptyState.vue'
import FilterBar from '../../components/common/FilterBar.vue'
import PageHeader from '../../components/layout/PageHeader.vue'
import ProfessorProjectCard from '../../components/projects/ProfessorProjectCard.vue'
import { useProjectFilters } from '../../composables/useProjectFilters'
import { useMyProjectsStore } from '../../stores/myProjects'
import { displayName } from '../../utils/professor'
import { TEAM_TYPES, teamMembers } from '../../utils/project'
import { PROJECT_STATUS_META } from '../../utils/projectStatus'
import { SPECIALITY_LABELS } from '../../utils/speciality'
import { fullName } from '../../utils/student'
import type { MyProject, Project, ProjectPerson } from '../../types/project'
import type { Student } from '../../types/student'

const store = useMyProjectsStore()
const { items: myProjects, loading, error } = storeToRefs(store)
onMounted(() => store.fetchAll())

// l'équipe vient maintenant de l'API (team) : on l'aplatit pour les filtres et les cartes
const students = computed(() => myProjects.value.flatMap((p) => p.team) as unknown as Student[])

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

const selected = ref<MyProject | null>(null)
const isDetailsOpen = ref(false)

function openDetails(project: Project) {
  selected.value = myProjects.value.find((item) => item.id === project.id) ?? null
  isDetailsOpen.value = true
}

function personLabel(person: ProjectPerson | null): string {
  return person
    ? displayName({ title: person.title ?? undefined, name: `${person.firstName} ${person.lastName}` })
    : ''
}

const detailsFields = computed(() => {
  const project = selected.value
  if (!project) return []
  const docs = store.documentsOf(project.id)
  return [
    { label: 'Domaine', value: SPECIALITY_LABELS[project.domain] },
    { label: 'Année académique', value: project.academicYear },
    { label: 'Type d’équipe', value: TEAM_TYPES[project.teamType].label },
    { label: 'Entreprise', value: project.company },
    {
      label: 'Étudiants',
      value: teamMembers(project, students.value).map((student) => fullName(student)).join(', '),
    },
    { label: 'Encadrant principal', value: personLabel(project.supervisor) },
    { label: 'Co-encadrant', value: personLabel(project.coSupervisor) },
    {
      label: `Documents déposés (${docs.length})`,
      value: docs.map((d) => d.name).join(', '),
    },
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

    <p v-if="loading" class="text-sm text-text-muted">Chargement des projets…</p>
    <BaseAlert v-else-if="error" variant="error">{{ error }}</BaseAlert>

    <EmptyState
      v-else-if="filtered.length === 0"
      message="Aucun projet ne correspond à votre recherche."
    />

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
      :subtitle="selected ? SPECIALITY_LABELS[selected.domain] : ''"
      :icon="BookOpen"
      :fields="detailsFields"
      :badge="detailsBadge"
    />
  </div>
</template>