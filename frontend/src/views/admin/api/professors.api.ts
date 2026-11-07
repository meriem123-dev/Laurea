import type { Professor, ProfessorTitle } from "../../../types/professor";
import type { AccountStatus, ImportResult } from "../../../types/student";
import { http } from "../../../api/http";

/*
 * Le type Professor (types/professor.ts) reste inchangé : les autres pages
 * (jurys, soutenances, dashboards…) l'utilisent encore avec les données fictives.
 * Le professeur venant de l'API EST un Professor (même id: number, utilisé pour l'affichage),
 * avec en plus :
 *  - uuid : l'identifiant réel en base, utilisé pour les appels au back
 *  - firstName / lastName / accountStatus : infos du compte
 */
export type ApiProfessor = Professor & {
  uuid: string;
  firstName: string;
  lastName: string;
  accountStatus: AccountStatus;
};

// Professeur renvoyé par l'API, avant que le store lui attribue son id d'affichage
export type ProfessorData = Omit<ApiProfessor, "id">;

// Données envoyées au back (mêmes noms que CreateTeacherDto)
export interface ProfessorPayload {
  firstName: string;
  lastName: string;
  email: string;
  title: ProfessorTitle | null; // null = pas de titre
  specialty: string;
}

// Réponse du back (GET /api/teachers)
export interface TeacherDto {
  id: string;
  userId: string;
  title: ProfessorTitle | null;
  specialty: string;
  accountStatus: AccountStatus;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
  };
}

export interface ProfessorFilters {
  specialty?: string;
  title?: ProfessorTitle;
}

/* ---------- Mapping ---------- */

export function toProfessor(dto: TeacherDto): ProfessorData {
  return {
    uuid: dto.id,
    title: dto.title ?? undefined,
    firstName: dto.user.firstName,
    lastName: dto.user.lastName,
    name: `${dto.user.firstName} ${dto.user.lastName}`,
    email: dto.user.email,
    specialty: dto.specialty,
    accountStatus: dto.accountStatus,
    // valeurs statiques : pas encore fournies par le back (modules jurys / projets / indisponibilités)
    busyOn: undefined,
    juryCount: 0,
    projectCount: 0,
  };
}

/* ---------- Appels CRUD ---------- */

export async function fetchProfessors(
  filters: ProfessorFilters = {},
): Promise<ProfessorData[]> {
  const { data } = await http.get<TeacherDto[]>("api/teachers", {
    params: {
      specialty: filters.specialty || undefined,
      title: filters.title || undefined,
    },
  });
  return data.map(toProfessor);
}

export async function fetchProfessor(uuid: string): Promise<ProfessorData> {
  const { data } = await http.get<TeacherDto>(`api/teachers/${uuid}`);
  return toProfessor(data);
}

export async function createProfessor(
  input: ProfessorPayload,
): Promise<{ professor: ProfessorData; emailSent: boolean }> {
  const { data } = await http.post<TeacherDto & { emailSent: boolean }>(
    "api/teachers",
    // à la création, on n'envoie pas title si vide
    { ...input, title: input.title ?? undefined },
  );
  const { emailSent, ...dto } = data;
  return { professor: toProfessor(dto), emailSent };
}

export async function updateProfessor(
  uuid: string,
  input: ProfessorPayload,
): Promise<ProfessorData> {
  // title: null -> le back retire le titre
  const { data } = await http.patch<TeacherDto>(`api/teachers/${uuid}`, input);
  return toProfessor(data);
}

export async function deleteProfessor(uuid: string): Promise<void> {
  await http.delete(`api/teachers/${uuid}`);
}

// importation (même format de réponse que l'import des étudiants)
export async function importProfessors(file: File): Promise<ImportResult> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await http.post<ImportResult>("api/teachers/import", form);
  return data;
}

export async function downloadProfessorsTemplate(): Promise<Blob> {
  const { data } = await http.get<Blob>("api/teachers/import/template", {
    responseType: "blob",
  });
  return data;
}
