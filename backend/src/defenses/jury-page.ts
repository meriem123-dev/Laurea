// Petite page HTML servie par l'API quand un membre du jury clique sur le lien du mail.
// Le clic sur le lien n'enregistre rien (les messageries ouvrent parfois les liens toutes seules) :
// la réponse n'est enregistrée qu'avec les boutons du formulaire (POST).

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const layout = (title: string, body: string) => `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)} · Laurea</title>
</head>
<body style="margin:0;background:#f6f5f2;font-family:Arial,sans-serif;color:#111">
  <main style="max-width:520px;margin:48px auto;padding:0 16px">
    <p style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#8a6d1f;margin:0 0 8px">Laurea · Soutenances</p>
    <div style="background:#fff;border:1px solid #e5e2da;border-radius:12px;padding:24px">
      ${body}
    </div>
  </main>
</body>
</html>`;

export const RESPONSE_LABELS = {
  PENDING: "En attente de votre réponse",
  ACCEPTED: "Vous avez confirmé votre participation",
  DECLINED: "Vous avez décliné cette invitation",
} as const;

export function invitationPage(p: {
  teacher: string;
  role: string;
  details: string[];
  status: keyof typeof RESPONSE_LABELS;
  canRespond: boolean; // false si la soutenance est passée ou verrouillée
}) {
  const buttons = p.canRespond
    ? `<form method="post" style="display:flex;gap:12px;flex-wrap:wrap;margin-top:20px">
        <button name="answer" value="accept" style="flex:1;min-width:180px;padding:12px;border:0;border-radius:8px;background:#111;color:#fff;font-size:15px;cursor:pointer">Je confirme ma participation</button>
        <button name="answer" value="decline" style="flex:1;min-width:180px;padding:12px;border:1px solid #c9c4b8;border-radius:8px;background:#fff;color:#111;font-size:15px;cursor:pointer">Je ne peux pas</button>
      </form>
      ${p.status !== "PENDING" ? `<p style="font-size:13px;color:#666;margin-top:12px">Vous pouvez encore changer votre réponse.</p>` : ""}`
    : `<p style="font-size:14px;color:#666;margin-top:20px">Cette soutenance a déjà eu lieu ou est clôturée : la réponse n'est plus modifiable.</p>`;

  return layout(
    "Invitation au jury",
    `<h1 style="font-size:22px;margin:0 0 8px">Bonjour ${escapeHtml(p.teacher)}</h1>
     <p style="margin:0 0 16px">Vous êtes invité(e) à participer à cette soutenance en tant que <strong>${escapeHtml(p.role)}</strong>.</p>
     <ul style="padding-left:18px;line-height:1.7;margin:0">${p.details.map((d) => `<li>${escapeHtml(d)}</li>`).join("")}</ul>
     <p style="margin:20px 0 0;padding:10px 12px;border-radius:8px;background:#f6f5f2"><strong>Statut :</strong> ${RESPONSE_LABELS[p.status]}</p>
     ${buttons}`,
  );
}

export function resultPage(accepted: boolean) {
  return layout(
    accepted ? "Participation confirmée" : "Invitation déclinée",
    accepted
      ? `<h1 style="font-size:22px;margin:0 0 8px">Merci, votre participation est confirmée.</h1>
         <p style="margin:0">Vous recevrez un nouveau mail si la soutenance est modifiée.</p>`
      : `<h1 style="font-size:22px;margin:0 0 8px">Votre réponse a bien été enregistrée.</h1>
         <p style="margin:0">L'administration a été prévenue et désignera un autre membre du jury.</p>`,
  );
}

export function errorPage(message: string) {
  return layout(
    "Lien invalide",
    `<h1 style="font-size:22px;margin:0 0 8px">Lien invalide</h1>
     <p style="margin:0">${escapeHtml(message)}</p>`,
  );
}
