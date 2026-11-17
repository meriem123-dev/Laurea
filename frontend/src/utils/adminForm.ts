import type { FormFieldConfig, FormValues } from '../types/form'
import { emailField } from './accountFields'
import type { Admin, AdminPayload } from '../types/admin'
export function buildAdminFields(existingEmails: string[]): FormFieldConfig[] {
  return [
    {
      key: 'firstName',
      label: 'Prénom',
      placeholder: 'Ex. : Nadia',
      autocomplete: 'given-name',
      required: true,
      requiredMessage: 'Le prénom est obligatoire.',
      half: true,
    },
    {
      key: 'lastName',
      label: 'Nom',
      placeholder: 'Ex. : Boukhalfa',
      autocomplete: 'family-name',
      required: true,
      requiredMessage: 'Le nom est obligatoire.',
      half: true,
    },
    emailField('Ex. : nadia.boukhalfa@univ.dz', existingEmails),
  ]
}

export function toAdminData(values: FormValues): AdminPayload {
  const get = (key: string) => (values[key] ?? '').trim()
  return {
    firstName: get('firstName'),
    lastName: get('lastName'),
    email: get('email').toLowerCase(),
  }
}
export function adminToFormValues(admin: Admin): FormValues {
  return {
    firstName: admin.firstName,
    lastName: admin.lastName,
    email: admin.email,
  }
}