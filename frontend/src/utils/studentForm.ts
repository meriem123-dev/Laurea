import type { FormFieldConfig, FormFieldOption, FormValues } from '../types/form'
import type { Student, StudentFormData } from '../types/student'
import { emailField, temporaryPasswordField } from './accountFields'

interface StudentFieldsOptions {
  specialtyOptions: FormFieldOption[]
  existingMatricules: string[]
  existingEmails: string[]
  includePassword: boolean // création : oui (invitation) / modification : non
}

export function buildStudentFields(options: StudentFieldsOptions): FormFieldConfig[] {
  const takenMatricules = new Set(options.existingMatricules.map((value) => value.trim().toUpperCase()))

  const fields: FormFieldConfig[] = [
    {
      key: 'firstName',
      label: 'Prénom',
      placeholder: 'Ex. : Lina',
      autocomplete: 'given-name',
      required: true,
      requiredMessage: 'Le prénom est obligatoire.',
      half: true,
    },
    {
      key: 'lastName',
      label: 'Nom',
      placeholder: 'Ex. : Bensaïd',
      autocomplete: 'family-name',
      required: true,
      requiredMessage: 'Le nom est obligatoire.',
      half: true,
    },
    emailField('prenom.nom@univ.fr', options.existingEmails),
    {
      key: 'matricule',
      label: 'Matricule',
      placeholder: 'Ex. : ETU-2025-059',
      required: true,
      requiredMessage: 'Le matricule est obligatoire.',
      hint: 'Le matricule doit être unique pour chaque étudiant.',
      normalize: (value) => value.trim().toUpperCase(),
      // Vérification locale seulement : le backend doit aussi garantir l'unicité
      validate: (value) => (takenMatricules.has(value) ? 'Ce matricule est déjà utilisé.' : ''),
    },
    {
      key: 'specialty',
      label: 'Spécialité',
      type: 'select',
      placeholder: 'Sélectionner une spécialité',
      options: options.specialtyOptions,
      required: true,
      requiredMessage: 'Sélectionnez une spécialité.',
      half: true,
    },
    {
      key: 'group',
      label: 'Groupe',
      placeholder: 'Ex. : M2-IA-01',
      optional: true,
      half: true,
    },
  ]

  if (options.includePassword) fields.push(temporaryPasswordField())
  return fields
}

export function studentToFormValues(student: Student): FormValues {
  return {
    firstName: student.firstName,
    lastName: student.lastName,
    email: student.email,
    matricule: student.matricule,
    specialty: student.specialty,
    group: student.group,
  }
}

export function toStudentData(values: FormValues): StudentFormData {
  const get = (key: string) => values[key] ?? ''
  return {
    firstName: get('firstName'),
    lastName: get('lastName'),
    email: get('email'),
    matricule: get('matricule'),
    specialty: get('specialty'),
    group: get('group'),
    temporaryPassword: get('temporaryPassword'),
  }
}