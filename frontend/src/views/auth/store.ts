import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as authApi from './api/auth.api'
import type { AuthUser } from './api/auth.api'
import type { UserRole } from '../../types/auth'

// pour état global de l'auth
function loadUser(): AuthUser | null {
  try {
    return JSON.parse(localStorage.getItem('user') ?? 'null')
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<AuthUser | null>(loadUser())

  async function login(email: string, password: string, role: UserRole) {
    const res = await authApi.login(email, password, role)
    token.value = res.accessToken
    user.value = res.user
    localStorage.setItem('token', res.accessToken)
    localStorage.setItem('user', JSON.stringify(res.user))
    return res.user
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return { token, user, login, logout }
})