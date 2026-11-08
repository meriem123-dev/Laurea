import type { Project, ProjectFormData } from "../../../types/project";
import type { ProjectStatus } from "../../../types/student";
import { http } from "../../../api/http";

export async function fetchProjects(): Promise<Project[]> {
  const { data } = await http.get<Project[]>("api/projects");
  return data;
}

export async function fetchProject(id: string): Promise<Project> {
  const { data } = await http.get<Project>(`api/projects/${id}`);
  return data;
}

export async function createProject(input: ProjectFormData): Promise<Project> {
  const { data } = await http.post<Project>("api/projects", input);
  return data;
}

export async function updateProject(
  id: string,
  input: Partial<ProjectFormData>,
): Promise<Project> {
  const { data } = await http.patch<Project>(`api/projects/${id}`, input);
  return data;
}

export async function updateProjectStatus(
  id: string,
  status: ProjectStatus,
): Promise<Project> {
  const { data } = await http.patch<Project>(`api/projects/${id}/status`, {
    status,
  });
  return data;
}

export async function deleteProject(id: string): Promise<void> {
  await http.delete(`api/projects/${id}`);
}
