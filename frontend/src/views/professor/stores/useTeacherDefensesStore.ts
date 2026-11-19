import { defineStore } from "pinia";
import { ref } from "vue";
import { fetchMyDefenses, type TeacherDefenseDto } from "../api/defense.api";
import { getErrorMessage } from "../../../utils/apiError";

export const useTeacherDefensesStore = defineStore("teacherDefenses", () => {
  const items = ref<TeacherDefenseDto[]>([]);
  const loading = ref(false);
  const error = ref("");

  async function fetchAll() {
    loading.value = true;
    error.value = "";
    try {
      items.value = await fetchMyDefenses();
    } catch (e) {
      error.value = getErrorMessage(e, "Impossible de charger votre planning.");
    } finally {
      loading.value = false;
    }
  }

  return { items, loading, error, fetchAll };
});