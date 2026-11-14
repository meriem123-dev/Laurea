import { http } from "../../../api/http";

export interface PersonDto {
  id: string;
  title: string | null;
  firstName: string;
  lastName: string;
}

export type JuryAnswer = "PENDING" | "ACCEPTED" | "DECLINED";
export type TeacherRole = "president" | "member" | "supervisor" | "coSupervisor";

export interface TeacherDefenseDto {
  id: number;
  date: string; // "2026-11-15"
  time: string; // "09:00"
  duration: number;
  status: "planned" | "confirmed";
  roles: TeacherRole[];
  myResponse: JuryAnswer | null;
  project: { id: string; title: string };
  students: { id: string; firstName: string; lastName: string }[];
  room: { id: string; name: string; block: string; pole: string };
  president: PersonDto;
  members: PersonDto[];
  supervisor: PersonDto;
  coSupervisor: PersonDto | null;
}

export async function fetchMyDefenses(): Promise<TeacherDefenseDto[]> {
  const { data } = await http.get<TeacherDefenseDto[]>("api/defenses/my-defenses");
  return data;
}

// accepter ou refuser sa participation au jury
export async function respondToDefense(
  id: number,
  answer: "accept" | "decline",
): Promise<void> {
  await http.post(`api/defenses/${id}/response`, { answer });
}