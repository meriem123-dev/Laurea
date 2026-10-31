export type FormValues = Record<string, string>

export interface FormFieldOption {
  value: string
  label: string
}

export interface FormFieldConfig {
  key: string
  label: string
  type?: 'text' | 'email' | 'password' | 'select'
  placeholder?: string
  autocomplete?: string
  required?: boolean
  optional?: boolean // affiche « (facultatif) »
  hint?: string
  options?: FormFieldOption[] // pour type 'select'
  half?: boolean // demi-largeur à partir de sm (sinon pleine largeur)
  minLength?: number
  requiredMessage?: string
  normalize?: (value: string) => string // appliquée avant validation et avant l'envoi
  validate?: (value: string) => string // retourne un message d'erreur, ou '' si valide
}