import { computed, ref } from 'vue'
import { professors } from '../mocks/professors'
import { projects } from '../mocks/projects'
import { results as resultsMock } from '../mocks/results'
import { students } from '../mocks/students'
import type { Professor } from '../types/professor'
import type { Project } from '../types/project'
import type { DefenseResult, PublicationState } from '../types/result'
import type { Student } from '../types/student'
import { finalGrade, publicationState } from '../utils/result'

// État partagé au niveau du module.
// TODO backend : remplacer par un store Pinia branché sur l'API (avec états chargement / erreur).
const results = ref<DefenseResult[]>(resultsMock.map((result) => ({ ...result })))

// Une ligne par étudiant (une soutenance de binôme donne deux lignes)
export interface ResultView {
  defenseId: number
  result: DefenseResult
  student: Student | undefined
  project: Project | undefined
  state: PublicationState
  finalGrade: number | null
  graders: { professor: Professor | undefined; value: number }[]
}

function toView(result: DefenseResult): ResultView {
  return {
    defenseId: result.id, // données fictives : un résultat = une soutenance
    result,
    student: students.find((item) => item.id === result.studentId),
    project: projects.find((item) => item.studentIds.includes(result.studentId)),
    state: publicationState(result),
    finalGrade: finalGrade(result),
    graders: result.grades.map((grade) => ({
      professor: professors.find((item) => item.id === grade.professorId),
      value: grade.value,
    })),
  }
}

export function useResultsData() {
  const views = computed(() => results.value.map(toView))

  function publish(id: number) {
    results.value = results.value.map((result) =>
      result.id === id ? { ...result, published: true } : result,
    )
  }

  return { views, publish }
}