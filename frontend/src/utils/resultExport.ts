import type { ResultView } from '../composables/useResultsData'
import { escapeHtml } from './download'
import { displayName } from './professor'
import { PUBLICATION_META, formatGrade } from './result'
import { fullName } from './student'

const CSV_SEPARATOR = ';' // séparateur attendu par Excel en français
const PASS_MARK = 10 // note minimale d'admission

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

function mentionOf(grade: number): string {
  if (grade >= 16) return 'Très bien'
  if (grade >= 14) return 'Bien'
  if (grade >= 12) return 'Assez bien'
  if (grade >= PASS_MARK) return 'Passable'
  return ''
}

/** Corps HTML du procès-verbal. Toutes les valeurs dynamiques sont échappées. */
export function buildReportHtml(view: ResultView, generatedOn: string): string {
  const student = view.student
  const year = view.project?.academicYear ?? ''
  const reference = `PV-${year.slice(0, 4) || new Date().getFullYear()}-${String(view.result.id).padStart(4, '0')}`

  const rows = view.graders
    .map((grader, index) => {
      const name = grader.professor ? displayName(grader.professor) : `Membre ${index + 1}`
      return `<tr><td>${escapeHtml(name)}</td><td class="num">${formatGrade(grader.value)} / 20</td></tr>`
    })
    .join('')

  let result = ''
  if (view.finalGrade !== null) {
    const passed = view.finalGrade >= PASS_MARK
    const mention = passed ? mentionOf(view.finalGrade) : ''
    result = `
      <div class="result">
        <div>
          <div class="label">Note finale</div>
          <div class="grade">${formatGrade(view.finalGrade)} <small>/ 20</small></div>
        </div>
        <div class="verdict">
          <span class="badge ${passed ? 'ok' : 'ko'}">${passed ? 'Admis' : 'Ajourné'}</span>
          ${mention ? `<div class="mention">Mention : ${escapeHtml(mention)}</div>` : ''}
        </div>
      </div>`
  }

  return `
    <div class="page">
      <div class="brand">
        <div>
          <div class="brand-name">Laurea</div>
          <div class="brand-sub">Portail universitaire</div>
        </div>
        <div class="ref"><strong>${escapeHtml(reference)}</strong>Année académique ${escapeHtml(year)}</div>
      </div>

      <h1 class="title">Procès-verbal de soutenance</h1>
      <p class="subtitle">Projet de fin d’études</p>

      <h2>Étudiant et projet</h2>
      <dl class="info">
        <div><dt>Étudiant</dt><dd>${escapeHtml(student ? fullName(student) : '')}</dd></div>
        <div><dt>Matricule</dt><dd>${escapeHtml(student?.matricule ?? '')}</dd></div>
        <div><dt>Spécialité</dt><dd>${escapeHtml(student?.specialty ?? '')}</dd></div>
        <div><dt>Domaine</dt><dd>${escapeHtml(view.project?.domain ?? '')}</dd></div>
        <div class="full"><dt>Intitulé du projet</dt><dd>${escapeHtml(view.project?.title ?? '')}</dd></div>
      </dl>

      <h2>Évaluation du jury</h2>
      <table>
        <thead><tr><th>Membre du jury</th><th class="num">Note</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      ${result}

      <div class="signatures">
        <div class="sig">Le président du jury</div>
        <div class="sig">L’administration</div>
      </div>

      <div class="footer">
        <span>${escapeHtml(reference)}</span>
        <span>Fait le ${escapeHtml(generatedOn)}</span>
      </div>
    </div>
  `
}