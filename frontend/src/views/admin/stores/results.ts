import { defineStore } from "pinia";
import { ref } from "vue";
import * as resultsApi from "../api/results.api";
import type { ResultRowDto } from "../api/results.api";

function messageOf(e: unknown): string {
  const msg = (e as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
  return Array.isArray(msg) ? msg.join(", ") : (msg ?? "Une erreur est survenue.");
}

export const useResultsStore = defineStore("results", () => {
  const items = ref<ResultRowDto[]>([]);
  const loading = ref(false);
  const error = ref("");

  //chargments
  async function load() {
    loading.value = true;
    error.value = "";
    try {
      items.value = await resultsApi.fetchResults();
    } catch (e) {
      error.value = messageOf(e);
    } finally {
      loading.value = false;
    }
  }

  // publie toute la soutenance (tous les étudiants de l'équipe), puis recharge la liste
  async function publish(defenseId: number) {
    try {
      await resultsApi.setPublication(defenseId, true);
      await load();
    } catch (e) {
      throw new Error(messageOf(e));
    }
  }

  async function unpublish(defenseId: number) {
    try {
      await resultsApi.setPublication(defenseId, false);
      await load();
    } catch (e) {
      throw new Error(messageOf(e));
    }
  }

  return { items, loading, error, load, publish, unpublish };
});