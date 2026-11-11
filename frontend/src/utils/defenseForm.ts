import type { Defense, DefenseFormData } from "../types/defense";
import type {
  FormFieldConfig,
  FormFieldOption,
  FormValues,
} from "../types/form";
import type { Professor } from "../types/professor";
import type { Project } from "../types/project";
import { isWeekend, todayISO } from "./calendar";
import {
  DAY_END,
  DAY_START,
  JURY_MEMBER_COUNT,
  defenseSlot,
  formatTime,
  juryIdsOf,
  slotOverlaps,
  toMinutes,
  type Slot,
} from "./defense";
import { displayName } from "./professor";

interface DefenseFieldsOptions {
  projectOptions: FormFieldOption[]; // projets pas encore planifiés (+ celui de la soutenance modifiée)
  professorOptions: FormFieldOption[];
  roomOptions: FormFieldOption[];
  professors: Professor[];
  projects: Project[]; // pour retirer l'encadrant du projet choisi de la liste du jury
  otherDefenses: Defense[]; // les autres soutenances (sans celle en cours de modification)
  editedDefense: Defense | null; // soutenance modifiée (null = création)
  duration: number;
}

type Validate = NonNullable<FormFieldConfig["validate"]>;

const MEMBER_KEYS = Array.from(
  { length: JURY_MEMBER_COUNT },
  (_, index) => `member${index + 1}`,
);
const JURY_KEYS = ["president", ...MEMBER_KEYS];

function slotFrom(values: FormValues, duration: number): Slot | null {
  const date = values.date ?? "";
  const time = values.time ?? "";
  if (!date || !time) return null;
  const start = toMinutes(time);
  return { date, start, end: start + duration };
}

function professorValidator(
  key: string,
  options: DefenseFieldsOptions,
): Validate {
  return (value, values) => {
    const duplicate = JURY_KEYS.some(
      (other) => other !== key && (values[other] ?? "") === value,
    );
    if (duplicate) return "Ce professeur apparaît déjà dans le jury.";

    const id = value;
    if (supervisorIds(values, options).includes(id)) {
      return "L’encadrant assiste déjà à la soutenance : choisissez un autre professeur.";
    }
    const professor = options.professors.find((item) => item.id === id);
    if (professor?.busyOn && professor.busyOn === (values.date ?? "")) {
      return `${displayName(professor)} est indisponible ce jour-là.`;
    }

    const slot = slotFrom(values, options.duration);
    if (!slot) return "";
    const busy = options.otherDefenses.some(
      (defense) =>
        juryIdsOf(defense).includes(id) &&
        slotOverlaps(slot, defenseSlot(defense)),
    );
    return busy
      ? "Ce professeur est déjà affecté à une autre soutenance sur ce créneau."
      : "";
  };
}
// Encadrant et co-encadrant du projet choisi : ils assistent déjà à la soutenance
function supervisorIds(
  values: FormValues,
  options: DefenseFieldsOptions,
): string[] {
  const project = options.projects.find(
    (item) => String(item.id) === (values.project ?? ""),
  );
  return project
    ? [project.supervisorId, project.coSupervisorId].filter(
        (id): id is string => !!id,
      )
    : [];
}

// Professeurs proposés pour le jury : tous sauf l'encadrant et le co-encadrant du projet choisi
function juryOptions(
  values: FormValues,
  options: DefenseFieldsOptions,
): FormFieldOption[] {
  const excluded = supervisorIds(values, options);
  return options.professorOptions.filter(
    (option) => !excluded.includes(option.value),
  );
}
// Date et heure déjà passées ? (une soutenance modifiée sans changer sa date/heure n'est pas bloquée)
function pastMessage(
  values: FormValues,
  options: DefenseFieldsOptions,
): string {
  const date = values.date ?? "";
  const time = values.time ?? "";
  const edited = options.editedDefense;
  if (!date || (edited && edited.date === date && edited.time === time))
    return "";

  const today = todayISO();
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const past =
    date < today || (date === today && !!time && toMinutes(time) <= nowMinutes);
  return past
    ? "Cette date est déjà passée : choisissez une date et une heure à venir."
    : "";
}

