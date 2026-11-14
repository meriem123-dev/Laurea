import { defineStore } from "pinia";
import { ref } from "vue";
import { fetchMyResult, type MyResultDto } from "../api/results.api";

export const useMyResultStore = defineStore("myResult", () => {
  const result = ref<MyResultDto | null>(null);
  const loading = ref(false);
  const error = ref("");

  async function load() {
    loading.value = true;
    error.value = "";
    try {
      result.value = await fetchMyResult();
    } catch {
      error.value = "Impossible de charger votre résultat. Réessayez plus tard.";
    } finally {
      loading.value = false;
    }
  }

  return { result, loading, error, load };
});