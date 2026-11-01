<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { toast } from 'vue-sonner'
import { ArrowLeft, CalendarDays, GraduationCap, MapPin } from '@lucide/vue'
import BaseAlert from '../../components/common/BaseAlert.vue'
import BaseBadge from '../../components/common/BaseBadge.vue'
import BaseCard from '../../components/common/BaseCard.vue'
import EmptyState from '../../components/common/EmptyState.vue'
import InitialsAvatar from '../../components/common/InitialsAvatar.vue'
import DeliberationPanel from '../../components/evaluations/DeliberationPanel.vue'
import EvaluationGrid, { type GridJuror } from '../../components/evaluations/EvaluationGrid.vue'
import JuryMemberCard from '../../components/evaluations/JuryMemberCard.vue'
import PageHeader from '../../components/layout/PageHeader.vue'
import { useDefensesData } from '../../composables/useDefensesData'
import { useEvaluationsData } from '../../composables/useEvaluationsData'
import { CURRENT_PROFESSOR_ID } from '../../mocks/currentProfessor'
import { formatLongDay } from '../../utils/calendar'
import { defenseSlot, formatTime, juryIdsOf } from '../../utils/defense'
import { filledCount, juryAverage, totalCoefficient, weightedGrade } from '../../utils/grading'
import { JURY_ROLE_META } from '../../utils/juryRole'
import { displayName, initials as professorInitials } from '../../utils/professor'
import { PROJECT_STATUS_META } from '../../utils/projectStatus'
import { roomLocation } from '../../utils/room'
import { fullName, initials as studentInitials } from '../../utils/student'
import type { JuryRole } from '../../types/dashboard'

const CURSUS_LABELS = { MASTER: 'Master', INGENIEUR: 'Ingénieur' } as const

const route = useRoute()
const { views, professors } = useDefensesData()
const { criteria, evaluationOf, setScore, saveDeliberation, lock } = useEvaluationsData()

const defenseId = computed(() => Number(route.params.id))
const view = computed(() => views.value.find((item) => item.defense.id === defenseId.value))
const evaluation = computed(() => evaluationOf(defenseId.value))
const student = computed(() => view.value?.students[0])

const jurors = computed(() => {
  const current = view.value
  if (!current) return []
  return juryIdsOf(current.defense).flatMap((id) => {
    const professor = professors.find((item) => item.id === id)
    if (!professor) return []
    const role: JuryRole = id === current.defense.presidentId ? 'president' : 'examiner'
    const scores = evaluation.value.scores[id] ?? {}
    return [
      {
        professor,
        role,
        scores,
        filled: filledCount(scores, criteria),
        grade: weightedGrade(scores, criteria),
      },
    ]
  })
})

const gridJurors = computed<GridJuror[]>(() =>
  jurors.value.map((juror) => ({
    id: juror.professor.id,
    name: displayName(juror.professor),
    roleLabel: JURY_ROLE_META[juror.role].label,
    scores: juror.scores,
    grade: juror.grade,
  })),
)

const completeCount = computed(
  () => jurors.value.filter((juror) => juror.filled >= criteria.length).length,
)
const isJuror = computed(() => jurors.value.some((j) => j.professor.id === CURRENT_PROFESSOR_ID))
const isPresident = computed(() => view.value?.defense.presidentId === CURRENT_PROFESSOR_ID)
const canEditGrid = computed(() => isJuror.value && !evaluation.value.locked)

const average = computed(() => juryAverage(jurors.value.map((juror) => juror.grade)))
const retained = computed(() => evaluation.value.finalGrade ?? average.value)
const deviation = computed(
  () =>
    retained.value !== null &&
    average.value !== null &&
    Math.abs(retained.value - average.value) > 0.001,
)

const blockedReason = computed(() => {
  if (!isPresident.value) return 'Seul le président du jury peut valider et verrouiller la note.'
  if (average.value === null) return 'Tous les jurés doivent d’abord compléter leur grille.'
  if (deviation.value && !evaluation.value.justification.trim()) {
    return 'Justifiez l’ajustement de la note pour pouvoir valider.'
  }
  return ''
})
const canLock = computed(
  () => !evaluation.value.locked && retained.value !== null && blockedReason.value === '',
)

const gridAlert = computed(() => {
  if (evaluation.value.locked) {
    return 'La note est verrouillée : les évaluations ne sont plus modifiables.'
  }
  if (!isJuror.value) {
    return 'Vous n’êtes pas membre du jury de cette soutenance : les évaluations sont en lecture seule.'
  }
  return 'Votre colonne est modifiable. Les notes des autres jurés sont affichées en lecture seule pour la délibération.'
})

function onScore(criterionId: string, value: number | null) {
  // TODO backend : PUT /defenses/:id/evaluations/me
  setScore(defenseId.value, CURRENT_PROFESSOR_ID, criterionId, value)
}

