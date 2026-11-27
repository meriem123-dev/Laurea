import { http } from "../../../api/http";
import type { Cursus, ProjectStatus, Speciality } from "../../../types/student";

// Réponse de GET /api/students/me/dashboard (tout est calculé par le back)
export interface StudentDashboardDto {
  firstName: string;
  cursus: Cursus;
  speciality: Speciality;
  project: {
    id: string;
    title: string;
    status: ProjectStatus;
    supervisor: string; // "Pr. Karim Mansouri"
  } | null;
  defense: { date: string; time: string; room: string } | null;
  documents: {
    count: number;
    evaluatedCount: number;
    last: {
      date: string;
      status: "PENDING" | "EVALUATED";
      grade: number | null;
    } | null;
  };
}

export async function fetchStudentDashboard(): Promise<StudentDashboardDto> {
  const { data } = await http.get<StudentDashboardDto>(
    "api/students/me/dashboard",
  );
  return data;
}
