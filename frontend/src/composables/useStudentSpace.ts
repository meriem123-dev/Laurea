import { computed, ref } from 'vue'
import { professors } from '../mocks/professors'
import { projects } from '../mocks/projects'
import { projectMeta } from '../mocks/studentSpace'
import { students } from '../mocks/students'
import { teamMembers } from '../utils/project'
import { useDefensesData } from './useDefensesData'

// Description modifiable par l'étudiant. État partagé au niveau du module.
// TODO backend : PATCH /projects/:id/description
const descriptions = ref<Record<string, string>>(
  Object.fromEntries(Object.entries(projectMeta).map(([id, meta]) => [id, meta.description])),
)

// TODO backend : remplacer par GET /students/me/project
export function useStudentSpace(studentId: string) {
  const { views } = useDefensesData()

  const student = computed(() => students.find((item) => item.id === studentId))
  const project = computed(() => projects.find((item) => item.studentIds.includes(studentId)))
  const team = computed(() => (project.value ? teamMembers(project.value, students) : []))
  const supervisor = computed(() =>
    professors.find((item) => item.id === project.value?.supervisorId),
  )
  const defense = computed(() =>
    views.value.find((view) => view.defense.projectId === project.value?.id),
  )
  const meta = computed(() => (project.value ? projectMeta[project.value.id] : undefined))
  const description = computed(() =>
    project.value ? (descriptions.value[project.value.id] ?? '') : '',
  )

  function setDescription(text: string) {
    if (project.value) descriptions.value = { ...descriptions.value, [project.value.id]: text }
  }

  return { student, project, team, supervisor, defense, meta, description, setDescription }
}