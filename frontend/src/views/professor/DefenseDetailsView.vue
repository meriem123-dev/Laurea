<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, watch } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { toast } from "vue-sonner";
import { ArrowLeft, CalendarDays, GraduationCap, MapPin } from "@lucide/vue";
import BaseAlert from "../../components/common/BaseAlert.vue";
import BaseBadge from "../../components/common/BaseBadge.vue";
import BaseCard from "../../components/common/BaseCard.vue";
import EmptyState from "../../components/common/EmptyState.vue";
import InitialsAvatar from "../../components/common/InitialsAvatar.vue";
import DeliberationPanel from "../../components/evaluations/DeliberationPanel.vue";
import EvaluationGrid, {
  type GridJuror,
} from "../../components/evaluations/EvaluationGrid.vue";
import JuryMemberCard from "../../components/evaluations/JuryMemberCard.vue";
import PageHeader from "../../components/layout/PageHeader.vue";
import { formatLongDay } from "../../utils/calendar";
import { totalCoefficient } from "../../utils/grading";
import { JURY_ROLE_META } from "../../utils/juryRole";
import { PROJECT_STATUS_META } from "../../utils/projectStatus";
import { useEvaluationStore } from "./stores/evaluation.store"; // adapte le chemin

const CURSUS_LABELS = { MASTER: "Master", INGENIEUR: "Ingénieur" } as const;

const route = useRoute();
const store = useEvaluationStore();
const { data, loading, error } = storeToRefs(store);

const defenseId = computed(() => Number(route.params.id));
onMounted(() => store.load(defenseId.value));
watch(defenseId, (id) => store.load(id));
onBeforeUnmount(() => store.flush()); // n'oublie pas les dernières saisies

const initialsOf = (p: { firstName: string; lastName: string }) =>
  `${p.firstName[0] ?? ""}${p.lastName[0] ?? ""}`.toUpperCase();

const criteria = computed(() => data.value?.criteria ?? []);
const jurors = computed(() => data.value?.jurors ?? []);
const student = computed(() => data.value?.defense.students[0]);
const studentNames = computed(() =>
  (data.value?.defense.students ?? [])
    .map((s) => `${s.firstName} ${s.lastName}`)
    .join(", "),
);
const roomLocation = computed(() => {
  const room = data.value?.defense.room;
  return room ? [room.block, room.pole].filter(Boolean).join(" · ") : "";
});

const currentId = computed(() => data.value?.me.teacherId ?? "");
const isJuror = computed(() => data.value?.me.isJuror ?? false);
const isPresident = computed(() => data.value?.me.isPresident ?? false);
const isSupervisor = computed(() => data.value?.me.isSupervisor ?? false)
const locked = computed(() => data.value?.locked ?? false);

const gridJurors = computed<GridJuror[]>(() =>
  jurors.value.map((juror) => ({
    id: juror.id,
    name: juror.name,
    roleLabel: JURY_ROLE_META[juror.role].label,
    scores: juror.scores,
    grade: juror.grade,
  })),
);

const completeCount = computed(
  () =>
    jurors.value.filter((juror) => juror.filled >= criteria.value.length)
      .length,
);
const canEditGrid = computed(() => isJuror.value && !locked.value);

const average = computed(() => data.value?.average ?? null);
const retained = computed(() => data.value?.finalGrade ?? null);
const deviation = computed(() => data.value?.deviation ?? false);

const blockedReason = computed(() => {
  if (!isPresident.value)
    return "Seul le président du jury peut valider et verrouiller la note.";
  if (average.value === null)
    return "Tous les jurés doivent d’abord compléter leur grille.";
  if (deviation.value && !data.value?.justification.trim()) {
    return "Justifiez l’ajustement de la note pour pouvoir valider.";
  }
  return "";
});
const canLock = computed(
  () => !locked.value && retained.value !== null && blockedReason.value === "",
);

const gridAlert = computed(() => {
  if (locked.value) return 'La note est verrouillée : les évaluations ne sont plus modifiables.'
  if (isJuror.value) {
    return 'Votre colonne est modifiable. Les notes des autres jurés sont affichées en lecture seule pour la délibération.'
  }
  if (isSupervisor.value) {
    return 'En tant qu’encadrant, vous consultez les évaluations du jury en lecture seule.'
  }
  return 'Vous n’êtes pas membre du jury de cette soutenance : les évaluations sont en lecture seule.'
})

function onScore(criterionId: string, value: number | null) {
  store.setScore(criterionId, value);
}

