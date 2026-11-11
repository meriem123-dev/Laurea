import { http } from "./http";
import type { MyProject } from "../types/project";
import type { ProjectDocument } from "../types/document";

export async function fetchMyProjects(): Promise<MyProject[]> {
  const { data } = await http.get<MyProject[]>("api/projects/me");
  return data;
}

export async function fetchDocuments(projectId: string): Promise<ProjectDocument[]> {
  const { data } = await http.get<ProjectDocument[]>(
    `api/projects/${projectId}/documents`,
  );
  return data;
}

export async function uploadDocument(
  projectId: string,
  file: File,
): Promise<ProjectDocument> {
  const form = new FormData();
  form.append("file", file); // même nom de champ que FileInterceptor("file")
  const { data } = await http.post<ProjectDocument>(
    `api/projects/${projectId}/documents`,
    form,
  );
  return data;
}

// Évaluation par l'encadrant : grade null = pas de note (le document reste « en attente »)
export async function evaluateDocument(
  id: number,
  grade: number | null,
  comment: string,
): Promise<ProjectDocument> {
  const { data } = await http.patch<ProjectDocument>(
    `api/documents/${id}/evaluation`,
    { grade, comment },
  );
  return data;
}

// Le PDF exige le Bearer token : on le télécharge en blob puis on l'ouvre.
// L'onglet est ouvert tout de suite (avant l'await) pour éviter le bloqueur de pop-up.
export async function openDocument(id: number): Promise<void> {
  const win = window.open("", "_blank");
  try {
    const { data } = await http.get<Blob>(`api/documents/${id}/file`, {
      responseType: "blob",
    });
    const url = URL.createObjectURL(data);
    if (win) {
      win.location.href = url;
    } else {
      const a = document.createElement("a");
      a.href = url;
      a.download = "document.pdf";
      a.click();
    }
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch (e) {
    win?.close();
    throw e;
  }
}