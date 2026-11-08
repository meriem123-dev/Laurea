import { computed } from 'vue'
import { projects as projectsMock } from '../mocks/projects'

// TODO backend : remplacer par GET /professors/me/projects
export function useProfessorProjects(professorId: string) {
  const projects = computed(() =>
    projectsMock.filter(
      (project) => project.supervisorId === professorId || project.coSupervisorId === professorId,
    ),
  )

  return { projects }
}