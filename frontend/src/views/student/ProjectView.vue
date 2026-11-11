<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { toast } from 'vue-sonner'
import { BookOpen, FileText, Plus } from '@lucide/vue'
import BaseAlert from '../../components/common/BaseAlert.vue'
import BaseBadge from '../../components/common/BaseBadge.vue'
import BaseButton from '../../components/common/BaseButton.vue'
import BaseCard from '../../components/common/BaseCard.vue'
import EmptyState from '../../components/common/EmptyState.vue'
import IconTile from '../../components/common/IconTile.vue'
import InitialsAvatar from '../../components/common/InitialsAvatar.vue'
import PageHeader from '../../components/layout/PageHeader.vue'
import { openDocument } from '../../api/myProjects.api'
import { useMyProjectsStore } from '../../stores/myProjects'
import { getErrorMessage } from '../../utils/apiError'
import { formatFullDate } from '../../utils/dateLabels'
import { formatFileSize } from '../../utils/document'
import { displayName, initials as professorInitials } from '../../utils/professor'
import { PROJECT_STATUS_META } from '../../utils/projectStatus'
import { formatGrade } from '../../utils/result'
import { SPECIALITY_LABELS } from '../../utils/speciality'
import { fullName } from '../../utils/student'
import type { ProjectDocument } from '../../types/document'
import type { ProjectPerson } from '../../types/project'
import { DOCUMENT_STATUS_META, documentStatusOf } from '../../utils/documentStatus'
const MAX_FILE_MB = 10

const store = useMyProjectsStore()
const { items, loading, error } = storeToRefs(store)
onMounted(() => store.fetchAll())

// un étudiant a au plus un projet
const project = computed(() => items.value[0] ?? null)
const team = computed(() => project.value?.team ?? [])
const documents = computed(() => (project.value ? store.documentsOf(project.value.id) : []))

function toProfessor(p: ProjectPerson | null) {
  return p
    ? { title: p.title ?? undefined, name: `${p.firstName} ${p.lastName}`, specialty: p.specialty }
    : null
}
const supervisor = computed(() => toProfessor(project.value?.supervisor ?? null))
const coSupervisor = computed(() => toProfessor(project.value?.coSupervisor ?? null))

// Par défaut, le premier dépôt est sélectionné
const selectedId = ref<number | null>(null)
const selected = computed(
  () => documents.value.find((item) => item.id === selectedId.value) ?? documents.value[0] ?? null,
)

function statusOf(document: ProjectDocument) {
  return DOCUMENT_STATUS_META[documentStatusOf(document)]
}

// Dépôt d'un document
const fileInput = ref<HTMLInputElement | null>(null)
const uploadError = ref('')
const isUploading = ref(false)

async function onFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = '' // permet de redéposer le même fichier
  if (!file || !project.value) return

  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
  if (!isPdf) {
    uploadError.value = 'Seuls les fichiers PDF sont acceptés.'
    return
  }
  if (file.size > MAX_FILE_MB * 1024 * 1024) {
    uploadError.value = `Le fichier dépasse ${MAX_FILE_MB} Mo.`
    return
  }

  uploadError.value = ''
  isUploading.value = true
  try {
    const created = await store.upload(project.value.id, file)
    selectedId.value = created.id
    toast.success('Document déposé.')
  } catch (e) {
    uploadError.value = getErrorMessage(e, 'Dépôt impossible.')
  } finally {
    isUploading.value = false
  }
}

async function openPdf(document: ProjectDocument) {
  try {
    await openDocument(document.id)
  } catch (e) {
    toast.error(getErrorMessage(e, 'Impossible d’ouvrir le document.'))
  }
}

const labelClass = 'text-[0.625rem] font-bold uppercase tracking-[0.14em] text-text-muted'
</script>

