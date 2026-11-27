import { computed, onMounted, ref } from "vue";
import * as dashboardApi from "../api/dashboard.api";
import type { AdminDashboardDto } from "../api/dashboard.api";
import { getErrorMessage } from "../../../utils/apiError";
import type {
  DefenseBreakdownItem,
  StatSummary,
  TodoAction,
} from "../../../types/dashboard";

// accord du mot selon le nombre
const word = (n: number, singular: string, plural: string) =>
  n > 1 ? plural : singular;

// Tableau de bord admin : chiffres de l'API mis dans les formes attendues par
// StatCard, DefenseProgressCard, UpcomingDefensesCard et TodoActionsCard
export function useAdminDashboard() {
  const data = ref<AdminDashboardDto | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function load() {
    loading.value = true;
    error.value = null;
    try {
      data.value = await dashboardApi.fetchAdminDashboard();
    } catch (e) {
      error.value = getErrorMessage(e, "Impossible de charger le tableau de bord.");
    } finally {
      loading.value = false;
    }
  }

  onMounted(load);

  const stats = computed<StatSummary[]>(() => {
    const d = data.value;
    const withoutProject = d?.studentsWithoutProject ?? 0;
    const active = d?.activeTeachers ?? 0;
    const pending = d?.pendingProjects ?? 0;
    const upcoming = d?.upcomingDefenses ?? 0;
    return [
      {
        id: "students",
        label: "Étudiants",
        value: d?.studentsCount ?? 0,
        hint: `${withoutProject} sans projet`,
      },
      {
        id: "professors",
        label: "Professeurs",
        value: d?.teachersCount ?? 0,
        hint: `${active} ${word(active, "compte actif", "comptes actifs")}`,
      },
      {
        id: "projects",
        label: "Projets PFE",
        value: d?.projectsCount ?? 0,
        hint: pending ? `${pending} en attente de validation` : "Aucun en attente",
      },
      {
        id: "defenses",
        label: "Soutenances",
        value: d?.defensesCount ?? 0,
        hint: upcoming ? `${upcoming} à venir` : "Aucune à venir",
      },
    ];
  });

  // « Annulées » n'est pas affiché : une soutenance annulée est supprimée en base
  const breakdown = computed<DefenseBreakdownItem[]>(() => {
    const d = data.value;
    return [
      { id: "planned", label: "Planifiées", value: d?.upcomingDefenses ?? 0 },
      { id: "done", label: "Terminées", value: d?.doneDefenses ?? 0 },
      { id: "toPlan", label: "À planifier", value: d?.projectsToPlan ?? 0 },
    ];
  });

  const upcoming = computed(() => data.value?.upcoming ?? []);

  // seules les actions à faire sont affichées (sinon : « Rien à traiter pour le moment »)
  const todos = computed<TodoAction[]>(() => {
    const d = data.value;
    if (!d) return [];
    const list: TodoAction[] = [];
    if (d.pendingProjects > 0) {
      list.push({
        id: "pendingProjects",
        count: d.pendingProjects,
        label: word(d.pendingProjects, "projet en attente", "projets en attente"),
        description: "À examiner et valider",
        to: "/admin/projects",
      });
    }
    if (d.incompleteJuries > 0) {
      list.push({
        id: "incompleteJuries",
        count: d.incompleteJuries,
        label: word(d.incompleteJuries, "jury incomplet", "jurys incomplets"),
        description: "Un membre a refusé : à remplacer",
        to: "/admin/juries",
      });
    }
    if (d.resultsToPublish > 0) {
      list.push({
        id: "resultsToPublish",
        count: d.resultsToPublish,
        label: word(d.resultsToPublish, "résultat à publier", "résultats à publier"),
        description: "Notes verrouillées par le jury",
        to: "/admin/results",
      });
    }
    return list;
  });

  return { loading, error, stats, breakdown, upcoming, todos, reload: load };
}