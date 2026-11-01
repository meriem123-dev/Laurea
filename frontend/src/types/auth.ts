export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN_STAFF'

export interface LoginPayload {
  email: string
  password: string
  remember: boolean
  role: UserRole
}