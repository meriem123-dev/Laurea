import type { FormFieldConfig, FormValues } from '../types/form'
import type { Admin, AdminPayload, AdminType } from '../types/admin'
import { emailField } from './accountFields'
import { ADMIN_TYPE_OPTIONS } from './adminType'

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
    {
      key: 'adminType',
      label: 'Fonction',
      type: 'select',
      placeholder: 'Sélectionner une fonction',
      options: ADMIN_TYPE_OPTIONS,
      required: true,
      requiredMessage: 'Sélectionnez une fonction.',
    },
  ]
}

export function toAdminData(values: FormValues): AdminPayload {
  const get = (key: string) => (values[key] ?? '').trim()
  return {
    firstName: get('firstName'),
    lastName: get('lastName'),
    email: get('email').toLowerCase(),
    adminType: get('adminType') as AdminType,
  }
}

export function adminToFormValues(admin: Admin): FormValues {
  return {
    firstName: admin.firstName,
    lastName: admin.lastName,
    email: admin.email,
    adminType: admin.adminType ?? '',
  }
}