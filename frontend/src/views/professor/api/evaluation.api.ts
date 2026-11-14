import { http } from "../../../api/http";

export interface EvalCriterionDto {
  id: string;
  label: string;
  description: string;
  coefficient: number;
}

export interface EvalJurorDto {
  id: string;
  title: string | null;
  firstName: string;
  lastName: string;
  name: string;
  role: "president" | "examiner";
  scores: Record<string, number>;
  filled: number;
  grade: number | null;
}

export interface EvaluationDto {
  defenseId: number;
  cursus: "MASTER" | "INGENIEUR";
  defense: {
    date: string;
    time: string;
    endTime: string;
    duration: number;
    room: { name: string; block: string; pole: string };
    project: {
      id: string;
      title: string;
      domain: string;
      academicYear: string;
      status: "deposited" | "validated" | "planned" | "defended" | "graded" | "closed";
    };
    students: {
      id: string;
      firstName: string;
      lastName: string;
      matricule: string;
      cursus: "MASTER" | "INGENIEUR";
      speciality: string;
    }[];
  };
  criteria: EvalCriterionDto[];
  jurors: EvalJurorDto[];
  average: number | null;
  finalGrade: number | null;
  adjusted: boolean;
  deviation: boolean;
  justification: string;
  observations: string;
  locked: boolean;
  me: { teacherId: string | null; isJuror: boolean; isPresident: boolean; isSupervisor: boolean };
}

export interface DeliberationPatch {
  finalGrade?: number | null;
  justification?: string;
  observations?: string;
}

export async function fetchEvaluation(defenseId: number): Promise<EvaluationDto> {
  const { data } = await http.get<EvaluationDto>(`api/defenses/${defenseId}/evaluation`);
  return data;
}

export async function saveMyScores(
  defenseId: number,
  scores: { criterionId: string; value: number | null }[],
): Promise<EvaluationDto> {
  const { data } = await http.put<EvaluationDto>(`api/defenses/${defenseId}/evaluation/me`, { scores });
  return data;
}

export async function saveDeliberation(
  defenseId: number,
  patch: DeliberationPatch,
): Promise<EvaluationDto> {
  const { data } = await http.patch<EvaluationDto>(
    `api/defenses/${defenseId}/evaluation/deliberation`,
    patch,
  );
  return data;
}

export async function lockEvaluation(defenseId: number): Promise<EvaluationDto> {
  const { data } = await http.post<EvaluationDto>(`api/defenses/${defenseId}/evaluation/lock`);
  return data;
}