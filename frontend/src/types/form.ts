export type FormValues = Record<string, string>

export interface FormFieldOption {
  value: string
  label: string
}

export interface FormFieldConfig {
  key: string
  label: string
  type?: 'text' | 'email' | 'password' | 'select' | 'textarea'
  placeholder?: string
  autocomplete?: string
  required?: boolean
  optional?: boolean // affiche « (facultatif) »
  hint?: string
  options?: FormFieldOption[] // pour type 'select'
  rows?: number // pour type 'textarea'
  half?: boolean // demi-largeur à partir de sm (sinon pleine largeur)
  section?: string // titre affiché avant le premier champ d'une nouvelle section
  minLength?: number
  requiredMessage?: string
  visibleWhen?: (values: FormValues) => boolean // champ conditionnel (absent = toujours visible)
  normalize?: (value: string) => string // appliquée avant validation et avant l'envoi
  // Retourne un message d'erreur, ou '' si valide. `values` = tous les champs du formulaire.
  validate?: (value: string, values: FormValues) => string
}