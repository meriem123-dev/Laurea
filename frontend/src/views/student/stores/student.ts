import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as studentsApi from '../api/student.api'
import { getErrorMessage } from '../../../utils/apiError'
import type { Student } from '../../../types/student'

export const useMyStudentStore = defineStore('myStudent', () => {
  const student = ref<Student | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchMe() {
    loading.value = true
    error.value = null
    try {
      student.value = await studentsApi.fetchMyStudentProfile()
    } catch (e) {
      error.value = getErrorMessage(e, 'Impossible de charger votre profil.')
    } finally {
      loading.value = false
    }
  }

  // appeler à la déconnexion
  function reset() {
    student.value = null
    error.value = null
  }

  return { student, loading, error, fetchMe, reset }
})