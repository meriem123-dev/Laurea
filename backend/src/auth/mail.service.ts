import { Injectable } from "@nestjs/common";

@Injectable()
export class MailService {
  //logique du mot de passe oublié
  sendResetLink(to: string, link: string) {
    return this.send({
      to,
      subject: "Réinitialisation de votre mot de passe",
      title: "Réinitialisation du mot de passe",
      intro:
        "Vous avez demandé à réinitialiser votre mot de passe. Ce lien est valable 30 minutes.",
      button: "Choisir un nouveau mot de passe",
      link,
      footer:
        "Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.",
    });
  }

  //logique activation compte étudiant
  sendActivationLink(to: string, link: string, firstName: string) {
    return this.send({
      to,
      subject: "Activez votre compte Laurea Platform",
      title: `Bienvenue ${firstName}`,
      intro:
        "Votre compte a été créé par l'administration. Ce lien est valable 48 heures.",
      button: "Définir mon mot de passe",
      link,
      footer: "Si vous n'attendiez pas cette invitation, ignorez ce message.",
    });
  }

  private async send(p: {
    to: string;
    subject: string;
    title: string;
    intro: string;
    button: string;
    link: string;
    footer: string;
  }) {
    const auth = Buffer.from(
      `${process.env.MAILJET_API_KEY}:${process.env.MAILJET_SECRET_KEY}`,
    ).toString("base64");

    //mail via mailjet
    // erreur réseau (Mailjet injoignable…) : on renvoie false au lieu de faire échouer la requête,
    // sinon le compte est créé mais l'API répond 500
    let res: Response;
    try {
      res = await fetch("https://api.mailjet.com/v3.1/send", {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Messages: [
            {
              From: { Email: process.env.MAIL_FROM, Name: "Laurea Platform" },
              To: [{ Email: p.to }],
              Subject: p.subject,
              TextPart: `${p.intro}\n\n${p.button} :\n${p.link}\n\n${p.footer}`,
              HTMLPart: `
  <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;color:#111">
    <h2>${p.title}</h2>
    <p>${p.intro}</p>
    <p>
      <a href="${p.link}" style="display:inline-block;background:#111;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none">${p.button}</a>
    </p>
    <p style="font-size:12px;color:#666">Si le bouton ne fonctionne pas, copiez ce lien :<br>${p.link}</p>
    <p style="font-size:12px;color:#666">${p.footer}</p>
  </div>`,
            },
          ],
        }),
      });
    } catch (e) {
      console.error("Mailjet injoignable", e);
      return false;
    }
    if (!res.ok) console.error("Mailjet error", await res.text());
    return res.ok; // permet à l'appelant de savoir si ça a marché
  }
}
