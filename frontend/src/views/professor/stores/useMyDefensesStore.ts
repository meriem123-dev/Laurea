import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as defenseApi from '../api/defense.api'
import { getErrorMessage } from '../../../utils/apiError'
import type { TeacherDefenseDto } from '../api/defense.api'

export const useMyDefensesStore = defineStore('myDefenses', () => {
  const defenses = ref<TeacherDefenseDto[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchMine() {
    loading.value = true
    error.value = null
    try {
      defenses.value = await defenseApi.fetchMyDefenses()
    } catch (e) {
      error.value = getErrorMessage(e, 'Impossible de charger vos soutenances.')
    } finally {
      loading.value = false
    }
  }

  // appeler à la déconnexion
  function reset() {
    defenses.value = []
    error.value = null
  }

  return { defenses, loading, error, fetchMine, reset }
})