import { computed, onMounted, ref } from "vue";
import * as dashboardApi from "../api/dashboard.api";
import type { StudentDashboardDto } from "../api/dashboard.api";
import { getErrorMessage } from "../../../utils/apiError";
import { formatFullDate } from "../../../utils/dateLabels";
import { formatDayMonth } from "../../../utils/format";
import type { ProjectStatus } from "../../../types/student";

export type StepState = "done" | "current" | "upcoming";

export interface ProjectStep {
  id: "proposed" | "validated" | "report" | "defense";
  label: string;
  state: StepState;
  detail: string;
}

// ordre du parcours : sert à savoir si une étape est passée
const ORDER: ProjectStatus[] = [
  "deposited",
  "validated",
  "planned",
  "defended",
  "graded",
  "closed",
];

// Tableau de bord étudiant : projet, soutenance, rapport et étapes, calculés à partir
// de GET /students/me/dashboard (les dates fictives des mocks ne sont plus utilisées)
export function useStudentDashboard() {
  const data = ref<StudentDashboardDto | null>(null);
  const loaded = ref(false); // évite d'afficher « aucun projet » pendant le chargement
  const error = ref<string | null>(null);

  async function load() {
    error.value = null;
    try {
      data.value = await dashboardApi.fetchStudentDashboard();
    } catch (e) {
      error.value = getErrorMessage(
        e,
        "Impossible de charger votre tableau de bord.",
      );
    } finally {
      loaded.value = true;
    }
  }

  onMounted(load);

  const project = computed(() => data.value?.project ?? null);
  const defense = computed(() => data.value?.defense ?? null);
  const step = computed(() =>
    project.value ? ORDER.indexOf(project.value.status) : -1,
  );

  // rapport noté (ou projet déjà soutenu) : l'étape « dépôt du rapport » est terminée
  const reportDone = computed(
    () =>
      (data.value?.documents.evaluatedCount ?? 0) > 0 ||
      step.value >= ORDER.indexOf("defended"),
  );

  // carte « Mon rapport » : état du dernier dépôt
  const report = computed(() => {
    const last = data.value?.documents.last;
    if (!last) {
      return {
        title: "Aucun dépôt",
        detail: "Déposez votre rapport au format PDF.",
        action: "Déposer maintenant",
      };
    }
    if (last.status === "EVALUATED") {
      return {
        title: "Rapport évalué",
        detail: `Note : ${last.grade}/20 · déposé le ${formatDayMonth(last.date)}`,
        action: "Voir mes dépôts",
      };
    }
    return {
      title: "Rapport déposé",
      detail: `Le ${formatDayMonth(last.date)} · en attente d’évaluation`,
      action: "Voir mes dépôts",
    };
  });

  // carte « Validation » : le sujet est-il approuvé par l'encadrant ?
  const validation = computed(() => {
    const p = project.value;
    if (!p) return { title: "", detail: "" };
    return p.status === "deposited"
      ? { title: "En attente de validation", detail: `Par ${p.supervisor}` }
      : { title: "Sujet approuvé", detail: `Validé par ${p.supervisor}` };
  });

  const steps = computed<ProjectStep[]>(() => {
    const s = step.value;
    const docs = data.value?.documents.count ?? 0;
    const validatedState: StepState = s >= 1 ? "done" : "current";

    let reportState: StepState = "upcoming";
    let reportDetail = "Après validation";
    if (reportDone.value) {
      reportState = "done";
      reportDetail = "Terminé";
    } else if (s >= 1) {
      reportState = "current";
      reportDetail =
        docs > 0
          ? `${docs} dépôt${docs > 1 ? "s" : ""} · en attente`
          : "À déposer";
    }

    let defenseState: StepState = "upcoming";
    if (s >= ORDER.indexOf("defended")) defenseState = "done";
    else if (s === ORDER.indexOf("planned") && reportDone.value)
      defenseState = "current";

    return [
      {
        id: "proposed",
        label: "Sujet proposé",
        state: "done",
        detail: "Terminé",
      },
      {
        id: "validated",
        label: "Validation du sujet",
        state: validatedState,
        detail: validatedState === "done" ? "Terminé" : "En attente",
      },
      {
        id: "report",
        label: "Dépôt du rapport",
        state: reportState,
        detail: reportDetail,
      },
      {
        id: "defense",
        label: "Soutenance finale",
        state: defenseState,
        detail: defense.value
          ? formatFullDate(defense.value.date)
          : "À planifier",
      },
    ];
  });

  return {
    data,
    loaded,
    error,
    project,
    defense,
    report,
    validation,
    steps,
    reload: load,
  };
}
