import type {
  Student,
  StudentFormData,
  AccountStatus,
  Speciality,
  Cursus,
  ImportError,
  ImportResult,
} from "../../../types/student";
import { http } from "../../../api/http";

export interface StudentDto {
  id: string;
  matricule: string;
  speciality: Speciality;
  group: string | null;
  cursus: Cursus;
  accountStatus: AccountStatus;
  userId: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
  };
}

export interface StudentFilters {
  speciality?: Speciality;
  group?: string;
}

/* ---------- Mapping ---------- */

function toPayload(data: StudentFormData) {
  return { ...data, group: data.group || null };
}

export function toStudent(dto: StudentDto): Student {
  return {
    id: dto.id,
    firstName: dto.user.firstName,
    lastName: dto.user.lastName,
    email: dto.user.email,
    matricule: dto.matricule,
    speciality: dto.speciality,
    group: dto.group ?? "",
    cursus: dto.cursus,
    accountStatus: dto.accountStatus,
    // pas encore fourni par le back
    projectStatus: "deposited",
  };
}

/* ---------- Appels CRUD ---------- */

export async function fetchStudents(
  filters: StudentFilters = {},
): Promise<Student[]> {
  // axios gère la query string et ignore les valeurs undefined
  const { data } = await http.get<StudentDto[]>("api/students", {
    params: {
      speciality: filters.speciality || undefined,
      group: filters.group || undefined,
    },
  });
  return data.map(toStudent);
}

export async function fetchStudent(id: string): Promise<Student> {
  const { data } = await http.get<StudentDto>(`api/students/${id}`);
  return toStudent(data);
}

export async function createStudent(
  input: StudentFormData,
): Promise<{ student: Student; emailSent: boolean }> {
  const { data } = await http.post<StudentDto & { emailSent: boolean }>(
    "api/students",
    toPayload(input),
  );
  const { emailSent, ...dto } = data;
  return { student: toStudent(dto), emailSent };
}

export async function updateStudent(
  id: string,
  input: StudentFormData,
): Promise<Student> {
  const { data } = await http.patch<StudentDto>(
    `api/students/${id}`,
    toPayload(input),
  );
  return toStudent(data);
}

export async function deleteStudent(id: string): Promise<void> {
  await http.delete(`api/students/${id}`);
}

export async function resendInvitation(
  id: string,
): Promise<{ emailSent: boolean }> {
  const { data } = await http.post<{ emailSent: boolean }>(
    `api/students/${id}/resend-invitation`,
  );
  return data;
}

// importation
export async function importStudents(file: File): Promise<ImportResult> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await http.post<ImportResult>("api/students/import", form);
  return data;
}

export async function downloadStudentsTemplate(): Promise<Blob> {
  const { data } = await http.get<Blob>("api/students/import/template", {
    responseType: "blob",
  });
  return data;
}
