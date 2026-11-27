import { http } from "../../../api/http";
import type { UpcomingDefense } from "../../../types/dashboard";

// Réponse de GET /api/admins/dashboard (tout est calculé par le back)
export interface AdminDashboardDto {
  studentsCount: number;
  studentsWithoutProject: number;
  teachersCount: number;
  activeTeachers: number;
  projectsCount: number;
  pendingProjects: number; // projets déposés, à valider
  projectsToPlan: number; // projets validés sans soutenance
  defensesCount: number;
  upcomingDefenses: number;
  doneDefenses: number;
  incompleteJuries: number; // soutenances à venir avec un refus dans le jury
  resultsToPublish: number; // délibérations verrouillées non publiées
  upcoming: Required<
    Pick<UpcomingDefense, "id" | "date" | "time" | "room" | "student" | "project" | "status">
  >[];
}

export async function fetchAdminDashboard(): Promise<AdminDashboardDto> {
  const { data } = await http.get<AdminDashboardDto>("api/admins/dashboard");
  return data;
}