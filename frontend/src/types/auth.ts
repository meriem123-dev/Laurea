export type UserRole = 'admin' | 'professor' | 'student'

export interface LoginPayload {
  email: string
  password: string
  remember: boolean
  role: UserRole
}