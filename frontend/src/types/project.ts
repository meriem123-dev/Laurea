import type { ProjectStatus } from "./student";

export type TeamType = "solo" | "pair" | "trio" |"quad";

export interface Project {
  id: number;
  title: string;
  domain: string;
  company: string;
  academicYear: string;
  teamType: TeamType;
  studentIds: string[];
  supervisorId: number;
  coSupervisorId: number | null;
  notes: string;
  status: ProjectStatus;
}

export interface ProjectFormData {
  title: string;
  academicYear: string;
  domain: string;
  company: string;
  teamType: TeamType;
  studentIds: string[];
  supervisorId: number;
  coSupervisorId: number | null;
  notes: string;
}
