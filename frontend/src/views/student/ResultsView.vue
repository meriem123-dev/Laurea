<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { Award, BookOpen, Download, FileText } from '@lucide/vue'
import BaseAlert from '../../components/common/BaseAlert.vue'
import BaseBadge from '../../components/common/BaseBadge.vue'
import BaseButton from '../../components/common/BaseButton.vue'
import BaseCard from '../../components/common/BaseCard.vue'
import EmptyState from '../../components/common/EmptyState.vue'
import IconTile from '../../components/common/IconTile.vue'
import PageHeader from '../../components/layout/PageHeader.vue'
import { formatFullDate } from '../../utils/dateLabels'
import { openPrintWindow } from '../../utils/download'
import { coefficientShare } from '../../utils/grading'
import { formatGrade } from '../../utils/result'
import { toResultViews } from '../../utils/resultsAdapter'
import { PASS_MARK, buildReportHtml, mentionOf } from '../../utils/resultExport'
import { SPECIALITY_LABELS } from '../../utils/speciality'
import { useMyResultStore } from './stores/my-results' // adapte si ton store est ailleurs

const store = useMyResultStore()
const { result, loading, error } = storeToRefs(store)
onMounted(() => store.load())

// tout est null tant que l'administration n'a pas publié
const published = computed(() => (result.value?.published ? result.value : null))
const row = computed(() => published.value?.row ?? null)
const student = computed(
  () => row.value?.students.find((s) => s.id === published.value?.studentId) ?? null,
)
const project = computed(() => row.value?.project ?? null)
const criteria = computed(() => published.value?.criteria ?? [])
const view = computed(() =>
  row.value
    ? (toResultViews([row.value]).find((v) => v.student?.id === published.value?.studentId) ?? null)
    : null,
)

const grade = computed(() => row.value?.finalGrade ?? null)
const passed = computed(() => grade.value !== null && grade.value >= PASS_MARK)
const mention = computed(() => (grade.value !== null && passed.value ? mentionOf(grade.value) : ''))
const observations = computed(() => row.value?.observations.trim() ?? '')

const infos = computed(() => [
  { label: 'Date de soutenance', value: row.value ? formatFullDate(row.value.date) : '—' },
  { label: 'Décision du jury', value: passed.value ? 'Projet validé' : 'Projet non validé' },
  {
    label: 'Spécialité',
    value: student.value
      ? ((SPECIALITY_LABELS as Record<string, string>)[student.value.speciality] ??
        student.value.speciality)
      : '—',
  },
])

const pvError = ref('')

function downloadPv() {
  // TODO backend : le PV officiel (PDF signé, numéroté) doit être généré côté serveur.
  const current = view.value
  if (!current || !student.value) return
  const generatedOn = new Intl.DateTimeFormat('fr-FR').format(new Date())
  const title = `PV – ${student.value.firstName} ${student.value.lastName}`
  const opened = openPrintWindow(title, buildReportHtml(current, generatedOn))
  pvError.value = opened
    ? ''
    : 'Le navigateur a bloqué la fenêtre du PV. Autorisez les fenêtres pop-up pour ce site, puis réessayez.'
}

const labelClass = 'text-[0.625rem] font-bold uppercase tracking-[0.14em] text-text-muted'
</script>

