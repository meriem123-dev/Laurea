import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as adminsApi from '../api/admins.api'
import { getErrorMessage } from '../../../utils/apiError'
import type { Admin, AdminPayload } from '../../../types/admin'

export const useAdminsStore = defineStore('admins', () => {
  const items = ref<Admin[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      items.value = await adminsApi.fetchAdmins()
    } catch (e) {
      error.value = getErrorMessage(e, 'Impossible de charger les administrateurs.')
    } finally {
      loading.value = false
    }
  }

  // Les actions d'écriture laissent remonter l'erreur : la vue décide quoi afficher
  async function create(data: AdminPayload) {
    const { admin, emailSent } = await adminsApi.createAdmin(data)
    items.value.unshift(admin)
    return emailSent
  }

  async function update(id: string, data: AdminPayload) {
    const updated = await adminsApi.updateAdmin(id, data)
    items.value = items.value.map((a) => (a.id === id ? updated : a))
  }

  async function remove(id: string) {
    await adminsApi.deleteAdmin(id)
    items.value = items.value.filter((a) => a.id !== id)
  }

  return { items, loading, error, fetchAll, create, update, remove }
})