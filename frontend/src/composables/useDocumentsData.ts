import { ref } from 'vue'
import { documents as documentsMock } from '../mocks/documents'
import type { ProjectDocument } from '../types/document'
import { todayISO } from '../utils/calendar'

// État partagé au niveau du module.
// TODO backend : remplacer par un store Pinia branché sur l'API (avec états chargement / erreur).
const documents = ref<ProjectDocument[]>(documentsMock.map((document) => ({ ...document })))

export function useDocumentsData() {
  function documentsOf(projectId: string): ProjectDocument[] {
    return documents.value.filter((document) => document.projectId === projectId)
  }

  // TODO backend : PATCH /documents/:id/evaluation
  function evaluate(id: number, grade: number | null, comment: string) {
    documents.value = documents.value.map((document) =>
      document.id === id ? { ...document, grade, comment } : document,
    )
  }

  // TODO backend : POST /projects/:id/documents (multipart). Ici : seul le nom et la taille sont
  // conservés en mémoire, le fichier lui-même n'est pas envoyé.
  function addDocument(projectId: string, file: { name: string; sizeKb: number }): ProjectDocument {
    const id = Math.max(0, ...documents.value.map((document) => document.id)) + 1
    const created: ProjectDocument = {
      id,
      projectId,
      name: file.name,
      submittedOn: todayISO(),
      sizeKb: file.sizeKb,
      grade: null,
      comment: '',
    }
    documents.value = [created, ...documents.value]
    return created
  }

  return { documents, documentsOf, evaluate, addDocument }
}