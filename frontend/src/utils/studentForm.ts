import type {
  FormFieldConfig,
  FormFieldOption,
  FormValues,
} from "../types/form";
import type { Student, StudentFormData,Speciality,Cursus } from "../types/student";
import { emailField } from "./accountFields";

interface StudentFieldsOptions {
  specialityOptions: FormFieldOption[];
  existingMatricules: string[];
  existingEmails: string[];
}

export function buildStudentFields(
  options: StudentFieldsOptions,
): FormFieldConfig[] {
  const takenMatricules = new Set(
    options.existingMatricules.map((value) => value.trim().toUpperCase()),
  );

  const fields: FormFieldConfig[] = [
    {
      key: "firstName",
      label: "Prénom",
      placeholder: "Ex. : Lina",
      autocomplete: "given-name",
      required: true,
      requiredMessage: "Le prénom est obligatoire.",
      half: true,
    },
    {
      key: "lastName",
      label: "Nom",
      placeholder: "Ex. : Bensaïd",
      autocomplete: "family-name",
      required: true,
      requiredMessage: "Le nom est obligatoire.",
      half: true,
    },
    emailField("prenom.nom@univ.fr", options.existingEmails),
    {
      key: "matricule",
      label: "Matricule",
      placeholder: "Ex. : ETU-2025-059",
      required: true,
      requiredMessage: "Le matricule est obligatoire.",
      hint: "Le matricule doit être unique pour chaque étudiant.",
      normalize: (value) => value.trim().toUpperCase(),
      // Vérification locale seulement : le backend doit aussi garantir l'unicité
      validate: (value) =>
        takenMatricules.has(value) ? "Ce matricule est déjà utilisé." : "",
    },
    {
      key: "cursus",
      label: "Cursus",
      type: "select",
      placeholder: "Sélectionner un cursus",
      options: [
        { label: "Master", value: "MASTER" },
        { label: "Ingénieur", value: "INGENIEUR" },
      ],
      required: true,
      requiredMessage: "Sélectionnez un cursus.",
      half: true,
    },
    {
      key: "speciality",
      label: "Spécialité",
      type: "select",
      placeholder: "Sélectionner une spécialité",
      options: options.specialityOptions,
      required: true,
      requiredMessage: "Sélectionnez une spécialité.",
      half: true,
    },
    {
      key: "group",
      label: "Groupe",
      placeholder: "IA",
      optional: true,
      half: true,
    },
  ];

  return fields;
}

export function studentToFormValues(student: Student): FormValues {
  return {
    firstName: student.firstName,
    lastName: student.lastName,
    email: student.email,
    matricule: student.matricule,
    cursus: student.cursus,
    speciality: student.speciality,
    group: student.group ?? "",
  };
}

export function toStudentData(values: FormValues): StudentFormData {
  const get = (key: string) => values[key] ?? "";

  return {
    firstName: get("firstName"),
    lastName: get("lastName"),
    email: get("email"),
    matricule: get("matricule"),
    cursus: get("cursus") as Cursus,
    speciality: get("speciality") as Speciality,
    group: get("group") || null,
  };
}