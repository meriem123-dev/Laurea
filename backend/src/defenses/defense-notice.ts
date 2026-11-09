// Destinataires et contenu des mails de soutenance (convocation, rectificatif, annulation).
// Fonctions pures : testées dans defense-notice.spec.ts

import { formatTime, toMinutes } from "./defense.rules";

export type NoticeKind = "planned" | "updated" | "cancelled";

interface Person {
  email: string;
  firstName: string;
  lastName: string;
}
interface TeacherInfo {
  id: string;
  title: string | null;
  user: Person;
}

// soutenance avec tout ce qu'il faut pour écrire le mail
export interface DefenseDetails {
  date: string; // "2026-06-18"
  time: string; // "09:00"
  duration: number;
  room: { name: string; block: string; pole: string };
  project: {
    title: string;
    students: { user: Person }[];
    supervisor: TeacherInfo;
    coSupervisor: TeacherInfo | null;
  };
  president: TeacherInfo;
  members: TeacherInfo[]; // dans l'ordre Juré 1, 2, 3
}

export interface Recipient {
  email: string;
  firstName: string;
  roles: string[]; // "Président du jury", "Juré", "Encadrant"…
  juryTeacherId?: string; // renseigné si la personne fait partie du jury (elle doit confirmer)
}

export const teacherLabel = (t: TeacherInfo) =>
  `${t.title ? `${t.title} ` : ""}${t.user.firstName} ${t.user.lastName}`;

// "2026-06-18" -> "jeudi 18 juin 2026"
export function formatLongDate(date: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

// étudiants + jury + encadrants, sans doublon (une même personne peut avoir 2 rôles)
export function buildRecipients(d: DefenseDetails): Recipient[] {
  const byEmail = new Map<string, Recipient>();
  const add = (p: Person, role: string, juryTeacherId?: string) => {
    const key = p.email.toLowerCase();
    const existing = byEmail.get(key);
    if (existing) {
      if (!existing.roles.includes(role)) existing.roles.push(role);
      existing.juryTeacherId ??= juryTeacherId;
    } else {
      byEmail.set(key, {
        email: p.email,
        firstName: p.firstName,
        roles: [role],
        juryTeacherId,
      });
    }
  };
  d.project.students.forEach((s) => add(s.user, "Étudiant(e)"));
  add(d.president.user, "Président du jury", d.president.id);
  d.members.forEach((m) => add(m.user, "Juré", m.id));
  add(d.project.supervisor.user, "Encadrant");
  if (d.project.coSupervisor) add(d.project.coSupervisor.user, "Co-encadrant");
  return [...byEmail.values()];
}

const SUBJECT_PREFIX: Record<NoticeKind, string> = {
  planned: "Convocation",
  updated: "Convocation rectificative",
  cancelled: "Annulation",
};

// contenu d'un mail pour un destinataire
// confirmLink : lien de réponse, pour les membres du jury qui doivent (re)confirmer
export function buildNotice(
  kind: NoticeKind,
  d: DefenseDetails,
  r: Recipient,
  confirmLink?: string,
) {
  const when = `${formatLongDate(d.date)} à ${d.time}`;
  const end = formatTime(toMinutes(d.time) + d.duration);
  const place = [d.room.name, d.room.block, d.room.pole]
    .filter(Boolean)
    .join(" · ");
  const students = d.project.students
    .map((s) => `${s.user.firstName} ${s.user.lastName}`)
    .join(", ");

  const intro: Record<NoticeKind, string> = {
    planned: `Vous êtes convoqué(e) à la soutenance suivante, en tant que ${r.roles.join(" et ")}.`,
    updated: `La soutenance suivante a été modifiée. Voici les informations à jour (votre rôle : ${r.roles.join(" et ")}).`,
    cancelled:
      "La soutenance suivante a été annulée, ou vous n'en faites plus partie. Une nouvelle convocation vous sera envoyée si elle est replanifiée.",
  };

  const details = [
    `Projet : ${d.project.title}`,
    `Étudiant(s) : ${students}`,
    `Date : ${when} (fin prévue à ${end})`,
    `Salle : ${place}`,
    ...(kind === "cancelled"
      ? []
      : [
          `Président du jury : ${teacherLabel(d.president)}`,
          `Jurés : ${d.members.map(teacherLabel).join(", ")}`,
          `Encadrant : ${teacherLabel(d.project.supervisor)}${
            d.project.coSupervisor
              ? ` (co-encadrant : ${teacherLabel(d.project.coSupervisor)})`
              : ""
          }`,
        ]),
  ];

  const askConfirmation = kind !== "cancelled" && !!confirmLink;

  return {
    subject: `${SUBJECT_PREFIX[kind]} : soutenance du ${formatLongDate(d.date)} à ${d.time}`,
    title:
      kind === "cancelled" ? "Soutenance annulée" : `Bonjour ${r.firstName}`,
    intro: askConfirmation
      ? `${intro[kind]} Merci de confirmer votre participation au jury avec le bouton ci-dessous.`
      : intro[kind],
    details,
    // bouton du mail : réponse à l'invitation pour le jury, sinon lien vers Laurea
    ...(askConfirmation && {
      button: "Répondre à l'invitation",
      link: confirmLink,
    }),
    footer:
      kind === "cancelled"
        ? "Pour toute question, contactez l'administration du département."
        : "Merci de vous présenter 10 minutes avant le début. Pour toute question, contactez l'administration du département.",
  };
}

// mail aux administrateurs quand un membre du jury décline
export function buildDeclineNotice(d: DefenseDetails, teacher: TeacherInfo) {
  return {
    subject: `Jury : ${teacherLabel(teacher)} a décliné la soutenance du ${formatLongDate(d.date)}`,
    title: "Un membre du jury a décliné",
    intro: `${teacherLabel(teacher)} ne pourra pas participer au jury de cette soutenance. Merci de le remplacer : le nouveau membre recevra automatiquement sa convocation.`,
    details: [
      `Projet : ${d.project.title}`,
      `Date : ${formatLongDate(d.date)} à ${d.time}`,
      `Salle : ${d.room.name}`,
    ],
    footer: "Message automatique de Laurea.",
  };
}
