import type { FormFieldConfig, FormFieldOption, FormValues } from '../types/form'
import type { Project, ProjectFormData, TeamType } from '../types/project'
import { ACADEMIC_YEARS, PROJECT_DOMAINS, TEAM_TYPE_OPTIONS, teamSize } from './project'

interface ProjectFieldsOptions {
  studentOptions: FormFieldOption[] // étudiants sans projet (+ ceux du projet modifié)
  professorOptions: FormFieldOption[]
}

const SLOTS = [1, 2, 3]

export function buildProjectFields(options: ProjectFieldsOptions): FormFieldConfig[] {
  const studentSlots: FormFieldConfig[] = SLOTS.map((slot) => ({
    key: `student${slot}`,
    label: `Étudiant ${slot}`,
    type: 'select',
    placeholder: 'Sélectionner un étudiant',
    options: options.studentOptions,
    required: true,
    requiredMessage: `Sélectionnez l’étudiant ${slot}.`,
    half: true,
    visibleWhen: (values) => teamSize(values.teamType ?? '') >= slot,
    validate: (value, values) => {
      const isDuplicate = SLOTS.some(
        (other) => other !== slot && values[`student${other}`] === value && teamSize(values.teamType ?? '') >= other,
      )
      return isDuplicate ? 'Cet étudiant est déjà dans l’équipe.' : ''
    },
  }))

  return [
    {
      key: 'title',
      label: 'Titre du projet',
      placeholder: 'Ex. : Plateforme de suivi des projets PFE',
      required: true,
      requiredMessage: 'Le titre du projet est obligatoire.',
      section: 'Informations du projet',
      half: true,
    },
    {
      key: 'academicYear',
      label: 'Année académique',
      type: 'select',
      options: ACADEMIC_YEARS.map((year) => ({ value: year, label: year })),
      required: true,
      half: true,
    },
    {
      key: 'domain',
      label: 'Domaine',
      type: 'select',
      placeholder: 'Sélectionner un domaine',
      options: PROJECT_DOMAINS.map((domain) => ({ value: domain, label: domain })),
      required: true,
      requiredMessage: 'Sélectionnez un domaine.',
      half: true,
    },
    {
      key: 'company',
      label: 'Entreprise éventuelle',
      placeholder: 'Ex. : Sonatrach',
      half: true,
    },
    {
      key: 'teamType',
      label: 'Type d’équipe',
      type: 'select',
      options: TEAM_TYPE_OPTIONS,
      required: true,
      section: 'Composition de l’équipe',
    },
    ...studentSlots,
    {
      key: 'supervisor',
      label: 'Encadrant principal',
      type: 'select',
      placeholder: 'Sélectionner un encadrant',
      options: options.professorOptions,
      required: true,
      requiredMessage: 'Sélectionnez l’encadrant principal.',
      section: 'Encadrants',
      half: true,
    },
    {
      key: 'coSupervisor',
      label: 'Co-encadrant',
      type: 'select',
      // Pas de placeholder : « Aucun » (valeur vide) est l'état de départ
      options: [{ value: '', label: 'Aucun' }, ...options.professorOptions],
      half: true,
      validate: (value, values) =>
        value === values.supervisor
          ? 'Le co-encadrant doit être différent de l’encadrant principal.'
          : '',
    },
    {
      key: 'notes',
      label: 'Notes',
      type: 'textarea',
      rows: 4,
      placeholder: 'Ex. : Projet interdisciplinaire avec suivi régulier des livrables.',
      section: 'Notes',
    },
  ]
}

export function projectToFormValues(project: Project): FormValues {
  const values: FormValues = {
    title: project.title,
    academicYear: project.academicYear,
    domain: project.domain,
    company: project.company,
    teamType: project.teamType,
    supervisor: String(project.supervisorId),
    coSupervisor: project.coSupervisorId === null ? '' : String(project.coSupervisorId),
    notes: project.notes,
  }
  SLOTS.forEach((slot) => {
    const id = project.studentIds[slot - 1]
    values[`student${slot}`] = id === undefined ? '' : String(id)
  })
  return values
}

/** Valeurs proposées à l'ouverture du formulaire de création */
export function defaultProjectValues(): FormValues {
  return { academicYear: ACADEMIC_YEARS[0] ?? '', teamType: 'pair' }
}

export function toProjectData(values: FormValues): ProjectFormData {
  const get = (key: string) => values[key] ?? ''
  return {
    title: get('title'),
    academicYear: get('academicYear'),
    domain: get('domain'),
    company: get('company'),
    teamType: get('teamType') as TeamType,
    // Les champs d'étudiants masqués arrivent vides et sont écartés
    studentIds: SLOTS.map((slot) => get(`student${slot}`))
      .filter(Boolean)
      .map(Number),
    supervisorId: Number(get('supervisor')),
    coSupervisorId: get('coSupervisor') ? Number(get('coSupervisor')) : null,
    notes: get('notes'),
  }
}