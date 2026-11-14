import type { ResultView } from '../composables/useResultsData'
import type { DefenseResult } from '../types/result'
import { publicationState } from './result'


// Forme minimale lue par l'adaptateur : les DTO admin et étudiant la respectent tous les deux
export interface ResultRowInput {
  defenseId: number
  date: string
  state: 'pending' | 'ready' | 'published'
  finalGrade: number | null
  observations: string
  project: { id: string; title: string; domain: string; academicYear: string }
  students: {
    id: string
    firstName: string
    lastName: string
    matricule: string
    cursus: string
    speciality: string
  }[]
  jury: {
    id: string
    title: string | null
    firstName: string
    lastName: string
    role: 'president' | 'examiner'
    grade: number | null
  }[]
}

// Transforme les lignes de l'API (une par soutenance) en ResultView (une par étudiant).
export function toResultViews(rows: ResultRowInput[]): ResultView[] {
  return rows.flatMap((row) => {
    // un juré dont la grille est incomplète n'a pas encore de note : c'est ce qui donne « Note manquante »
    const graders = row.jury
      .filter((juror) => juror.grade !== null)
      .map((juror) => ({
        professor: {
          id: juror.id,
          title: juror.title,
          firstName: juror.firstName,
          lastName: juror.lastName,
        } as unknown as ResultView['graders'][number]['professor'],
        value: juror.grade as number,
      }))

    const project = {
      id: row.project.id,
      title: row.project.title,
      domain: row.project.domain,
      academicYear: row.project.academicYear,
      studentIds: row.students.map((s) => s.id),
    } as unknown as ResultView['project']

    return row.students.map((student, index): ResultView => {
      const result: DefenseResult = {
        // identifiant unique par ligne étudiant (clé du tableau et sélection de la fiche)
        id: row.defenseId * 1000 + index,
        studentId: student.id,
        expectedGrades: row.jury.length,
        grades: graders.map((g) => ({
          professorId: (g.professor as unknown as { id: string }).id,
          value: g.value,
        })),
        published: row.state === 'published',
      }

      return {
        defenseId: row.defenseId,
        result,
        student: student as unknown as ResultView['student'],
        project,
        state: publicationState(result), // ta règle existante : publié / à valider / note manquante
        // la note retenue vient du serveur (moyenne pondérée, éventuellement ajustée par le président)
        finalGrade: row.finalGrade,
        graders,
      }
    })
  })
}