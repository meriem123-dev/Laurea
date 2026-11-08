import { defineStore } from "pinia";
import { ref } from "vue";
import * as projectsApi from "../api/projects.api";
import { getErrorMessage } from "../../../utils/apiError";
import { useStudentsStore } from "./students";
import type { Project, ProjectFormData } from "../../../types/project";
import type { ProjectStatus } from "../../../types/student";

export const useProjectsStore = defineStore("projects", () => {
  const items = ref<Project[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchAll() {
    loading.value = true;
    error.value = null;
    try {
      items.value = await projectsApi.fetchProjects();
    } catch (e) {
      error.value = getErrorMessage(e, "Impossible de charger les projets.");
    } finally {
      loading.value = false;
    }
  }

  // Le statut PFE des étudiants dépend du projet : on recharge leur liste
  const refreshStudents = () => useStudentsStore().fetchAll();

  // Les actions d'écriture laissent remonter l'erreur : la vue décide quoi afficher
  async function create(data: ProjectFormData) {
    const project = await projectsApi.createProject(data);
    items.value.unshift(project);
    await refreshStudents();
  }

  async function update(id: string, data: Partial<ProjectFormData>) {
    const updated = await projectsApi.updateProject(id, data);
    items.value = items.value.map((p) => (p.id === id ? updated : p));
    await refreshStudents();
  }

  async function changeStatus(id: string, status: ProjectStatus) {
    const updated = await projectsApi.updateProjectStatus(id, status);
    items.value = items.value.map((p) => (p.id === id ? updated : p));
    await refreshStudents();
  }

  async function remove(id: string) {
    await projectsApi.deleteProject(id);
    items.value = items.value.filter((p) => p.id !== id);
    await refreshStudents();
  }

  return { items, loading, error, fetchAll, create, update, changeStatus, remove };
});