import { http } from "../../../api/http";

export interface ResultRowDto {
  defenseId: number;
  date: string;
  state: "pending" | "ready" | "published";
  finalGrade: number | null;
  observations: string;
  project: { id: string; title: string; domain: string; academicYear: string };
  students: {
    id: string;
    firstName: string;
    lastName: string;
    matricule: string;
    cursus: "MASTER" | "INGENIEUR";
    speciality: string;
  }[];
  jury: {
    id: string;
    title: string | null;
    firstName: string;
    lastName: string;
    role: "president" | "examiner";
    grade: number | null;
  }[];
}

//tous les résultats
export async function fetchResults(): Promise<ResultRowDto[]> {
  const { data } = await http.get<ResultRowDto[]>("api/results");
  return data;
}

//publier dépublier
export async function setPublication(defenseId: number, published: boolean): Promise<void> {
  await http.post(`api/defenses/${defenseId}/evaluation/${published ? "publish" : "unpublish"}`);
}
