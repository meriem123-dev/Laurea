import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as studentsApi from '../api/students.api'
import { getErrorMessage } from '../../../utils/apiError'
import type { Student, StudentFormData } from '../../../types/student'

export const useStudentsStore = defineStore('students', () => {
  const items = ref<Student[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      items.value = await studentsApi.fetchStudents()
    } catch (e) {
      error.value = getErrorMessage(e, 'Impossible de charger les étudiants.')
    } finally {
      loading.value = false
    }
  }

  // Les actions d'écriture laissent remonter l'erreur : la vue décide quoi afficher
  async function create(data: StudentFormData) {
    const { student, emailSent } = await studentsApi.createStudent(data)
    items.value.unshift(student)
    return emailSent
  }

  async function update(id: string, data: StudentFormData) {
    const updated = await studentsApi.updateStudent(id, data)
    items.value = items.value.map((s) => (s.id === id ? updated : s))
  }

  async function remove(id: string) {
    await studentsApi.deleteStudent(id)
    items.value = items.value.filter((s) => s.id !== id)
  }

  async function resendInvitation(id: string) {
    return (await studentsApi.resendInvitation(id)).emailSent
  }

  return { items, loading, error, fetchAll, create, update, remove, resendInvitation }
})