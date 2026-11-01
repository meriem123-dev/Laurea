import { ref } from 'vue'
import { documents as documentsMock } from '../mocks/documents'
import type { ProjectDocument } from '../types/document'

// État partagé au niveau du module.
// TODO backend : remplacer par un store Pinia branché sur l'API (avec états chargement / erreur).
const documents = ref<ProjectDocument[]>(documentsMock.map((document) => ({ ...document })))

export function useDocumentsData() {
  function documentsOf(projectId: number): ProjectDocument[] {
    return documents.value.filter((document) => document.projectId === projectId)
  }

  // TODO backend : PATCH /documents/:id/evaluation
  function evaluate(id: number, grade: number | null, comment: string) {
    documents.value = documents.value.map((document) =>
      document.id === id ? { ...document, grade, comment } : document,
    )
  }

  return { documents, documentsOf, evaluate }
}