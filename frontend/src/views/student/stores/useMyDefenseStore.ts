import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as defenseApi from '../api/defense.api'
import { getErrorMessage } from '../../../utils/apiError'
import type { MyDefenseDto } from '../api/defense.api'

export const useMyDefenseStore = defineStore('myDefense', () => {
  const defense = ref<MyDefenseDto | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchMe() {
    loading.value = true
    error.value = null
    try {
      defense.value = await defenseApi.fetchMyDefense()
    } catch (e) {
      error.value = getErrorMessage(e, 'Impossible de charger votre soutenance.')
    } finally {
      loading.value = false
    }
  }

  // appeler à la déconnexion
  function reset() {
    defense.value = null
    error.value = null
  }

  return { defense, loading, error, fetchMe, reset }
})