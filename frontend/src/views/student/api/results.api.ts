import { http } from "../../../api/http"; // adapte le chemin

export interface MyResultPublished {
  published: true;
  hasDefense: true;
  studentId: string;
  criteria: { id: string; label: string; description: string; coefficient: number }[];
  row: {
    defenseId: number;
    date: string;
    state: "published";
    finalGrade: number;
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
  };
}
export interface MyResultHidden {
  published: false;
  hasDefense: boolean;
}
export type MyResultDto = MyResultPublished | MyResultHidden;

export async function fetchMyResult(): Promise<MyResultDto> {
  const { data } = await http.get<MyResultDto>("api/results/me");
  return data;
}