export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function downloadTextFile(
  filename: string,
  content: string,
  mime = 'text/csv;charset=utf-8',
): void {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const PRINT_STYLES = `
  @page { margin: 18mm; }
  body { font-family: Georgia, 'Times New Roman', serif; color: #0f1f38; line-height: 1.5; }
  h1 { font-size: 24px; margin: 0 0 4px; }
  .muted { color: #667085; font-size: 13px; margin: 0; }
  dl { display: grid; grid-template-columns: 170px 1fr; gap: 8px 16px; margin: 28px 0; }
  dt { color: #667085; }
  dd { margin: 0; font-weight: 600; }
  h2 { font-size: 15px; text-transform: uppercase; letter-spacing: 0.08em; margin: 32px 0 0; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th, td { border-bottom: 1px solid #ccc; padding: 8px 4px; text-align: left; }
  .num { text-align: right; }
  .final { margin-top: 20px; font-size: 18px; font-weight: 700; text-align: right; }
  .signatures { display: flex; justify-content: space-between; gap: 48px; margin-top: 72px; }
  .signatures div { flex: 1; border-top: 1px solid #0f1f38; padding-top: 6px; font-size: 13px; }
  .date { margin-top: 40px; font-size: 13px; color: #667085; }
`

/** Ouvre un document dans une nouvelle fenêtre et lance l'impression (« Enregistrer en PDF »).
 *  Retourne false si le navigateur a bloqué la fenêtre. Le contenu doit déjà être échappé. */
export function openPrintWindow(title: string, bodyHtml: string): boolean {
  const win = window.open('', '_blank')
  if (!win) return false

  win.document.write(
    `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>${PRINT_STYLES}</style></head><body>${bodyHtml}</body></html>`,
  )
  win.document.close()
  win.focus()
  setTimeout(() => win.print(), 250)
  return true
}