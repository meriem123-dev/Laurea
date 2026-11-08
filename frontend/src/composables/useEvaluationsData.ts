import { ref } from 'vue'
import { CRITERIA, evaluations as evaluationsMock } from '../mocks/evaluations'
import type { CriterionScores, DefenseEvaluation } from '../types/evaluation'

// État partagé au niveau du module.
// TODO backend : remplacer par un store Pinia branché sur l'API (avec états chargement / erreur).
const evaluations = ref<DefenseEvaluation[]>(
  evaluationsMock.map((evaluation) => ({
    ...evaluation,
    scores: Object.fromEntries(
      Object.entries(evaluation.scores).map(([id, scores]) => [id, { ...scores }]),
    ),
  })),
)

function emptyEvaluation(defenseId: number): DefenseEvaluation {
  return { defenseId, scores: {}, finalGrade: null, justification: '', observations: '', locked: false }
}

type Deliberation = Partial<Pick<DefenseEvaluation, 'finalGrade' | 'justification' | 'observations'>>

export function useEvaluationsData() {
  function evaluationOf(defenseId: number): DefenseEvaluation {
    return evaluations.value.find((item) => item.defenseId === defenseId) ?? emptyEvaluation(defenseId)
  }

  function update(defenseId: number, change: (current: DefenseEvaluation) => DefenseEvaluation) {
    if (!evaluations.value.some((item) => item.defenseId === defenseId)) {
      evaluations.value = [...evaluations.value, emptyEvaluation(defenseId)]
    }
    evaluations.value = evaluations.value.map((item) =>
      item.defenseId === defenseId && !item.locked ? change(item) : item,
    )
  }

  // TODO backend : PUT /defenses/:id/evaluations/me (le serveur doit vérifier que l'utilisateur
  // est membre du jury et que la note n'est pas verrouillée)
  function setScore(
    defenseId: number,
    professorId: string,
    criterionId: string,
    value: number | null,
  ) {
    update(defenseId, (current) => {
      const mine: CriterionScores = { ...(current.scores[professorId] ?? {}) }
      if (value === null) delete mine[criterionId]
      else mine[criterionId] = value
      return { ...current, scores: { ...current.scores, [professorId]: mine } }
    })
  }

  function saveDeliberation(defenseId: number, patch: Deliberation) {
    update(defenseId, (current) => ({ ...current, ...patch }))
  }

  // TODO backend : POST /defenses/:id/grade/lock (réservé au président, recalcul côté serveur)
  function lock(defenseId: number, finalGrade: number) {
    update(defenseId, (current) => ({ ...current, finalGrade }))
    evaluations.value = evaluations.value.map((item) =>
      item.defenseId === defenseId ? { ...item, locked: true } : item,
    )
  }

  return { criteria: CRITERIA, evaluationOf, setScore, saveDeliberation, lock }
}