async function onLock() {
  try {
    await store.lock();
    toast.success("Note validée et verrouillée.");
  } catch (e) {
    toast.error((e as Error).message);
  }
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

    <EmptyState
      v-if="!data"
      :message="
        loading ? 'Chargement…' : error || 'Cette soutenance est introuvable.'
      "
    />

    <template v-else>
      <PageHeader
        eyebrow="Espace professeur"
        title="Détails d’une soutenance"
        subtitle="Consultez le dossier, les évaluations du jury et préparez la délibération."
      >
        <BaseBadge
          v-if="data.defense.project"
          :tone="PROJECT_STATUS_META[data.defense.project.status].tone"
        >
          {{ PROJECT_STATUS_META[data.defense.project.status].label }}
        </BaseBadge>
      </PageHeader>

      <BaseCard>
        <div class="flex flex-wrap items-start gap-4">
          <InitialsAvatar
            v-if="student"
            :initials="initialsOf(student)"
            size="lg"
          />

          <div class="min-w-0 flex-1">
            <p class="text-xs text-text-muted">
              {{ studentNames }}
              <template v-if="student"> · {{ student.matricule }}</template>
            </p>
            <h2
              class="mt-1 break-words font-display text-2xl leading-snug text-ink"
            >
              {{ data.defense.project?.title }}
            </h2>
            <p class="mt-1 text-xs text-text-secondary">
              {{ data.defense.project?.domain }} ·
              {{ data.defense.project?.academicYear }}
            </p>
          </div>

          <RouterLink
            v-if="data.defense.project"
            :to="{
              path: '/professor/evaluations',
              query: { project: data.defense.project.id },
            }"
            class="inline-flex h-10 w-full items-center justify-center rounded-lg border border-border-strong bg-card px-4 text-sm font-semibold text-ink transition hover:bg-surface focus:outline-none focus-visible:ring-4 focus-visible:ring-ink/20 sm:w-auto"
          >
            Consulter le mémoire
          </RouterLink>
        </div>

        <dl
          class="mt-5 grid grid-cols-1 gap-4 border-t border-border pt-5 sm:grid-cols-3"
        >
          <div class="flex min-w-0 items-start gap-3">
            <GraduationCap
              class="mt-0.5 h-4 w-4 shrink-0 text-text-muted"
              aria-hidden="true"
            />
            <div class="min-w-0">
              <dt
                class="text-[0.625rem] font-bold uppercase tracking-[0.14em] text-text-muted"
              >
                Cursus
              </dt>
              <dd class="mt-0.5 text-sm font-semibold text-ink">
                {{
                  student
                    ? `${CURSUS_LABELS[student.cursus]} · ${student.speciality}`
                    : "—"
                }}
              </dd>
            </div>
          </div>

          <div class="flex min-w-0 items-start gap-3">
            <CalendarDays
              class="mt-0.5 h-4 w-4 shrink-0 text-text-muted"
              aria-hidden="true"
            />
            <div class="min-w-0">
              <dt
                class="text-[0.625rem] font-bold uppercase tracking-[0.14em] text-text-muted"
              >
                Date et heure
              </dt>
              <dd class="mt-0.5 text-sm font-semibold text-ink">
                {{ formatLongDay(data.defense.date) }}<br />
                <span class="font-normal tabular-nums text-text-secondary">
                  {{ data.defense.time }} - {{ data.defense.endTime }}
                </span>
              </dd>
            </div>
          </div>

          <div class="flex min-w-0 items-start gap-3">
            <MapPin
              class="mt-0.5 h-4 w-4 shrink-0 text-text-muted"
              aria-hidden="true"
            />
            <div class="min-w-0">
              <dt
                class="text-[0.625rem] font-bold uppercase tracking-[0.14em] text-text-muted"
              >
                Lieu
              </dt>
              <dd class="mt-0.5 text-sm font-semibold text-ink">
                {{ data.defense.room?.name ?? "—" }}<br />
                <span class="font-normal text-text-secondary">
                  {{ data.defense.room ? roomLocation : "" }}
                </span>
              </dd>
            </div>
          </div>
        </dl>
      </BaseCard>

      <section aria-labelledby="jury-title" class="flex flex-col gap-3">
        <div class="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="jury-title" class="font-display text-xl text-ink">
            Membres du jury
          </h2>
          <p class="text-xs text-text-muted">
            {{ jurors.length }} membres · {{ completeCount }}
            {{
              completeCount > 1
                ? "évaluations complètes"
                : "évaluation complète"
            }}
          </p>
        </div>

        <ul class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <li v-for="juror in jurors" :key="juror.id" class="min-w-0">
            <JuryMemberCard
              :name="juror.name"
              :initials="initialsOf(juror)"
              :roleLabel="JURY_ROLE_META[juror.role].label"
              :filled="juror.filled"
              :total="criteria.length"
              :isYou="juror.id === currentId"
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
              {{ criteria.length }} critères · Σ coefficients
              {{ totalCoefficient(criteria) }}. Chaque juré renseigne sa propre
              grille.
            </p>
          </div>
          <BaseBadge tone="neutral" :dot="false">
            {{ CURSUS_LABELS[data.cursus] }} · Notes sur 20
          </BaseBadge>
        </header>

        <div class="px-5 pt-4 sm:px-6">
          <BaseAlert>{{ gridAlert }}</BaseAlert>
        </div>

        <div class="mt-4">
          <EvaluationGrid
            :criteria="criteria"
            :jurors="gridJurors"
            :currentId="currentId"
            :editable="canEditGrid"
            @score="onScore"
          />
        </div>
      </BaseCard>

      <DeliberationPanel
        :members="
          jurors.map((j) => ({ id: j.id, name: j.name, grade: j.grade }))
        "
        :average="average"
        :finalGrade="retained"
        :justification="data.justification"
        :observations="data.observations"
        :locked="locked"
        :deviation="deviation"
        :canLock="canLock"
        :blockedReason="blockedReason"
        @update:finalGrade="store.saveDeliberation({ finalGrade: $event })"
        @update:justification="
          store.saveDeliberation({ justification: $event })
        "
        @update:observations="store.saveDeliberation({ observations: $event })"
        @lock="onLock"
      />
    </template>
  </div>
</template>
