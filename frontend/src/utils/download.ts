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
  @page { size: A4; margin: 16mm; }
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { margin: 0; font-family: Georgia, 'Times New Roman', serif; color: #0f1f38; line-height: 1.5; font-size: 14px; }
  .page { max-width: 780px; margin: 0 auto; }

  .brand { display: flex; justify-content: space-between; align-items: flex-end; padding-bottom: 14px; border-bottom: 3px double #0f1f38; }
  .brand-name { font-size: 26px; font-weight: 700; letter-spacing: 0.04em; }
  .brand-sub { font-size: 12px; color: #667085; letter-spacing: 0.12em; text-transform: uppercase; }
  .ref { text-align: right; font-size: 12px; color: #667085; }
  .ref strong { display: block; color: #0f1f38; font-size: 13px; }

  .title { text-align: center; margin: 32px 0 6px; font-size: 24px; letter-spacing: 0.12em; text-transform: uppercase; }
  .subtitle { text-align: center; margin: 0 0 28px; color: #667085; font-size: 13px; }

  h2 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.14em; color: #8a5a14; margin: 28px 0 10px; padding-bottom: 6px; border-bottom: 1px solid #d9d4c7; }

  .info { display: grid; grid-template-columns: 1fr 1fr; gap: 0; margin: 0; border: 1px solid #d9d4c7; border-radius: 6px; overflow: hidden; }
  .info div { padding: 10px 14px; border-bottom: 1px solid #ece8dd; }
  .info div:nth-last-child(-n+1) { border-bottom: 0; }
  .info .full { grid-column: 1 / -1; }
  .info dt, .label { margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #667085; }
  .info dd { margin: 2px 0 0; font-weight: 700; }

  table { width: 100%; border-collapse: collapse; }
  thead th { background: #0f1f38; color: #fff; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; padding: 9px 12px; text-align: left; }
  thead th.num { text-align: right; }
  tbody td { padding: 10px 12px; border-bottom: 1px solid #ece8dd; }
  tbody tr:nth-child(even) td { background: #f7f6f2; }
  .num { text-align: right; font-variant-numeric: tabular-nums; }

  .result { display: flex; justify-content: space-between; align-items: center; gap: 24px; margin-top: 22px; padding: 18px 22px; border: 2px solid #0f1f38; border-radius: 8px; background: #f7f6f2; }
  .result .grade { font-size: 38px; font-weight: 700; line-height: 1; }
  .result .grade small { font-size: 16px; font-weight: 400; color: #667085; }
  .result .verdict { text-align: right; }
  .badge { display: inline-block; padding: 4px 14px; border-radius: 999px; font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; }
  .badge.ok { background: #e8f6ef; color: #12805c; }
  .badge.ko { background: #fcebec; color: #c74a4a; }
  .mention { margin-top: 6px; font-style: italic; }

  .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 56px; page-break-inside: avoid; }
  .sig { height: 110px; border: 1px solid #d9d4c7; border-radius: 6px; padding: 10px 14px; font-size: 12px; color: #667085; text-transform: uppercase; letter-spacing: 0.1em; }

  .footer { margin-top: 36px; padding-top: 10px; border-top: 1px solid #d9d4c7; display: flex; justify-content: space-between; font-size: 11px; color: #8b909a; }
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