export type Cursus = 'MASTER' | 'INGENIEUR'
export type ProjectStatus = 'deposited' | 'validated' | 'planned' | 'defended' | 'graded' | 'closed'
export type AccountStatus = 'PENDING' | 'ACTIVE' | 'DISABLED'
export type Speciality =
  | "RESEAUX_SEC"
  | "DATA_SCIENCE"
  | "GENIE_LOGICIEL"
  | "INTELLIGENCE_ARTIFICIELLE"
  | "SYSTEMES_INFORMATION";

export interface Student {
  id: string
  firstName: string
  lastName: string
  email: string
  matricule: string
  cursus: Cursus;
  speciality: Speciality
  group: string | null
  projectStatus: ProjectStatus | null
  accountStatus: AccountStatus
}

// Données saisies dans le formulaire
export type StudentFormData = Pick<
  Student,
  'firstName' | 'lastName' | 'email' | 'matricule' | 'cursus'| 'speciality' | 'group'
>

export interface ImportError {
  line: number;
  message: string;
}
export interface ImportResult {
  total: number;
  created: number;
  emailsFailed: number;
  errors: ImportError[];
}