import type { ResultView } from '../composables/useResultsData'
import { escapeHtml } from './download'
import { displayName } from './professor'
import { PUBLICATION_META, formatGrade } from './result'
import { fullName } from './student'

const CSV_SEPARATOR = ';' // séparateur attendu par Excel en français

function csvCell(value: string): string {
  // Neutralise les formules (=, +, -, @) qu'Excel exécuterait à l'ouverture
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value
  return `"${safe.replace(/"/g, '""')}"`
}

export function resultsToCsv(views: ResultView[]): string {
  const header = [
    'Étudiant',
    'Matricule',
    'Projet',
    'Notes reçues',
    'Notes attendues',
    'Note finale',
    'Publication',
  ]
  const lines = views.map((view) => [
    view.student ? fullName(view.student) : '',
    view.student?.matricule ?? '',
    view.project?.title ?? '',
    String(view.result.grades.length),
    String(view.result.expectedGrades),
    view.finalGrade === null ? '' : formatGrade(view.finalGrade),
    PUBLICATION_META[view.state].label,
  ])

  // BOM : Excel reconnaît ainsi l'UTF-8 (accents)
  return '\uFEFF' + [header, ...lines].map((row) => row.map(csvCell).join(CSV_SEPARATOR)).join('\r\n')
}

/** Corps HTML du procès-verbal. Toutes les valeurs dynamiques sont échappées. */
export function buildReportHtml(view: ResultView, generatedOn: string): string {
  const student = view.student
  const rows = view.graders
    .map((grader) => {
      const name = grader.professor ? displayName(grader.professor) : 'Membre du jury'
      return `<tr><td>${escapeHtml(name)}</td><td class="num">${formatGrade(grader.value)} / 20</td></tr>`
    })
    .join('')

  const final =
    view.finalGrade === null
      ? ''
      : `<p class="final">Note finale : ${formatGrade(view.finalGrade)} / 20</p>`

  return `
    <h1>Procès-verbal de soutenance</h1>
    <p class="muted">Année académique ${escapeHtml(view.project?.academicYear ?? '')}</p>
    <dl>
      <dt>Étudiant</dt><dd>${escapeHtml(student ? fullName(student) : '')}</dd>
      <dt>Matricule</dt><dd>${escapeHtml(student?.matricule ?? '')}</dd>
      <dt>Spécialité</dt><dd>${escapeHtml(student?.specialty ?? '')}</dd>
      <dt>Projet de fin d’études</dt><dd>${escapeHtml(view.project?.title ?? '')}</dd>
    </dl>
    <h2>Notes attribuées par le jury</h2>
    <table>
      <thead><tr><th>Membre du jury</th><th class="num">Note</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    ${final}
    <p class="date">Fait le ${escapeHtml(generatedOn)}</p>
    <div class="signatures">
      <div>Le président du jury</div>
      <div>L’administration</div>
    </div>
  `
}