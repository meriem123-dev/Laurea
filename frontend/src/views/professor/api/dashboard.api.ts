import { http } from "../../../api/http";
import type { UpcomingDefense } from "../../../types/dashboard";

// Réponse de GET /api/teachers/me/dashboard (tout est calculé par le back)
export interface ProfessorDashboardDto {
  supervised: number; // projets encadrés ou co-encadrés
  pendingDocuments: number; // dépôts de ces projets pas encore notés
  upcomingCount: number; // soutenances à venir (tous rôles)
  nextDefenseDate: string | null; // "2026-12-03"
  juryCount: number; // soutenances où il est président ou juré
  toConfirm: number; // invitations au jury sans réponse
  evaluationsToEnter: number; // soutenances passées dont il n'a pas saisi la note
  oldestEvaluationDate: string | null;
  upcoming: Required<
    Pick<
      UpcomingDefense,
      "id" | "date" | "time" | "room" | "student" | "project" | "role"
    >
  >[];
}

export async function fetchProfessorDashboard(): Promise<ProfessorDashboardDto> {
  const { data } = await http.get<ProfessorDashboardDto>(
    "api/teachers/me/dashboard",
  );
  return data;
}
