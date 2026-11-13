import { http } from "../../../api/http";

export interface PersonDto {
  id: string;
  title: string | null;
  firstName: string;
  lastName: string;
}

export interface MyDefenseDto {
  id: number;
  date: string; // "2026-11-15"
  time: string; // "09:00"
  duration: number;
  status: "planned" | "confirmed";
  project: { id: string; title: string };
  room: { id: string; name: string; block: string; pole: string };
  president: PersonDto;
  members: PersonDto[];
  supervisor: PersonDto;
}

// Nest renvoie un corps vide (pas de JSON) quand il n'y a pas de soutenance :
// axios donne alors "" ; on le convertit en null.
export async function fetchMyDefense(): Promise<MyDefenseDto | null> {
  const { data } = await http.get<MyDefenseDto | "">("api/defenses/my-defense");
  return data === "" || data == null ? null : data;
}