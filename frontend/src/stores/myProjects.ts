import { defineStore } from "pinia";
import { ref } from "vue";
import * as api from "../api/myProjects.api";
import { getErrorMessage } from "../utils/apiError";
import type { MyProject } from "../types/project";
import type { ProjectDocument } from "../types/document";

export const useMyProjectsStore = defineStore("myProjects", () => {
  const items = ref<MyProject[]>([]);
  const documents = ref<Record<string, ProjectDocument[]>>({});
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchDocuments(projectId: string) {
    documents.value = {
      ...documents.value,
      [projectId]: await api.fetchDocuments(projectId),
    };
  }

  async function fetchAll() {
    loading.value = true;
    error.value = null;
    try {
      items.value = await api.fetchMyProjects();
      await Promise.all(items.value.map((p) => fetchDocuments(p.id)));
    } catch (e) {
      error.value = getErrorMessage(e, "Impossible de charger vos projets.");
    } finally {
      loading.value = false;
    }
  }

  function documentsOf(projectId: string): ProjectDocument[] {
    return documents.value[projectId] ?? [];
  }

  // laisse remonter l'erreur : la vue décide quoi afficher
  async function upload(projectId: string, file: File) {
    const doc = await api.uploadDocument(projectId, file);
    documents.value = {
      ...documents.value,
      [projectId]: [doc, ...documentsOf(projectId)],
    };
    return doc;
  }

  // évaluation (enseignant) : le serveur renvoie le document à jour (statut, date)
  async function evaluate(id: number, grade: number | null, comment: string) {
    const updated = await api.evaluateDocument(id, grade, comment);
    documents.value = Object.fromEntries(
      Object.entries(documents.value).map(([pid, docs]) => [
        pid,
        docs.map((d) => (d.id === id ? updated : d)),
      ]),
    );
    return updated;
  }

  function reset() {
    items.value = [];
    documents.value = {};
    error.value = null;
  }

  return { items, documents, loading, error, fetchAll, documentsOf, upload, evaluate, reset };
});