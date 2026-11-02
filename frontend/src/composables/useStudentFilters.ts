import { computed, ref, type Ref } from 'vue'
import type { Student } from '../types/student'
import { fullName } from '../utils/student'
import { normalizeText as normalize } from '../utils/format'


export function useStudentFilters(students: Ref<Student[]>) {
  const search = ref('')
  const speciality = ref('') // '' = toutes

  const specialityOptions = computed(() => {
    const unique = [...new Set(students.value.map((student) => student.speciality))].sort((a, b) =>
      a.localeCompare(b, 'fr'),
    )
    return [
      { value: '', label: 'Toutes les spécialités' },
      ...unique.map((value) => ({ value, label: value })),
    ]
  })

  const filtered = computed(() => {
    const query = normalize(search.value)

    return students.value.filter((student) => {
      const matchesSpeciality = !speciality.value || student.speciality === speciality.value
      const matchesSearch =
        !query ||
        normalize(fullName(student)).includes(query) ||
        normalize(student.matricule).includes(query)
      return matchesSpeciality && matchesSearch
    })
  })

  return { search, speciality, specialityOptions, filtered }
}