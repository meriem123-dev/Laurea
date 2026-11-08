<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { toast } from 'vue-sonner'
import { FileText } from '@lucide/vue'
import BaseAlert from '../../components/common/BaseAlert.vue'
import BaseBadge from '../../components/common/BaseBadge.vue'
import BaseButton from '../../components/common/BaseButton.vue'
import BaseCard from '../../components/common/BaseCard.vue'
import EmptyState from '../../components/common/EmptyState.vue'
import IconTile from '../../components/common/IconTile.vue'
import InitialsAvatar from '../../components/common/InitialsAvatar.vue'
import DocumentPanel from '../../components/evaluations/DocumentPanel.vue'
import PageHeader from '../../components/layout/PageHeader.vue'
import { useDefensesData } from '../../composables/useDefensesData'
import { useDocumentsData } from '../../composables/useDocumentsData'
import { useProfessorProjects } from '../../composables/useProfessorProjects'
import { useResultsData } from '../../composables/useResultsData'
import { CURRENT_PROFESSOR_ID } from '../../mocks/currentProfessor'
import { students } from '../../mocks/students'
import { formatLongDay } from '../../utils/calendar'
import { formatFileSize } from '../../utils/document'
import { openPrintWindow } from '../../utils/download'
import { formatDayMonth } from '../../utils/format'
import { teamMembers } from '../../utils/project'
import { PROJECT_STATUS_META } from '../../utils/projectStatus'
import { formatGrade } from '../../utils/result'
import { buildReportHtml } from '../../utils/resultExport'
import { fullName, initials } from '../../utils/student'
import type { Project } from '../../types/project'

const route = useRoute()
const { projects } = useProfessorProjects(CURRENT_PROFESSOR_ID)
const { defenses } = useDefensesData()
const { documentsOf, evaluate } = useDocumentsData()
const { views: resultViews } = useResultsData()

// ?project=ID permet d'arriver directement sur un projet (lien « Consulter le mémoire »)
const queryId = typeof route.query.project === 'string' ? route.query.project : ''
const selectedProjectId = ref<string | null>(
  projects.value.find((item) => item.id === queryId)?.id ?? projects.value[0]?.id ?? null,
)


const selectedDocumentId = ref<number | null>(null)
const pvError = ref('')

const project = computed(
  () => projects.value.find((item) => item.id === selectedProjectId.value) ?? null,
)
const memberNames = computed(() => (project.value ? namesOf(project.value) : ''))
const defense = computed(() => defenses.value.find((item) => item.projectId === project.value?.id))
const documents = computed(() => (project.value ? documentsOf(project.value.id) : []))
const selectedDocument = computed(
  () => documents.value.find((item) => item.id === selectedDocumentId.value) ?? null,
)
const result = computed(
  () => resultViews.value.find((view) => view.project?.id === project.value?.id) ?? null,
)

function namesOf(item: Project): string {
  return teamMembers(item, students)
    .map((student) => fullName(student))
    .join(', ')
}

function initialsOf(item: Project): string {
  const first = teamMembers(item, students)[0]
  return first ? initials(first) : ''
}

function selectProject(id: string) {
  selectedProjectId.value = id
  selectedDocumentId.value = null
  pvError.value = ''
}

function saveEvaluation(grade: number | null, comment: string) {
  // TODO backend : PATCH /documents/:id/evaluation. Ici : enregistrement local en mémoire.
  if (selectedDocumentId.value === null) return
  evaluate(selectedDocumentId.value, grade, comment)
  toast.success('Évaluation enregistrée.')
}

