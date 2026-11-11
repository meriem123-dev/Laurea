import type { Defense, DefenseFormData } from "../../../types/defense";
import type { DefenseStatus } from "../../../types/dashboard";
import { http } from "../../../api/http";

export type JuryResponse = "PENDING" | "ACCEPTED" | "DECLINED";

/*
 * Le type Defense (types/defense.ts) reste inchangé.
 * La soutenance venant de l'API EST une Defense, avec en plus :
 *  - responses : réponse de chaque membre du jury { [id du professeur]: "PENDING" | "ACCEPTED" | "DECLINED" }
 *  - status : "confirmed" quand tout le jury a accepté, sinon "planned"
 */
export type ApiDefense = Defense & {
  responses: Record<string, JuryResponse>;
  status: DefenseStatus;
};

// mails envoyés par le back (convocations, rectificatifs, annulations)
export interface DefenseNotifications {
  sent: number;
  failed: number;
}

// Réponse du back (GET /api/defenses) : déjà au format du front
type DefenseDto = ApiDefense & { notifications?: DefenseNotifications };

export interface DefenseFilters {
  from?: string;
  to?: string;
  roomId?: string;
  teacherId?: string;
}

// Données envoyées au back (mêmes noms que CreateDefenseDto)
export type DefensePayload = DefenseFormData & { duration?: number };

/* ---------- Mapping ---------- */

export function toDefense(dto: DefenseDto): ApiDefense {
  return {
    id: dto.id,
    projectId: dto.projectId,
    date: dto.date,
    time: dto.time,
    duration: dto.duration,
    roomId: dto.roomId,
    presidentId: dto.presidentId,
    memberIds: dto.memberIds,
    responses: dto.responses ?? {},
    status: dto.status ?? "planned",
  };
}

const noNotifications: DefenseNotifications = { sent: 0, failed: 0 };

/* ---------- Appels CRUD ---------- */

export async function fetchDefenses(
  filters: DefenseFilters = {},
): Promise<ApiDefense[]> {
  const { data } = await http.get<DefenseDto[]>("api/defenses", {
    params: filters,
  });
  return data.map(toDefense);
}

// planifier : le back convoque étudiants, jury et encadrants par mail
export async function createDefense(
  input: DefensePayload,
): Promise<{ defense: ApiDefense; notifications: DefenseNotifications }> {
  const { data } = await http.post<DefenseDto>("api/defenses", input);
  return {
    defense: toDefense(data),
    notifications: data.notifications ?? noNotifications,
  };
}

// modifier : seuls les champs envoyés changent (le back envoie les rectificatifs)
export async function updateDefense(
  id: number,
  input: Partial<DefensePayload>,
): Promise<{ defense: ApiDefense; notifications: DefenseNotifications }> {
  const { data } = await http.patch<DefenseDto>(`api/defenses/${id}`, input);
  return {
    defense: toDefense(data),
    notifications: data.notifications ?? noNotifications,
  };
}

// supprimer : le back envoie les annulations
export async function deleteDefense(id: number): Promise<DefenseNotifications> {
  const { data } = await http.delete<{
    deleted: boolean;
    notifications?: DefenseNotifications;
  }>(`api/defenses/${id}`);
  return data.notifications ?? noNotifications;
}