<template>
  <div class="mx-auto flex w-full max-w-6xl flex-col gap-6">
    <PageHeader
      eyebrow="Espace étudiant"
      title="Mon projet PFE"
      subtitle="Consultez votre projet et déposez vos documents."
    >
      <BaseBadge tone="neutral" :dot="false">Vue étudiante</BaseBadge>
    </PageHeader>

    <p v-if="loading" class="text-sm text-text-muted">Chargement de votre projet…</p>

    <BaseAlert v-else-if="error" variant="error">
      {{ error }}
      <button type="button" class="ml-2 font-semibold underline" @click="store.fetchAll()">
        Réessayer
      </button>
    </BaseAlert>

    <EmptyState
      v-else-if="!project"
      message="Aucun projet n’est rattaché à votre compte pour le moment."
    />

    <template v-else>
      <BaseCard>
        <div class="flex items-start gap-4">
          <IconTile :icon="BookOpen" tone="blue" />

          <div class="min-w-0 flex-1">
            <BaseBadge :tone="PROJECT_STATUS_META[project.status].tone">
              {{ PROJECT_STATUS_META[project.status].label }}
            </BaseBadge>
            <h2 class="mt-2 break-words font-display text-2xl leading-snug text-ink">
              {{ project.title }}
            </h2>
            <p class="mt-1 text-xs text-text-muted">
              Projet PFE · {{ SPECIALITY_LABELS[project.domain] }} · {{ project.academicYear }}
            </p>
          </div>
        </div>

        <dl class="mt-5 grid grid-cols-1 gap-4 rounded-lg bg-surface p-4 sm:grid-cols-3">
          <div class="min-w-0">
            <dt :class="labelClass">{{ team.length > 1 ? 'Étudiants' : 'Étudiant' }}</dt>
            <dd class="mt-1.5 space-y-1">
              <p v-for="member in team" :key="member.id" class="text-sm text-ink">
                <span class="font-semibold">{{ fullName(member) }}</span>
                <span class="block text-xs text-text-muted">{{ member.matricule }}</span>
              </p>
            </dd>
          </div>

          <div class="min-w-0">
            <dt :class="labelClass">Encadrant</dt>
            <dd class="mt-1.5 text-sm text-ink">
              <span class="font-semibold">{{ supervisor ? displayName(supervisor) : '—' }}</span>
              <span v-if="supervisor" class="block text-xs text-text-muted">
                {{ supervisor.specialty }}
              </span>
              <span v-if="coSupervisor" class="mt-1 block text-xs text-text-secondary">
                Co-encadrant : {{ displayName(coSupervisor) }}
              </span>
            </dd>
          </div>

          <div class="min-w-0">
            <dt :class="labelClass">Entreprise</dt>
            <dd class="mt-1.5 text-sm font-semibold text-ink">{{ project.company || '—' }}</dd>
          </div>
        </dl>

        <div class="mt-5">
          <p :class="labelClass">Notes du projet</p>
          <p class="mt-1.5 text-sm leading-relaxed text-text-body">
            {{ project.notes || 'Aucune note pour le moment.' }}
          </p>
        </div>
      </BaseCard>

      <BaseCard
        title="Documents du projet"
        subtitle="Déposez les livrables requis avant les échéances."
      >
        <template #action>
          <BaseButton
            size="md"
            class="shrink-0"
            :loading="isUploading"
            :disabled="project.status === 'defended' || project.status === 'graded' || project.status === 'closed'"
            @click="fileInput?.click()"
          >
            <Plus class="h-4 w-4" aria-hidden="true" />
            Déposer un document
          </BaseButton>
          <input
            ref="fileInput"
            type="file"
            accept="application/pdf,.pdf"
            class="sr-only"
            tabindex="-1"
            aria-label="Choisir un document PDF à déposer"
            @change="onFile"
          />
        </template>

        <BaseAlert v-if="uploadError" variant="error" class="mb-4">{{ uploadError }}</BaseAlert>

        <p v-if="documents.length === 0" class="py-6 text-center text-sm text-text-muted">
          Aucun document déposé pour le moment.
        </p>

        <ul v-else class="space-y-3">
          <li v-for="document in documents" :key="document.id">
            <button
              type="button"
              :aria-pressed="document.id === selected?.id"
              class="flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
              :class="
                document.id === selected?.id
                  ? 'border-primary-400 bg-primary-50'
                  : 'border-border hover:border-border-strong'
              "
              @click="selectedId = document.id"
            >
              <IconTile :icon="FileText" tone="orange" size="sm" />

              <span class="min-w-0 flex-1">
                <span class="block truncate text-sm font-semibold text-ink">{{ document.name }}</span>
                <span class="block truncate text-xs text-text-muted">
                  PDF · {{ formatFileSize(document.sizeKb) }} · Déposé le
                  {{ formatFullDate(document.submittedOn) }}
                </span>
              </span>

              <BaseBadge :tone="statusOf(document).tone" class="hidden sm:inline-flex">
                {{ statusOf(document).label }}
              </BaseBadge>

              <span
                class="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border"
                :class="document.id === selected?.id ? 'border-ink' : 'border-border-strong'"
                aria-hidden="true"
              >
                <span v-if="document.id === selected?.id" class="h-2 w-2 rounded-full bg-ink" />
              </span>
            </button>
          </li>
        </ul>

        <section
          v-if="selected"
          class="mt-5 rounded-xl border p-5"
          :class="
            selected.grade === null
              ? 'border-dashed border-border-strong bg-card/60'
              : 'border-success/30 bg-success-soft'
          "
          aria-live="polite"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <p
                class="text-[0.625rem] font-bold uppercase tracking-[0.14em]"
                :class="selected.grade === null ? 'text-text-muted' : 'text-success-dark'"
              >
                Retour de l’encadrant
              </p>
              <p class="mt-1.5 truncate font-display text-lg text-ink">{{ selected.name }}</p>
            </div>
            <div class="flex shrink-0 items-center gap-3">
              <p
                v-if="selected.grade !== null"
                class="font-display text-3xl leading-none tabular-nums text-success-dark"
              >
                {{ formatGrade(selected.grade) }}<small class="text-sm text-text-muted">/20</small>
              </p>
              <BaseButton variant="secondary" size="sm" @click="openPdf(selected)">
                Ouvrir le PDF
              </BaseButton>
            </div>
          </div>

          <p v-if="selected.grade === null" class="mt-3 text-sm text-text-secondary">
            Ce dépôt n’a pas encore été évalué par votre encadrant.
          </p>

          <div v-else class="mt-4 flex items-start gap-3 rounded-lg bg-card p-4">
            <InitialsAvatar
              v-if="supervisor"
              :initials="professorInitials(supervisor)"
              size="sm"
            />
            <div class="min-w-0">
              <p class="text-xs font-semibold text-ink">
                {{ supervisor ? displayName(supervisor) : 'Encadrant' }}
              </p>
              <p class="mt-1 text-sm leading-relaxed text-text-body">
                {{ selected.comment || 'Aucun commentaire pour ce dépôt.' }}
              </p>
            </div>
          </div>

          <p class="mt-3 text-xs text-text-muted">
            Cette évaluation concerne uniquement ce dépôt. La note finale et le PV ne seront
            disponibles qu’après la soutenance.
          </p>
        </section>
      </BaseCard>
    </template>
  </div>
</template>