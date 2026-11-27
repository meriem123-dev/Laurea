import { computed, onMounted, ref } from "vue";
import * as dashboardApi from "../api/dashboard.api";
import type { ProfessorDashboardDto } from "../api/dashboard.api";
import { getErrorMessage } from "../../../utils/apiError";
import { formatDayMonth } from "../../../utils/format";
import { parseISO, todayISO } from "../../../utils/calendar";
import type { ProfessorStat, ProfessorTodo } from "../../../types/dashboard";

const plural = (n: number, word: string) => `${n} ${word}${n > 1 ? "s" : ""}`;

// "dans 3 jours", "demain", "aujourd'hui"
function fromToday(iso: string): string {
  const days = Math.round(
    (parseISO(iso).getTime() - parseISO(todayISO()).getTime()) / 86_400_000,
  );
  if (days <= 0) return "aujourd’hui";
  if (days === 1) return "demain";
  return `dans ${days} jours`;
}

// Tableau de bord enseignant : chiffres clés, prochaines soutenances et actions à faire,
// mis dans les formes déjà attendues par StatCard, UpcomingDefensesCard et ProfessorTodosCard
export function useProfessorDashboard() {
  const data = ref<ProfessorDashboardDto | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function load() {
    loading.value = true;
    error.value = null;
    try {
      data.value = await dashboardApi.fetchProfessorDashboard();
    } catch (e) {
      error.value = getErrorMessage(
        e,
        "Impossible de charger le tableau de bord.",
      );
    } finally {
      loading.value = false;
    }
  }

  onMounted(load);

  const stats = computed<ProfessorStat[]>(() => {
    const d = data.value;
    return [
      {
        id: "supervised",
        label: "Projets encadrés",
        value: d?.supervised ?? 0,
        hint: d?.pendingDocuments
          ? `${plural(d.pendingDocuments, "rapport")} à examiner`
          : "Aucun rapport en attente",
      },
      {
        id: "upcoming",
        label: "Soutenances à venir",
        value: d?.upcomingCount ?? 0,
        hint: d?.nextDefenseDate
          ? `Prochaine ${fromToday(d.nextDefenseDate)}`
          : "Aucune soutenance prévue",
      },
      {
        id: "juries",
        label: "Participations aux jurys",
        value: d?.juryCount ?? 0,
        hint: d?.toConfirm
          ? `${plural(d.toConfirm, "invitation")} à confirmer`
          : "Président ou juré",
      },
    ];
  });

  const upcoming = computed(() => data.value?.upcoming ?? []);

  const upcomingSubtitle = computed(() => {
    const first = upcoming.value[0];
    return first
      ? `À partir du ${formatDayMonth(first.date)}`
      : "Rien de prévu pour le moment";
  });

  // seules les actions à faire sont affichées (sinon : « Rien à traiter pour le moment »)
  const todos = computed<ProfessorTodo[]>(() => {
    const d = data.value;
    if (!d) return [];
    const list: ProfessorTodo[] = [];
    if (d.evaluationsToEnter > 0) {
      list.push({
        id: "evaluations",
        count: d.evaluationsToEnter,
        label:
          d.evaluationsToEnter > 1
            ? "évaluations à saisir"
            : "évaluation à saisir",
        description: d.oldestEvaluationDate
          ? `Soutenance du ${formatDayMonth(d.oldestEvaluationDate)} à noter`
          : "Soutenances passées à noter",
        to: "/professor/evaluations",
      });
    }
    if (d.pendingDocuments > 0) {
      list.push({
        id: "reports",
        count: d.pendingDocuments,
        label:
          d.pendingDocuments > 1 ? "rapports à examiner" : "rapport à examiner",
        description: "Nouveaux dépôts étudiants",
        to: "/professor/projects",
      });
    }
    return list;
  });

  // une seule priorité, la plus urgente
  const priority = computed(() => {
    const d = data.value;
    if (!d) return "";
    if (d.toConfirm > 0) {
      return `Confirmer votre présence ${d.toConfirm > 1 ? `à ${d.toConfirm} soutenances` : "à une soutenance"} (Mes soutenances).`;
    }
    if (d.evaluationsToEnter > 0)
      return "Saisir les évaluations des soutenances déjà passées.";
    if (d.pendingDocuments > 0)
      return "Examiner les nouveaux dépôts de vos étudiants.";
    if (d.nextDefenseDate) {
      return `Préparer la soutenance du ${formatDayMonth(d.nextDefenseDate)}.`;
    }
    return "";
  });

  return {
    loading,
    error,
    stats,
    upcoming,
    upcomingSubtitle,
    todos,
    priority,
    reload: load,
  };
}
