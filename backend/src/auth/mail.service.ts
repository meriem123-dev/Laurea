import { Injectable } from "@nestjs/common";

@Injectable()
export class MailService {
  async sendResetLink(to: string, link: string) {
    const auth = Buffer.from(
      `${process.env.MAILJET_API_KEY}:${process.env.MAILJET_SECRET_KEY}`,
    ).toString("base64");

    const res = await fetch("https://api.mailjet.com/v3.1/send", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Messages: [
          {
            From: { Email: process.env.MAIL_FROM, Name: "Soutenances" },
            To: [{ Email: to }],
            Subject: "Réinitialisation de votre mot de passe",
            TextPart: `Bonjour,\n\nPour choisir un nouveau mot de passe (lien valable 30 minutes) :\n${link}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez ce message.`,
            HTMLPart: `
  <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;color:#111">
    <h2>Réinitialisation du mot de passe</h2>
    <p>Vous avez demandé à réinitialiser votre mot de passe. Ce lien est valable 30 minutes.</p>
    <p>
      <a href="${link}"
         style="display:inline-block;background:#111;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none">
        Choisir un nouveau mot de passe
      </a>
    </p>
    <p style="font-size:12px;color:#666">
      Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br>${link}
    </p>
    <p style="font-size:12px;color:#666">
      Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.
    </p>
  </div>`,
          },
        ],
      }),
    });
    if (!res.ok) console.error("Mailjet error", await res.text());
  }
}
