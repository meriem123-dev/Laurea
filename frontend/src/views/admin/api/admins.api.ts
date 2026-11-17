import { http } from '../../../api/http'
import type { Admin, AdminPayload } from '../../../types/admin'
import type { AccountStatus } from '../../../types/student'

// Réponse du back (GET /api/admins)
export interface AdminDto {
  id: string
  email: string
  firstName: string
  lastName: string
  isActive: boolean
  isSystemAdmin: boolean
  createdAt: string
  accountStatus: AccountStatus
}

export function toAdmin(dto: AdminDto): Admin {
  return {
    id: dto.id,
    firstName: dto.firstName,
    lastName: dto.lastName,
    email: dto.email,
    accountStatus: dto.accountStatus,
    isSystemAdmin: dto.isSystemAdmin,
    createdAt: dto.createdAt,
  }
}

export async function fetchAdmins(): Promise<Admin[]> {
  const { data } = await http.get<AdminDto[]>('api/admins')
  return data.map(toAdmin)
}

export async function createAdmin(
  input: AdminPayload,
): Promise<{ admin: Admin; emailSent: boolean }> {
  const { data } = await http.post<AdminDto & { emailSent: boolean }>('api/admins', input)
  const { emailSent, ...dto } = data
  return { admin: toAdmin(dto), emailSent }
}

export async function updateAdmin(id: string, input: AdminPayload): Promise<Admin> {
  const { data } = await http.patch<AdminDto>(`api/admins/${id}`, input)
  return toAdmin(data)
}

export async function deleteAdmin(id: string): Promise<void> {
  await http.delete(`api/admins/${id}`)
}