import type { FormFieldConfig } from '../types/form'

export const TEMP_PASSWORD_MIN_LENGTH = 8

export function emailField(placeholder: string, takenEmails: string[] = []): FormFieldConfig {
  const taken = new Set(takenEmails.map((email) => email.trim().toLowerCase()))
  return {
    key: 'email',
    label: 'Adresse e-mail',
    type: 'email',
    placeholder,
    required: true,
    requiredMessage: 'L’adresse e-mail est obligatoire.',
    // Vérification locale seulement : le backend doit aussi garantir l'unicité
    validate: (value) => (taken.has(value) ? 'Cette adresse e-mail est déjà utilisée.' : ''),
  }
}

export function temporaryPasswordField(): FormFieldConfig {
  return {
    key: 'temporaryPassword',
    label: 'Mot de passe temporaire',
    type: 'password',
    placeholder: 'Ex. : Soutenance2026',
    autocomplete: 'new-password',
    required: true,
    minLength: TEMP_PASSWORD_MIN_LENGTH,
    requiredMessage: 'Le mot de passe temporaire est obligatoire.',
  }
}

/** invitationNotice('Le professeur') */
export function invitationNotice(who: string): string {
  return `${who} recevra un e-mail d’invitation avec son mot de passe temporaire.`
}