<template>
  <div class="mx-auto flex w-full max-w-3xl flex-col gap-6">
    <PageHeader
      eyebrow="Résultat publié"
      title="Mes résultats"
      subtitle="Consultez votre résultat final après validation par le jury."
    >
      <BaseBadge tone="neutral" :dot="false">Vue étudiante</BaseBadge>
    </PageHeader>

    <BaseAlert v-if="error" variant="error">{{ error }}</BaseAlert>

    <EmptyState v-else-if="loading" message="Chargement de votre résultat…" />

    <EmptyState
      v-else-if="result && !result.hasDefense"
      message="Aucun résultat n’est rattaché à votre compte pour le moment."
    />

    <BaseAlert v-else-if="!published" title="Résultat non disponible">
      Votre note finale et le procès-verbal seront visibles ici une fois les notes du jury validées
      et publiées.
    </BaseAlert>

    <template v-else>
      <BaseCard :padded="false" class="overflow-hidden motion-safe:animate-fade-up">
        <div class="bg-success-soft px-6 pb-8 pt-8 text-center">
          <span
            class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-card text-success-dark"
            aria-hidden="true"
          >
            <Award class="h-7 w-7" :stroke-width="1.5" />
          </span>

          <p :class="[labelClass, 'mt-4']">Résultat final publié</p>

          <p class="mt-2 font-display text-6xl leading-none tabular-nums text-ink">
            {{ formatGrade(grade!) }}<small class="ml-1 text-lg text-text-muted">/20</small>
          </p>

          <BaseBadge v-if="mention" tone="info" class="mt-4">Mention {{ mention }}</BaseBadge>
          <BaseBadge v-else-if="!passed" tone="danger" class="mt-4">Ajourné</BaseBadge>

          <h2 class="mt-5 font-display text-xl text-ink">
            Félicitations {{ student?.firstName }}
          </h2>
          <p v-if="project" class="mt-1 text-xs text-text-secondary">
            Votre projet « {{ project.title }} » a été évalué par le jury.
          </p>
        </div>

        <dl class="grid grid-cols-1 divide-y divide-border border-y border-border bg-surface sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div v-for="info in infos" :key="info.label" class="px-5 py-4 text-center">
            <dt :class="labelClass">{{ info.label }}</dt>
            <dd class="mt-1.5 text-sm font-semibold text-ink">{{ info.value }}</dd>
          </div>
        </dl>

        <div v-if="observations" class="px-6 py-5">
          <p :class="labelClass">Appréciation du jury</p>
          <p class="mt-2 border-l-2 border-primary-400 pl-3 text-sm italic leading-relaxed text-text-body">
            « {{ observations }} »
          </p>
        </div>
      </BaseCard>

      <BaseAlert v-if="pvError" variant="error">{{ pvError }}</BaseAlert>

      <div class="grid grid-cols-1 gap-4 motion-safe:animate-fade-up [animation-delay:100ms] md:grid-cols-2">
        <BaseCard v-if="project">
          <div class="flex items-center gap-4">
            <IconTile :icon="BookOpen" tone="blue" />
            <div class="min-w-0">
              <p :class="labelClass">Projet évalué</p>
              <p class="mt-1 truncate text-sm font-semibold text-ink">{{ project.title }}</p>
              <p class="text-xs text-text-muted">{{ project.academicYear }}</p>
            </div>
          </div>
        </BaseCard>

        <BaseCard>
          <div class="flex items-center gap-4">
            <IconTile :icon="FileText" tone="teal" />
            <div class="min-w-0 flex-1">
              <p :class="labelClass">Document officiel</p>
              <p class="mt-1 truncate text-sm font-semibold text-ink">Procès-verbal de soutenance</p>
            </div>
            <BaseButton size="sm" class="shrink-0" @click="downloadPv">
              <Download class="h-3.5 w-3.5" aria-hidden="true" />
              Télécharger le PV
            </BaseButton>
          </div>
        </BaseCard>
      </div>

      <BaseCard
        title="Répartition indicative des critères"
        subtitle="Le détail des notes par critère n’est pas communiqué aux étudiants."
        class="motion-safe:animate-fade-up [animation-delay:200ms]"
      >
        <ul class="space-y-3">
          <li
            v-for="(criterion, index) in criteria"
            :key="criterion.id"
            class="flex items-center gap-4 rounded-lg border border-border px-4 py-3"
          >
            <span
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-xs font-bold tabular-nums text-ink"
              aria-hidden="true"
            >
              {{ String(index + 1).padStart(2, '0') }}
            </span>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-semibold text-ink">{{ criterion.label }}</p>
              <p class="truncate text-xs text-text-muted">{{ criterion.description }}</p>
            </div>
            <div class="shrink-0 text-right">
              <p class="text-xs font-semibold tabular-nums text-ink">
                {{ coefficientShare(criterion, criteria) }} %
              </p>
              <p class="text-[0.6875rem] text-text-muted">Pondération</p>
            </div>
          </li>
        </ul>
      </BaseCard>
    </template>
  </div>
</template>