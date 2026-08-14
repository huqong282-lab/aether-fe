import { apiClient } from '../api'

export type ServerRoleRecord = {
  id: string
  serverId: string
  name: string
  color: string | null
  permissionsBitmask: string
  position: number
  isDefault: boolean
}

type RoleListResponse = {
  data: ServerRoleRecord[]
}

type RoleItemResponse = {
  data: ServerRoleRecord
}

export type CreateServerRolePayload = {
  name: string
  permissions: string
  color?: string
}

export type UpdateServerRolePayload = Partial<CreateServerRolePayload>

export const serverRoleQueryKeys = {
  list: (serverId: string) => ['servers', serverId, 'roles'] as const,
}

export async function getServerRolesRequest(serverId: string) {
  const response = await apiClient.get(`/role/${serverId}`)
  return response.data as RoleListResponse
}

export async function getServerRoleByIdRequest(serverId: string, roleId: string) {
  const response = await apiClient.get(`/role/${serverId}/${roleId}`)
  return response.data as RoleItemResponse
}

export async function createServerRoleRequest(serverId: string, payload: CreateServerRolePayload) {
  const response = await apiClient.post(`/role/${serverId}`, payload)
  return response.data as RoleItemResponse
}

export async function updateServerRoleRequest(
  serverId: string,
  roleId: string,
  payload: UpdateServerRolePayload,
) {
  const response = await apiClient.patch(`/role/${serverId}/${roleId}`, payload)
  return response.data as RoleItemResponse
}

export async function deleteServerRoleRequest(serverId: string, roleId: string) {
  const response = await apiClient.delete(`/role/${serverId}/${roleId}`)
  return response.data as { success: boolean; message: string }
}
