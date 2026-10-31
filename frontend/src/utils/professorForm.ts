import type { FormFieldConfig, FormValues } from '../types/form'
import type { Professor, ProfessorFormData } from '../types/professor'
import { emailField, temporaryPasswordField } from './accountFields'

export function buildProfessorFields(
  existingEmails: string[],
  includePassword: boolean, // création : oui (invitation) / modification : non
): FormFieldConfig[] {
  const fields: FormFieldConfig[] = [
    {
      key: 'name',
      label: 'Nom complet',
      placeholder: 'Ex. : Karim Mansouri',
      required: true,
      requiredMessage: 'Le nom complet est obligatoire.',
    },
    emailField('Ex. : karim.mansouri@univ.fr', existingEmails),
    {
      key: 'specialty',
      label: 'Spécialité',
      placeholder: 'Ex. : Intelligence artificielle',
      required: true,
      requiredMessage: 'La spécialité est obligatoire.',
    },
  ]

  if (includePassword) fields.push(temporaryPasswordField())
  return fields
}

export function professorToFormValues(professor: Professor): FormValues {
  return {
    name: professor.name,
    email: professor.email,
    specialty: professor.specialty,
  }
}

export function toProfessorData(values: FormValues): ProfessorFormData {
  const get = (key: string) => values[key] ?? ''
  return {
    name: get('name'),
    email: get('email'),
    specialty: get('specialty'),
    temporaryPassword: get('temporaryPassword'),
  }
}