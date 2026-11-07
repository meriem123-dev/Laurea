import type { FormFieldConfig, FormValues } from "../types/form";
import type { ProfessorTitle } from "../types/professor";
import type {
  ApiProfessor,
  ProfessorPayload,
} from "../views/admin/api/professors.api";
import { emailField } from "./accountFields";

// Plus de mot de passe temporaire : le back envoie un lien d'activation (comme pour les étudiants)
export function buildProfessorFields(
  existingEmails: string[],
): FormFieldConfig[] {
  return [
    {
      key: "firstName",
      label: "Prénom",
      placeholder: "Ex. : Karim",
      autocomplete: "given-name",
      required: true,
      requiredMessage: "Le prénom est obligatoire.",
      half: true,
    },
    {
      key: "lastName",
      label: "Nom",
      placeholder: "Ex. : Mansouri",
      autocomplete: "family-name",
      required: true,
      requiredMessage: "Le nom est obligatoire.",
      half: true,
    },
    emailField("Ex. : karim.mansouri@univ.dz", existingEmails),
    {
      key: "title",
      label: "Titre",
      type: "select",
      optional: true,
      options: [
        { value: "", label: "Aucun titre" },
        { value: "Pr.", label: "Pr." },
        { value: "Dr.", label: "Dr." },
      ],
      half: true,
    },
    {
      key: "specialty",
      label: "Spécialité",
      placeholder: "Ex. : Intelligence artificielle",
      required: true,
      requiredMessage: "La spécialité est obligatoire.",
      half: true,
    },
  ];
}

export function professorToFormValues(professor: ApiProfessor): FormValues {
  return {
    firstName: professor.firstName,
    lastName: professor.lastName,
    email: professor.email,
    title: professor.title ?? "",
    specialty: professor.specialty,
  };
}

export function toProfessorData(values: FormValues): ProfessorPayload {
  const get = (key: string) => (values[key] ?? "").trim();
  const title = get("title");
  return {
    firstName: get("firstName"),
    lastName: get("lastName"),
    email: get("email").toLowerCase(),
    title: title ? (title as ProfessorTitle) : null,
    specialty: get("specialty"),
  };
}
