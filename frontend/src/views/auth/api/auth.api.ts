import { http } from '../../../api/http'
import type {UserRole} from '../../../types/auth'

export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
}

export async function login(email: string, password: string, role?:UserRole) {
  const { data } = await http.post<{ accessToken: string; user: AuthUser }>(
    'api/auth/login',
    { email, password, role },
  )
  return data
}

export async function getMe() {
  const { data } = await http.get<{ id: string; role: UserRole }>('api/auth/me')
  return data
}

export async function forgotPassword(email: string) {
  await http.post('api/auth/forgot-password', { email })
}

export async function resetPassword(token: string, password: string) {
  const { data } = await http.post<{ accessToken: string; user: AuthUser }>(
    'api/auth/reset-password',
    { token, password },
  )
  return data
}