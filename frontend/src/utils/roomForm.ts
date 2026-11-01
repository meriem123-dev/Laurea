import type { FormFieldConfig, FormValues } from '../types/form'
import type { Room, RoomFormData } from '../types/room'

const MAX_CAPACITY = 1000

export function buildRoomFields(existingNames: string[]): FormFieldConfig[] {
  const taken = new Set(existingNames.map((name) => name.trim().toLowerCase()))

  return [
    {
      key: 'name',
      label: 'Nom de la salle',
      placeholder: 'Ex. : Salle A12',
      required: true,
      requiredMessage: 'Le nom de la salle est obligatoire.',
      half: true,
      // Vérification locale seulement : le backend doit aussi garantir l'unicité
      validate: (value) => (taken.has(value.toLowerCase()) ? 'Une salle porte déjà ce nom.' : ''),
    },
    {
      key: 'capacity',
      label: 'Capacité (places)',
      placeholder: 'Ex. : 24',
      required: true,
      requiredMessage: 'La capacité est obligatoire.',
      half: true,
      validate: (value) => {
        const count = Number(value)
        const valid = /^\d+$/.test(value) && count >= 1 && count <= MAX_CAPACITY
        return valid ? '' : `Saisissez un nombre entier entre 1 et ${MAX_CAPACITY}.`
      },
    },
    { key: 'block', label: 'Bloc', placeholder: 'Ex. : Bâtiment Sciences', optional: true, half: true },
    { key: 'pole', label: 'Pôle', placeholder: 'Ex. : Pôle Numérique', optional: true, half: true },
    {
      key: 'equipment',
      label: 'Équipements',
      placeholder: 'Ex. : Vidéoconf., tableau, micro',
      optional: true,
    },
  ]
}

export function roomToFormValues(room: Room): FormValues {
  return {
    name: room.name,
    capacity: String(room.capacity),
    block: room.block,
    pole: room.pole,
    equipment: room.equipment,
  }
}

export function toRoomData(values: FormValues): RoomFormData {
  const get = (key: string) => values[key] ?? ''
  return {
    name: get('name'),
    capacity: Number(get('capacity')),
    block: get('block'),
    pole: get('pole'),
    equipment: get('equipment'),
  }
}