function onLock() {
  // TODO backend : POST /defenses/:id/grade/lock (le serveur recalcule et vérifie le rôle)
  if (retained.value === null) return
  lock(defenseId.value, retained.value)
  toast.success('Note validée et verrouillée.')
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-6xl flex-col gap-6">
    <RouterLink
      to="/professor/defenses"
      class="inline-flex items-center gap-2 self-start text-xs font-semibold text-ink hover:underline"
    >
      <ArrowLeft class="h-3.5 w-3.5" aria-hidden="true" />
      Mes soutenances
    </RouterLink>

    <EmptyState v-if="!view" message="Cette soutenance est introuvable." />

    <template v-else>
      <PageHeader
        eyebrow="Espace professeur"
        title="Détails d’une soutenance"
        subtitle="Consultez le dossier, les évaluations du jury et préparez la délibération."
      >
        <BaseBadge v-if="view.project" :tone="PROJECT_STATUS_META[view.project.status].tone">
          {{ PROJECT_STATUS_META[view.project.status].label }}
        </BaseBadge>
      </PageHeader>

      <BaseCard>
        <div class="flex flex-wrap items-start gap-4">
          <InitialsAvatar v-if="student" :initials="studentInitials(student)" size="lg" />

          <div class="min-w-0 flex-1">
            <p class="text-xs text-text-muted">
              {{ view.studentNames }}
              <template v-if="student"> · {{ student.matricule }}</template>
            </p>
            <h2 class="mt-1 break-words font-display text-2xl leading-snug text-ink">
              {{ view.project?.title }}
            </h2>
            <p class="mt-1 text-xs text-text-secondary">
              {{ view.project?.domain }} · {{ view.project?.academicYear }}
            </p>
          </div>

          <RouterLink
            v-if="view.project"
            :to="{ path: '/professor/evaluations', query: { project: view.project.id } }"
            class="inline-flex h-10 w-full items-center justify-center rounded-lg border border-border-strong bg-card px-4 text-sm font-semibold text-ink transition hover:bg-surface focus:outline-none focus-visible:ring-4 focus-visible:ring-ink/20 sm:w-auto"
          >
            Consulter le mémoire
          </RouterLink>
        </div>

        <dl class="mt-5 grid grid-cols-1 gap-4 border-t border-border pt-5 sm:grid-cols-3">
          <div class="flex min-w-0 items-start gap-3">
            <GraduationCap class="mt-0.5 h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" />
            <div class="min-w-0">
              <dt class="text-[0.625rem] font-bold uppercase tracking-[0.14em] text-text-muted">
                Cursus
              </dt>
              <dd class="mt-0.5 text-sm font-semibold text-ink">
                {{ student ? `${CURSUS_LABELS[student.cursus]} · ${student.specialty}` : '—' }}
              </dd>
            </div>
          </div>

          <div class="flex min-w-0 items-start gap-3">
            <CalendarDays class="mt-0.5 h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" />
            <div class="min-w-0">
              <dt class="text-[0.625rem] font-bold uppercase tracking-[0.14em] text-text-muted">
                Date et heure
              </dt>
              <dd class="mt-0.5 text-sm font-semibold text-ink">
                {{ formatLongDay(view.defense.date) }}<br />
                <span class="font-normal tabular-nums text-text-secondary">
                  {{ formatTime(defenseSlot(view.defense).start) }} –
                  {{ formatTime(defenseSlot(view.defense).end) }}
                </span>
              </dd>
            </div>
          </div>

          <div class="flex min-w-0 items-start gap-3">
            <MapPin class="mt-0.5 h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" />
            <div class="min-w-0">
              <dt class="text-[0.625rem] font-bold uppercase tracking-[0.14em] text-text-muted">
                Lieu
              </dt>
              <dd class="mt-0.5 text-sm font-semibold text-ink">
                {{ view.room?.name ?? '—' }}<br />
                <span class="font-normal text-text-secondary">
                  {{ view.room ? roomLocation(view.room) : '' }}
                </span>
              </dd>
            </div>
          </div>
        </dl>
      </BaseCard>

      <section aria-labelledby="jury-title" class="flex flex-col gap-3">
        <div class="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="jury-title" class="font-display text-xl text-ink">Membres du jury</h2>
          <p class="text-xs text-text-muted">
            {{ jurors.length }} membres · {{ completeCount }}
            {{ completeCount > 1 ? 'évaluations complètes' : 'évaluation complète' }}
          </p>
        </div>

        <ul class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <li v-for="juror in jurors" :key="juror.professor.id" class="min-w-0">
            <JuryMemberCard
              :name="displayName(juror.professor)"
              :initials="professorInitials(juror.professor)"
              :roleLabel="JURY_ROLE_META[juror.role].label"
              :filled="juror.filled"
              :total="criteria.length"
              :isYou="juror.professor.id === CURRENT_PROFESSOR_ID"
            />
          </li>
        </ul>
      </section>

      <BaseCard :padded="false" class="overflow-hidden">
        <header
          class="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4 sm:px-6"
        >
          <div class="min-w-0">
            <h2 class="font-display text-xl text-ink">Grille d’évaluation</h2>
            <p class="mt-1 text-xs text-text-muted">
              {{ criteria.length }} critères · Σ coefficients {{ totalCoefficient(criteria) }}.
              Chaque juré renseigne sa propre grille.
            </p>
          </div>
          <BaseBadge tone="neutral" :dot="false">
            {{ student ? CURSUS_LABELS[student.cursus] : 'Master' }} · Notes sur 20
          </BaseBadge>
        </header>

        <div class="px-5 pt-4 sm:px-6">
          <BaseAlert>{{ gridAlert }}</BaseAlert>
        </div>

        <div class="mt-4">
          <EvaluationGrid
            :criteria="criteria"
            :jurors="gridJurors"
            :currentId="CURRENT_PROFESSOR_ID"
            :editable="canEditGrid"
            @score="onScore"
          />
        </div>
      </BaseCard>

      <DeliberationPanel
        :members="
          jurors.map((juror) => ({
            id: juror.professor.id,
            name: displayName(juror.professor),
            grade: juror.grade,
          }))
        "
        :average="average"
        :finalGrade="retained"
        :justification="evaluation.justification"
        :observations="evaluation.observations"
        :locked="evaluation.locked"
        :deviation="deviation"
        :canLock="canLock"
        :blockedReason="blockedReason"
        @update:finalGrade="saveDeliberation(defenseId, { finalGrade: $event })"
        @update:justification="saveDeliberation(defenseId, { justification: $event })"
        @update:observations="saveDeliberation(defenseId, { observations: $event })"
        @lock="onLock"
      />
    </template>
  </div>
</template>