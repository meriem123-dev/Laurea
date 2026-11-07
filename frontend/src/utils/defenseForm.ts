import type { Defense, DefenseFormData } from '../types/defense'
import type { FormFieldConfig, FormFieldOption, FormValues } from '../types/form'
import type { Professor } from '../types/professor'
import { isWeekend } from './calendar'
import {
  DAY_END,
  DAY_START,
  JURY_MEMBER_COUNT,
  defenseSlot,
  formatTime,
  juryIdsOf,
  slotOverlaps,
  toMinutes,
  type Slot,
} from './defense'
import { displayName } from './professor'

interface DefenseFieldsOptions {
  projectOptions: FormFieldOption[] // projets pas encore planifiés (+ celui de la soutenance modifiée)
  professorOptions: FormFieldOption[]
  roomOptions: FormFieldOption[]
  professors: Professor[]
  otherDefenses: Defense[] // les autres soutenances (sans celle en cours de modification)
  duration: number
}

type Validate = NonNullable<FormFieldConfig['validate']>

const MEMBER_KEYS = Array.from({ length: JURY_MEMBER_COUNT }, (_, index) => `member${index + 1}`)
const JURY_KEYS = ['president', ...MEMBER_KEYS]

function slotFrom(values: FormValues, duration: number): Slot | null {
  const date = values.date ?? ''
  const time = values.time ?? ''
  if (!date || !time) return null
  const start = toMinutes(time)
  return { date, start, end: start + duration }
}

function professorValidator(key: string, options: DefenseFieldsOptions): Validate {
  return (value, values) => {
    const duplicate = JURY_KEYS.some((other) => other !== key && (values[other] ?? '') === value)
    if (duplicate) return 'Ce professeur apparaît déjà dans le jury.'

    const id = Number(value)
    const professor = options.professors.find((item) => item.id === id)
    if (professor?.busyOn && professor.busyOn === (values.date ?? '')) {
      return `${displayName(professor)} est indisponible ce jour-là.`
    }

    const slot = slotFrom(values, options.duration)
    if (!slot) return ''
    const busy = options.otherDefenses.some(
      (defense) => juryIdsOf(defense).includes(id) && slotOverlaps(slot, defenseSlot(defense)),
    )
    return busy ? 'Ce professeur est déjà affecté à une autre soutenance sur ce créneau.' : ''
  }
}

export function buildDefenseFields(options: DefenseFieldsOptions): FormFieldConfig[] {
  const juryFields: FormFieldConfig[] = [
    {
      key: 'president',
      label: 'Président du jury',
      type: 'select',
      placeholder: 'Sélectionner un professeur',
      options: options.professorOptions,
      required: true,
      requiredMessage: 'Sélectionnez le président du jury.',
      section: 'Jury',
      half: true,
      validate: professorValidator('president', options),
    },
    ...MEMBER_KEYS.map(
      (key, index): FormFieldConfig => ({
        key,
        label: `Juré ${index + 1}`,
        type: 'select',
        placeholder: 'Sélectionner un professeur',
        options: options.professorOptions,
        required: true,
        requiredMessage: `Sélectionnez le juré ${index + 1}.`,
        section: 'Jury',
        half: true,
        validate: professorValidator(key, options),
      }),
    ),
  ]

  return [
    {
      key: 'date',
      label: 'Date',
      type: 'date',
      required: true,
      requiredMessage: 'La date est obligatoire.',
      half: true,
      validate: (value) =>
        isWeekend(value) ? 'Choisissez un jour ouvré (du lundi au vendredi).' : '',
    },
    {
      key: 'time',
      label: 'Heure',
      type: 'time',
      required: true,
      requiredMessage: 'L’heure est obligatoire.',
      half: true,
      validate: (value) => {
        const start = toMinutes(value)
        const fits = start >= DAY_START * 60 && start + options.duration <= DAY_END * 60
        return fits
          ? ''
          : `Les soutenances ont lieu entre ${formatTime(DAY_START * 60)} et ${formatTime(DAY_END * 60)}.`
      },
    },
    {
      key: 'project',
      label: 'Projet',
      type: 'select',
      placeholder: 'Sélectionner un projet',
      options: options.projectOptions,
      required: true,
      requiredMessage: 'Sélectionnez un projet.',
      hint:
        options.projectOptions.length === 0
          ? 'Aucun projet disponible : tous sont déjà planifiés.'
          : undefined,
    },
    ...juryFields,
    {
      key: 'room',
      label: 'Salle',
      type: 'select',
      placeholder: 'Sélectionner une salle',
      options: options.roomOptions,
      required: true,
      requiredMessage: 'Sélectionnez une salle.',
      section: 'Lieu',
      validate: (value, values) => {
        const slot = slotFrom(values, options.duration)
        if (!slot) return ''
        const taken = options.otherDefenses.some(
          (defense) =>
            defense.roomId === String(value) && slotOverlaps(slot, defenseSlot(defense)),
        )
        return taken ? 'Cette salle est déjà réservée sur ce créneau.' : ''
      },
    },
  ]
}

export function defenseToFormValues(defense: Defense): FormValues {
  const values: FormValues = {
    date: defense.date,
    time: defense.time,
    project: String(defense.projectId),
    president: String(defense.presidentId),
    room: String(defense.roomId),
  }
  MEMBER_KEYS.forEach((key, index) => {
    const id = defense.memberIds[index]
    values[key] = id === undefined ? '' : String(id)
  })
  return values
}

/** Valeurs proposées à l'ouverture du formulaire de création */
export function defaultDefenseValues(date: string): FormValues {
  return { date, time: '09:00' }
}

export function toDefenseData(values: FormValues): DefenseFormData {
  const get = (key: string) => values[key] ?? ''
  return {
    projectId: Number(get('project')),
    date: get('date'),
    time: get('time'),
    roomId: String(get('room')),
    presidentId: Number(get('president')),
    memberIds: MEMBER_KEYS.map(get).filter(Boolean).map(Number),
  }
}