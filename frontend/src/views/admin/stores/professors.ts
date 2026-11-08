import { defineStore } from "pinia";
import { ref } from "vue";
import * as professorsApi from "../api/professors.api";
import type {
  ApiProfessor,
  ProfessorData,
  ProfessorPayload,
} from "../api/professors.api";
import { getErrorMessage } from "../../../utils/apiError";
import type { ImportResult } from "../../../types/student";

export const useProfessorsStore = defineStore("professors", () => {
  const items = ref<ApiProfessor[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // l'id est directement l'uuid renvoyé par le back
  const withId = (professor: ProfessorData): ApiProfessor => ({
    ...professor,
    id: professor.uuid,
  });

  async function fetchAll() {
    loading.value = true;
    error.value = null;
    try {
      items.value = (await professorsApi.fetchProfessors()).map(withId);
    } catch (e) {
      error.value = getErrorMessage(
        e,
        "Impossible de charger les professeurs.",
      );
    } finally {
      loading.value = false;
    }
  }

  async function create(data: ProfessorPayload) {
    const { professor, emailSent } = await professorsApi.createProfessor(data);
    items.value.unshift(withId(professor));
    return emailSent;
  }

  async function update(id: string, data: ProfessorPayload) {
    const updated = await professorsApi.updateProfessor(id, data);
    items.value = items.value.map((p) => (p.id === id ? withId(updated) : p));
  }

  async function remove(id: string) {
    await professorsApi.deleteProfessor(id);
    items.value = items.value.filter((p) => p.id !== id);
  }

  async function importFile(file: File): Promise<ImportResult> {
    const result = await professorsApi.importProfessors(file);
    // on recharge la liste même si certaines lignes ont été rejetées
    await fetchAll();
    return result;
  }

  function downloadTemplate(): Promise<Blob> {
    return professorsApi.downloadProfessorsTemplate();
  }

  return {
    items,
    loading,
    error,
    fetchAll,
    create,
    update,
    remove,
    importFile,
    downloadTemplate,
  };
});
