import type { ProjectStatus } from "./student";
import type{ Speciality } from "./student";

export type TeamType = "solo" | "pair" | "trio" |"quad";

export interface Project {
  id: string;
  title: string;
  domain: Speciality;
  company: string;
  academicYear: string;
  teamType: TeamType;
  studentIds: string[];
  supervisorId: string;
  coSupervisorId: string | null;
  notes: string;
  status: ProjectStatus;
}

export interface ProjectFormData {
  title: string;
  academicYear: string;
  domain: Speciality;
  company: string;
  teamType: TeamType;
  studentIds: string[];
  supervisorId: string;
  coSupervisorId: string | null;
  notes: string;
}