function openPv() {
  // TODO backend : le PV officiel (PDF signé, numéroté) doit être généré côté serveur.
  const view = result.value
  if (!view) return
  const generatedOn = new Intl.DateTimeFormat('fr-FR').format(new Date())
  const title = `PV – ${view.student ? fullName(view.student) : 'soutenance'}`
  const opened = openPrintWindow(title, buildReportHtml(view, generatedOn))
  pvError.value = opened
    ? ''
    : 'Le navigateur a bloqué la fenêtre du PV. Autorisez les fenêtres pop-up pour ce site, puis réessayez.'
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-6xl flex-col gap-6">
    <PageHeader
      eyebrow="Suivi des projets"
      title="Documents et évaluations"
      subtitle="Évaluez chaque dépôt au fil de l’avancement du projet."
    >
      <div
        class="flex items-center gap-3 rounded-full border border-primary-200 bg-primary-50 px-4 py-2"
      >
        <span class="font-display text-2xl leading-none text-primary-600 tabular-nums">
          {{ projects.length }}
        </span>
        <span class="text-xs text-text-secondary">
          {{ projects.length > 1 ? 'projets encadrés' : 'projet encadré' }}
        </span>
      </div>
    </PageHeader>

    <EmptyState v-if="projects.length === 0" message="Aucun projet encadré pour le moment." />

    <template v-else-if="project">
      <ul class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Projets encadrés">
        <li v-for="item in projects" :key="item.id" class="min-w-0">
          <button
            type="button"
            :aria-pressed="item.id === selectedProjectId"
            class="flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
            :class="
              item.id === selectedProjectId
                ? 'border-primary-400 bg-primary-50'
                : 'border-border bg-card hover:border-border-strong'
            "
            @click="selectProject(item.id)"
          >
            <InitialsAvatar :initials="initialsOf(item)" size="sm" />
            <span class="min-w-0 flex-1">
              <span class="block truncate text-xs font-semibold text-ink">{{ item.title }}</span>
              <span class="block truncate text-[0.6875rem] text-text-muted">
                {{ namesOf(item) }}
              </span>
            </span>
            <BaseBadge tone="info" :dot="false">{{ documentsOf(item.id).length }}</BaseBadge>
          </button>
        </li>
      </ul>

      <BaseCard>
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div class="min-w-0">
            <p class="text-[0.625rem] font-bold uppercase tracking-[0.14em] text-text-muted">
              Projet de {{ memberNames }}
            </p>
            <h2 class="mt-1.5 break-words font-display text-2xl leading-snug text-ink">
              {{ project.title }}
            </h2>
            <p class="mt-1 text-xs text-text-secondary">
              <template v-if="defense">
                Soutenance prévue le {{ formatLongDay(defense.date).toLowerCase() }} à
                {{ defense.time }}
              </template>
              <template v-else>Soutenance non planifiée.</template>
            </p>
          </div>
          <BaseBadge :tone="PROJECT_STATUS_META[project.status].tone">
            {{ PROJECT_STATUS_META[project.status].label }}
          </BaseBadge>
        </div>
      </BaseCard>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BaseCard title="Dépôts du projet" subtitle="Chaque dépôt possède sa propre évaluation.">
          <template #action>
            <span class="shrink-0 text-xs text-text-muted">
              {{ documents.length }} {{ documents.length > 1 ? 'dépôts' : 'dépôt' }}
            </span>
          </template>

          <p v-if="documents.length === 0" class="py-6 text-center text-sm text-text-muted">
            Aucun dépôt pour ce projet.
          </p>

          <ul v-else class="space-y-3">
            <li
              v-for="document in documents"
              :key="document.id"
              class="flex items-center gap-3 rounded-lg border px-3 py-3 transition"
              :class="
                document.id === selectedDocumentId
                  ? 'border-primary-400 bg-primary-50'
                  : 'border-border'
              "
            >
              <IconTile :icon="FileText" tone="blue" size="sm" />

              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-semibold text-ink">{{ document.name }}</p>
                <p class="truncate text-xs text-text-muted">
                  Déposé le {{ formatDayMonth(document.submittedOn) }} ·
                  {{ formatFileSize(document.sizeKb) }}
                </p>
              </div>

              <BaseBadge :tone="document.grade === null ? 'neutral' : 'success'" :dot="false">
                {{ document.grade === null ? 'À noter' : `${formatGrade(document.grade)}/20` }}
              </BaseBadge>

              <BaseButton variant="secondary" size="sm" @click="selectedDocumentId = document.id">
                Voir
              </BaseButton>
            </li>
          </ul>
        </BaseCard>

        <DocumentPanel :document="selectedDocument" @save="saveEvaluation" />
      </div>

      <BaseAlert v-if="pvError" variant="error">{{ pvError }}</BaseAlert>

      <section
        v-if="result?.state === 'published' && result.finalGrade !== null"
        class="flex flex-wrap items-center gap-4 rounded-xl border border-success/30 bg-success-soft p-5"
      >
        <span
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-card font-display text-sm text-success-dark"
          aria-hidden="true"
        >
          PV
        </span>
        <div class="min-w-0 flex-1">
          <p class="text-[0.625rem] font-bold uppercase tracking-[0.14em] text-success-dark">
            Résultat final du projet
          </p>
          <p class="mt-1 font-display text-lg text-ink">
            Note finale · {{ formatGrade(result.finalGrade) }}/20
          </p>
          <p class="mt-0.5 text-xs text-text-secondary">
            La note finale et le procès-verbal ont été validés par le jury.
          </p>
        </div>
        <BaseButton size="md" class="w-full sm:w-auto" @click="openPv">Consulter le PV</BaseButton>
      </section>

      <BaseAlert v-else-if="result" title="Résultat final">
        Il sera disponible ici une fois les notes du jury validées et publiées.
      </BaseAlert>
    </template>
  </div>
</template>