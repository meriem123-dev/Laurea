import { defineStore } from "pinia";
import { ref } from "vue";
import { juryAverage, weightedGrade } from "../../../utils/grading";
import * as api from "../api/evaluation.api";
import type { DeliberationPatch, EvaluationDto } from "../api/evaluation.api";

function messageOf(e: unknown): string {
  const msg = (e as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
  return Array.isArray(msg) ? msg.join(", ") : (msg ?? "Une erreur est survenue.");
}

// recalcul local pour un affichage instantané (le serveur reste la référence)
function recompute(d: EvaluationDto) {
  for (const j of d.jurors) {
    j.filled = Object.keys(j.scores).length;
    j.grade = weightedGrade(j.scores, d.criteria);
  }
  d.average = juryAverage(d.jurors.map((j) => j.grade));
  if (!d.adjusted) d.finalGrade = d.average;
  d.deviation =
    d.adjusted && d.finalGrade !== null && d.average !== null && Math.abs(d.finalGrade - d.average) > 0.001;
}

export const useEvaluationStore = defineStore("evaluation", () => {
  const data = ref<EvaluationDto | null>(null);
  const loading = ref(false);
  const saving = ref(false);
  const error = ref("");

  let pendingScores = new Map<string, number | null>();
  let pendingDelib: DeliberationPatch = {};
  let timer: ReturnType<typeof setTimeout> | undefined;

  const hasPending = () => pendingScores.size > 0 || Object.keys(pendingDelib).length > 0;

  async function load(id: number) {
    if (data.value?.defenseId !== id) data.value = null;
    loading.value = true;
    error.value = "";
    try {
      data.value = await api.fetchEvaluation(id);
    } catch (e) {
      error.value = messageOf(e);
    } finally {
      loading.value = false;
    }
  }

  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(() => void flush(), 500);
  }

  function setScore(criterionId: string, value: number | null) {
    const d = data.value;
    if (!d || !d.me.isJuror || d.locked) return;
    const mine = d.jurors.find((j) => j.id === d.me.teacherId);
    if (!mine) return;
    if (value === null) delete mine.scores[criterionId];
    else mine.scores[criterionId] = value;
    recompute(d);
    pendingScores.set(criterionId, value);
    schedule();
  }

  function saveDeliberation(patch: DeliberationPatch) {
    const d = data.value;
    if (!d || !d.me.isPresident || d.locked) return;
    if ("finalGrade" in patch) {
      d.adjusted = patch.finalGrade != null;
      d.finalGrade = patch.finalGrade ?? d.average;
    }
    if (patch.justification !== undefined) d.justification = patch.justification;
    if (patch.observations !== undefined) d.observations = patch.observations;
    recompute(d);
    Object.assign(pendingDelib, patch);
    schedule();
  }

  async function flush() {
    clearTimeout(timer);
    timer = undefined;
    const d = data.value;
    if (!d || !hasPending()) return;

    const scores = [...pendingScores].map(([criterionId, value]) => ({ criterionId, value }));
    const delib = pendingDelib;
    pendingScores = new Map();
    pendingDelib = {};

    saving.value = true;
    try {
      let fresh: EvaluationDto | undefined;
      if (scores.length) fresh = await api.saveMyScores(d.defenseId, scores);
      if (Object.keys(delib).length) fresh = await api.saveDeliberation(d.defenseId, delib);
      // si l'utilisateur a retapé pendant l'envoi, le prochain flush mettra à jour
      if (fresh && !hasPending()) data.value = fresh;
    } catch (e) {
      error.value = messageOf(e);
      await load(d.defenseId); // on revient à l'état réel du serveur
    } finally {
      saving.value = false;
    }
  }

  async function lock() {
    const d = data.value;
    if (!d) return;
    await flush();
    try {
      data.value = await api.lockEvaluation(d.defenseId);
    } catch (e) {
      throw new Error(messageOf(e));
    }
  }

  return { data, loading, saving, error, load, setScore, saveDeliberation, flush, lock };
});