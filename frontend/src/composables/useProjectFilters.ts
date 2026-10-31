import { computed, ref, type Ref } from 'vue'
import type { Project } from '../types/project'
import type { Student } from '../types/student'
import { normalizeText } from '../utils/format'
import { PROJECT_DOMAINS, teamMembers } from '../utils/project'
import { PROJECT_STATUS_META } from '../utils/projectStatus'
import { fullName } from '../utils/student'

export function useProjectFilters(projects: Ref<Project[]>, students: Ref<Student[]>) {
  const search = ref('')
  const status = ref('') // '' = tous
  const domain = ref('') // '' = tous

  const statusOptions = [
    { value: '', label: 'Tous les statuts' },
    ...Object.entries(PROJECT_STATUS_META).map(([value, meta]) => ({ value, label: meta.label })),
  ]

  const domainOptions = [
    { value: '', label: 'Tous les domaines' },
    ...PROJECT_DOMAINS.map((value) => ({ value, label: value })),
  ]

  const filtered = computed(() => {
    const query = normalizeText(search.value)

    return projects.value.filter((project) => {
      if (status.value && project.status !== status.value) return false
      if (domain.value && project.domain !== domain.value) return false
      if (!query) return true

      const names = teamMembers(project, students.value).map((student) => fullName(student))
      return [project.title, ...names].some((text) => normalizeText(text).includes(query))
    })
  })

  return { search, status, domain, statusOptions, domainOptions, filtered }
}