export function buildDefenseFields(
  options: DefenseFieldsOptions,
): FormFieldConfig[] {
  const juryFields: FormFieldConfig[] = [
    {
      key: "president",
      label: "Président du jury",
      type: "select",
      placeholder: "Sélectionner un professeur",
      optionsWhen: (values) => juryOptions(values, options),
      required: true,
      requiredMessage: "Sélectionnez le président du jury.",
      section: "Jury",
      half: true,
      validate: professorValidator("president", options),
    },
    ...MEMBER_KEYS.map(
      (key, index): FormFieldConfig => ({
        key,
        label: `Juré ${index + 1}`,
        type: "select",
        placeholder: "Sélectionner un professeur",
        optionsWhen: (values) => juryOptions(values, options),
        required: true,
        requiredMessage: `Sélectionnez le juré ${index + 1}.`,
        section: "Jury",
        half: true,
        validate: professorValidator(key, options),
      }),
    ),
  ];

  return [
    {
      key: "date",
      label: "Date",
      type: "date",
      required: true,
      requiredMessage: "La date est obligatoire.",
      half: true,
      validate: (value, values) => {
        if (isWeekend(value))
          return "Choisissez un jour ouvré (du dimanche au jeudi).";
        return (values.date ?? "") < todayISO()
          ? pastMessage(values, options)
          : "";
      },
    },

    {
      key: "time",
      label: "Heure",
      type: "time",
      required: true,
      requiredMessage: "L’heure est obligatoire.",
      half: true,
      validate: (value, values) => {
        // aujourd'hui à une heure déjà passée (une date passée est signalée sur le champ Date)
        if ((values.date ?? "") === todayISO()) {
          const past = pastMessage(values, options);
          if (past) return past;
        }
        const start = toMinutes(value);
        const fits =
          start >= DAY_START * 60 && start + options.duration <= DAY_END * 60;
        return fits
          ? ""
          : `Les soutenances ont lieu entre ${formatTime(DAY_START * 60)} et ${formatTime(DAY_END * 60)}.`;
      },
    },
    {
      key: "project",
      label: "Projet",
      type: "select",
      placeholder: "Sélectionner un projet",
      options: options.projectOptions,
      required: true,
      requiredMessage: "Sélectionnez un projet.",
      hint:
        options.projectOptions.length === 0
          ? "Aucun projet disponible : seuls les projets validés et pas encore planifiés sont proposés."
          : undefined,
    },
    ...juryFields,
    {
      key: "room",
      label: "Salle",
      type: "select",
      placeholder: "Sélectionner une salle",
      options: options.roomOptions,
      required: true,
      requiredMessage: "Sélectionnez une salle.",
      section: "Lieu",
      validate: (value, values) => {
        const slot = slotFrom(values, options.duration);
        if (!slot) return "";
        const taken = options.otherDefenses.some(
          (defense) =>
            defense.roomId === String(value) &&
            slotOverlaps(slot, defenseSlot(defense)),
        );
        return taken ? "Cette salle est déjà réservée sur ce créneau." : "";
      },
    },
  ];
}

export function defenseToFormValues(defense: Defense): FormValues {
  const values: FormValues = {
    date: defense.date,
    time: defense.time,
    project: String(defense.projectId),
    president: String(defense.presidentId),
    room: String(defense.roomId),
  };
  MEMBER_KEYS.forEach((key, index) => {
    const id = defense.memberIds[index];
    values[key] = id === undefined ? "" : String(id);
  });
  return values;
}

/** Valeurs proposées à l'ouverture du formulaire de création */
export function defaultDefenseValues(date: string): FormValues {
  return { date, time: "09:00" };
}

export function toDefenseData(values: FormValues): DefenseFormData {
  const get = (key: string) => values[key] ?? "";
  return {
    projectId: get("project"),
    date: get("date"),
    time: get("time"),
    roomId: String(get("room")),
    presidentId: get("president"),
    memberIds: MEMBER_KEYS.map(get).filter(Boolean).map(String),
  };
}
