import { computed, ref, type Ref } from 'vue'
import type { Student } from '../types/student'
import { fullName } from '../utils/student'

// Minuscules + sans accents : « ines » trouve « Inès »
function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim()
}

export function useStudentFilters(students: Ref<Student[]>) {
  const search = ref('')
  const specialty = ref('') // '' = toutes

  const specialtyOptions = computed(() => {
    const unique = [...new Set(students.value.map((student) => student.specialty))].sort((a, b) =>
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
      const matchesSpecialty = !specialty.value || student.specialty === specialty.value
      const matchesSearch =
        !query ||
        normalize(fullName(student)).includes(query) ||
        normalize(student.matricule).includes(query)
      return matchesSpecialty && matchesSearch
    })
  })

  return { search, specialty, specialtyOptions, filtered }
}