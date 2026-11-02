import type { Student } from '../types/student'

// Données fictives : à remplacer par les appels API (api/ + store)
export const students: Student[] = [
  {
    id: "1",
    firstName: 'Lina',
    lastName: 'Bensaïd',
    email: 'lina.bensaid@univ.fr',
    matricule: 'ETU-2025-014',
    speciality: 'INTELLIGENCE_ARTIFICIELLE',
    group: 'M2-IA-01',
    cursus: 'MASTER',
    projectStatus: 'validated',
    accountStatus: 'PENDING'
  },
  {
    id: "2",
    firstName: 'Yacine',
    lastName: 'Haddad',
    email: 'yacine.haddad@univ.fr',
    matricule: 'ETU-2025-027',
    speciality: 'RESEAUX_SEC',
    group: 'M2-SI-02',
    cursus: 'MASTER',
    projectStatus: 'defended',
    accountStatus: 'PENDING'
  },
  {
    id: "3",
    firstName: 'Sarah',
    lastName: 'Khelifi',
    email: 'sarah.khelifi@univ.fr',
    matricule: 'ETU-2025-031',
    speciality: 'RESEAUX_SEC',
    group: 'M2-CS-01',
    cursus: 'MASTER',
    projectStatus: 'deposited',
    accountStatus: 'PENDING'
  },
  {
    id: "4",
    firstName: 'Mehdi',
    lastName: 'Cherif',
    email: 'mehdi.cherif@univ.fr',
    matricule: 'ETU-2025-042',
    speciality: 'DATA_SCIENCE',
    group: 'M2-DS-01',
    cursus: 'MASTER',
    projectStatus: 'graded',
    accountStatus: 'PENDING'
  },
  {
    id: "5",
    firstName: 'Inès',
    lastName: 'Touati',
    email: 'ines.touati@univ.fr',
    matricule: 'ETU-2025-058',
    speciality: 'DATA_SCIENCE',
    group: 'M2-GL-02',
    cursus: 'MASTER',
    projectStatus: 'closed',
    accountStatus: 'PENDING'
  },
    {
    id: "6",
    firstName: 'Meriem',
    lastName: 'Hamouche',
    email: 'meriem.hamouche@univ.fr',
    matricule: 'ETU-2025-063',
    speciality: 'INTELLIGENCE_ARTIFICIELLE',
    group: 'M2-IA-01',
    cursus: 'MASTER',
    projectStatus: 'validated',
    accountStatus: 'PENDING'
  },
    {
    id: "7",
    firstName: 'Anis',
    lastName: 'Boukhalfa',
    email: 'anis.boukhalfa@univ.fr',
    matricule: 'ETU-2025-071',
    speciality: 'GENIE_LOGICIEL',
    group: 'M2-GL-02',
    cursus: 'MASTER',
    projectStatus: 'deposited',
    accountStatus: 'PENDING'
  },
  {
    id: "8",
    firstName: 'Nour',
    lastName: 'Benali',
    email: 'nour.benali@univ.fr',
    matricule: 'ETU-2025-074',
    speciality: 'DATA_SCIENCE',
    group: 'M2-DS-01',
    cursus: 'MASTER',
    projectStatus: 'deposited',
    accountStatus: 'PENDING'
  },
  {
    id: "9",
    firstName: 'Rayan',
    lastName: 'Slimani',
    email: 'rayan.slimani@univ.fr',
    matricule: 'ETU-2025-079',
    speciality: 'RESEAUX_SEC',
    group: 'M2-CS-01',
    cursus: 'MASTER',
    projectStatus: 'deposited',
    accountStatus: 'PENDING'
  },
  {
    id: "10",
    firstName: 'Camélia',
    lastName: 'Ouali',
    email: 'camelia.ouali@univ.fr',
    matricule: 'ETU-2025-083',
    speciality: 'INTELLIGENCE_ARTIFICIELLE',
    group: 'M2-IA-01',
    cursus: 'MASTER',
    projectStatus: 'deposited',
    accountStatus: 'PENDING'
  },
]