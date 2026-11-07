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

  // Professor.id est un number (type inchangé) : on attribue un id d'affichage,
  // l'uuid du back sert pour les appels à l'API
  let lastId = 0;
  const withId = (professor: ProfessorData): ApiProfessor => ({
    ...professor,
    id: ++lastId,
  });
  const uuidOf = (id: number) => {
    const professor = items.value.find((p) => p.id === id);
    if (!professor) throw new Error("Professeur introuvable.");
    return professor.uuid;
  };

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

  // Les actions d'écriture laissent remonter l'erreur : la vue décide quoi afficher
  async function create(data: ProfessorPayload) {
    const { professor, emailSent } = await professorsApi.createProfessor(data);
    items.value.unshift(withId(professor));
    return emailSent;
  }

  async function update(id: number, data: ProfessorPayload) {
    const updated = await professorsApi.updateProfessor(uuidOf(id), data);
    items.value = items.value.map((p) =>
      p.id === id ? { ...updated, id } : p,
    );
  }

  async function remove(id: number) {
    await professorsApi.deleteProfessor(uuidOf(id));
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
