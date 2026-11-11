import { defineStore } from "pinia";
import { ref } from "vue";
import * as defensesApi from "../api/defenses.api";
import type { ApiDefense, DefensePayload } from "../api/defenses.api";
import { getErrorMessage } from "../../../utils/apiError";
import { useProjectsStore } from "./projects";

export const useDefensesStore = defineStore("defenses", () => {
  const items = ref<ApiDefense[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchAll() {
    loading.value = true;
    error.value = null;
    try {
      items.value = await defensesApi.fetchDefenses();
    } catch (e) {
      error.value = getErrorMessage(
        e,
        "Impossible de charger les soutenances.",
      );
    } finally {
      loading.value = false;
    }
  }

  // Planifier / supprimer change le statut du projet (planifié / validé) : on recharge les projets
  const refreshProjects = () => useProjectsStore().fetchAll();

  // Les actions d'écriture laissent remonter l'erreur : la vue décide quoi afficher
  async function create(data: DefensePayload) {
    const { defense, notifications } = await defensesApi.createDefense(data);
    items.value = [...items.value, defense];
    await refreshProjects();
    return notifications;
  }

  async function update(id: number, data: Partial<DefensePayload>) {
    const { defense, notifications } = await defensesApi.updateDefense(
      id,
      data,
    );
    items.value = items.value.map((d) => (d.id === id ? defense : d));
    await refreshProjects();
    return notifications;
  }

  async function remove(id: number) {
    const notifications = await defensesApi.deleteDefense(id);
    items.value = items.value.filter((d) => d.id !== id);
    await refreshProjects();
    return notifications;
  }

  return { items, loading, error, fetchAll, create, update, remove };
});
