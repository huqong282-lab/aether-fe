import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { normalizeApiError } from '../../../lib/api-error'
import { useAuthStore } from '../../../state/auth.state'
import { getServerByIdRequest, type ServerRecord } from '../../../lib/server/server.api'
import {
  createServerRoleRequest,
  deleteServerRoleRequest,
  getServerRolesRequest,
  serverRoleQueryKeys,
  updateServerRoleRequest,
  type ServerRoleRecord,
} from '../../../lib/server/server-role.api'

type ServerSettingsLocationState = {
  serverName?: string
}

type RolePermissionOption = {
  id: string
  label: string
  description: string
  bit: bigint
  assignableByNonOwner: boolean
}

const ROLE_PERMISSION_OPTIONS: RolePermissionOption[] = [
  {
    id: 'view_channel',
    label: 'View Channels',
    description: 'Allow members to see text and voice channels.',
    bit: 1n << 0n,
    assignableByNonOwner: true,
  },
  {
    id: 'send_messages',
    label: 'Send Messages',
    description: 'Allow members to send messages in channels.',
    bit: 1n << 1n,
    assignableByNonOwner: true,
  },
  {
    id: 'manage_messages',
    label: 'Manage Messages',
    description: 'Allow members to delete or moderate messages.',
    bit: 1n << 2n,
    assignableByNonOwner: true,
  },
  {
    id: 'connect',
    label: 'Connect',
    description: 'Allow members to join voice channels.',
    bit: 1n << 3n,
    assignableByNonOwner: true,
  },
  {
    id: 'speak',
    label: 'Speak',
    description: 'Allow members to talk in voice channels.',
    bit: 1n << 4n,
    assignableByNonOwner: true,
  },
  {
    id: 'stream',
    label: 'Stream',
    description: 'Allow members to stream in voice channels.',
    bit: 1n << 5n,
    assignableByNonOwner: true,
  },
  {
    id: 'create_invite',
    label: 'Create Invite',
    description: 'Allow members to create invite links.',
    bit: 1n << 6n,
    assignableByNonOwner: true,
  },
  {
    id: 'manage_channels',
    label: 'Manage Channels',
    description: 'Create, edit, and reorder channels.',
    bit: 1n << 7n,
    assignableByNonOwner: false,
  },
  {
    id: 'manage_categories',
    label: 'Manage Categories',
    description: 'Create, edit, and reorder categories.',
    bit: 1n << 8n,
    assignableByNonOwner: false,
  },
  {
    id: 'manage_roles',
    label: 'Manage Roles',
    description: 'Create and edit roles for this server.',
    bit: 1n << 9n,
    assignableByNonOwner: false,
  },
  {
    id: 'kick_members',
    label: 'Kick Members',
    description: 'Remove members from the server.',
    bit: 1n << 10n,
    assignableByNonOwner: false,
  },
  {
    id: 'ban_members',
    label: 'Ban Members',
    description: 'Block members from rejoining the server.',
    bit: 1n << 11n,
    assignableByNonOwner: false,
  },
  {
    id: 'manage_server',
    label: 'Manage Server',
    description: 'Change core server settings.',
    bit: 1n << 12n,
    assignableByNonOwner: false,
  },
  {
    id: 'administrator',
    label: 'Administrator',
    description: 'Grant full access to all server permissions.',
    bit: 1n << 13n,
    assignableByNonOwner: false,
  },
  {
    id: 'attach_files',
    label: 'Attach Files',
    description: 'Allow members to upload attachments.',
    bit: 1n << 14n,
    assignableByNonOwner: true,
  },
]

const NON_OWNER_ASSIGNABLE_MASK = ROLE_PERMISSION_OPTIONS.reduce((mask, option) => {
  if (!option.assignableByNonOwner) {
    return mask
  }

  return mask | option.bit
}, 0n)

function maskToSelectedIds(mask: bigint) {
  return ROLE_PERMISSION_OPTIONS.filter((option) => (mask & option.bit) === option.bit).map(
    (option) => option.id,
  )
}

function selectedIdsToMask(selectedIds: string[]) {
  return selectedIds.reduce((mask, selectedId) => {
    const option = ROLE_PERMISSION_OPTIONS.find((item) => item.id === selectedId)
    if (!option) {
      return mask
    }

    return mask | option.bit
  }, 0n)
}

function maskToPermissionLabels(mask: bigint) {
  return ROLE_PERMISSION_OPTIONS.filter((option) => (mask & option.bit) === option.bit).map(
    (option) => option.label,
  )
}

function BackArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M15 6l-6 6 6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 7V5.5A1.5 1.5 0 0110.5 4h3A1.5 1.5 0 0115 5.5V7" stroke="currentColor" strokeWidth="2" />
      <path d="M8 7l1 13h6l1-13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SettingsSectionItem({
  label,
  active = false,
  onClick,
}: {
  label: string
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex w-full items-center rounded-xl px-4 py-3 text-left text-sm font-semibold transition',
        active ? 'bg-white/[0.08] text-slate-50' : 'text-slate-400 hover:bg-white/5 hover:text-slate-100',
      ].join(' ')}
    >
      <span>{label}</span>
    </button>
  )
}

function PermissionRow({
  option,
  checked,
  disabled,
  onToggle,
}: {
  option: RolePermissionOption
  checked: boolean
  disabled: boolean
  onToggle: () => void
}) {
  return (
    <label
      className={[
        'flex items-start gap-4 rounded-2xl border px-4 py-4 transition',
        disabled
          ? 'cursor-not-allowed border-white/[0.05] bg-white/[0.02] opacity-60'
          : 'cursor-pointer border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.05]',
      ].join(' ')}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        disabled={disabled}
        className="mt-1 h-4 w-4 rounded border-white/30 bg-transparent text-[#5865F2] focus:ring-0 focus:ring-offset-0"
      />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-slate-50">{option.label}</span>
        <span className="mt-1 block text-sm leading-6 text-slate-400">{option.description}</span>
      </span>
    </label>
  )
}

function RolePill({
  role,
  active,
  onClick,
}: {
  role: ServerRoleRecord
  active: boolean
  onClick: () => void
}) {
  const permissionsCount = maskToPermissionLabels(BigInt(role.permissionsBitmask)).length

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'group flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition',
        active
          ? 'border-white/10 bg-white/[0.08] shadow-[0_14px_36px_rgba(0,0,0,0.18)]'
          : 'border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06]',
      ].join(' ')}
    >
      <span className="flex min-w-0 items-center gap-3">
        <span
          className="h-9 w-9 shrink-0 rounded-full border border-white/10"
          style={{ backgroundColor: role.color ?? '#5865F2' }}
        />
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-slate-50">
            {role.name}
            {role.isDefault ? ' (default)' : ''}
          </span>
          <span className="block text-xs text-slate-400">
            {permissionsCount} permissions · position {role.position}
          </span>
        </span>
      </span>
      <ChevronRightIcon />
    </button>
  )
}

function RoleEditorModal({
  mode,
  role,
  allowAllPermissions,
  onCancel,
  onSubmit,
  isPending,
}: {
  mode: 'create' | 'edit'
  role: ServerRoleRecord | null
  allowAllPermissions: boolean
  onCancel: () => void
  onSubmit: (payload: { name: string; color: string; permissions: string }) => void
  isPending: boolean
}) {
  const initialName = role?.name ?? ''
  const initialColor = role?.color ?? '#5865F2'
  const initialPermissionIds = useMemo(
    () =>
      role
        ? maskToSelectedIds(BigInt(role.permissionsBitmask))
        : ['view_channel', 'send_messages'],
    [role?.id, role?.permissionsBitmask],
  )

  const [name, setName] = useState(role?.name ?? '')
  const [color, setColor] = useState(role?.color ?? '#5865F2')
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>(initialPermissionIds)

  useEffect(() => {
    setName(initialName)
    setColor(initialColor)
    setSelectedPermissionIds(initialPermissionIds)
  }, [initialColor, initialName, initialPermissionIds])

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel()
      }
    }

    document.addEventListener('keydown', handleEscape)

    const previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = previousBodyOverflow
    }
  }, [onCancel])

  const togglePermission = (permissionId: string) => {
    const option = ROLE_PERMISSION_OPTIONS.find((item) => item.id === permissionId)
    if (!option) {
      return
    }

    if (!allowAllPermissions && !option.assignableByNonOwner) {
      return
    }

    setSelectedPermissionIds((current) =>
      current.includes(permissionId)
        ? current.filter((item) => item !== permissionId)
      : [...current, permissionId],
    )
  }

  const initialPermissionMask = selectedIdsToMask(initialPermissionIds)
  const currentPermissionMask = selectedIdsToMask(selectedPermissionIds)
  const hasUnsavedChanges =
    mode === 'edit' &&
    (name.trim() !== initialName.trim() ||
      color !== initialColor ||
      currentPermissionMask !== initialPermissionMask)

  const handleReset = () => {
    setName(initialName)
    setColor(initialColor)
    setSelectedPermissionIds(initialPermissionIds)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
      <div className="my-auto flex max-h-[calc(100vh-2rem)] w-full max-w-4xl flex-col overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#2f3136] p-6 text-white shadow-[0_30px_90px_rgba(0,0,0,0.5)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
              {mode === 'create' ? 'Create Role' : 'Edit Role'}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-50">
              {mode === 'create' ? 'New server role' : role?.name ?? 'Edit role'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full p-2 text-slate-400 transition hover:bg-white/[0.08] hover:text-slate-100"
            aria-label="Close role modal"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="mt-6 flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto pr-1 lg:grid lg:grid-cols-[0.75fr_1.25fr]">
          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-100">Role name</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="New Role"
                className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#5865F2]/70"
              />
            </label>

            <div className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-100">Role color</span>
              <div className="flex flex-wrap gap-3">
                {['#5865F2', '#57D6A4', '#F56A8A', '#F3B34D', '#A37EF5', '#ED4245'].map((swatch) => (
                  <button
                    key={swatch}
                    type="button"
                    onClick={() => setColor(swatch)}
                    className={[
                      'h-10 w-10 rounded-full border-2 transition',
                      color === swatch ? 'border-white' : 'border-transparent',
                    ].join(' ')}
                    style={{ backgroundColor: swatch }}
                    aria-label={`Select color ${swatch}`}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-4">
              <p className="text-sm font-semibold text-slate-100">Permission limit</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {allowAllPermissions
                  ? 'Kamu owner server, jadi semua permission bisa dipilih.'
                  : 'UI ini memakai batas konservatif agar tidak melebihi permission aktor.'}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Permissions
                </p>
                <p className="mt-2 text-sm text-slate-300">
                  Pilih permission untuk role ini.
                </p>
              </div>
              <span className="rounded-full bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-slate-200">
                {selectedPermissionIds.length} selected
              </span>
            </div>
            <div className="space-y-3">
              {ROLE_PERMISSION_OPTIONS.map((option) => {
                const checked = selectedPermissionIds.includes(option.id)
                const disabled = !allowAllPermissions && !option.assignableByNonOwner

                return (
                  <PermissionRow
                    key={option.id}
                    option={option}
                    checked={checked}
                    disabled={disabled}
                    onToggle={() => togglePermission(option.id)}
                  />
                )
              })}
            </div>
          </div>
        </div>

        {mode === 'edit' ? (
          <div
            className={[
              'mt-6 flex items-center justify-between gap-4 rounded-2xl border px-5 py-4',
              hasUnsavedChanges
                ? 'border-amber-400/30 bg-amber-400/10'
                : 'border-white/[0.06] bg-white/[0.03]',
            ].join(' ')}
          >
            <p className="text-sm font-semibold text-slate-100">
              {hasUnsavedChanges ? 'Careful — you have unsaved changes!' : 'No changes yet.'}
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                disabled={isPending || !hasUnsavedChanges}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-indigo-300 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => {
                  const trimmedName = name.trim()
                  if (!trimmedName) {
                    return
                  }

                  const selectedMask = selectedIdsToMask(selectedPermissionIds)
                  const sanitizedMask = allowAllPermissions
                    ? selectedMask
                    : selectedMask & NON_OWNER_ASSIGNABLE_MASK

                  onSubmit({
                    name: trimmedName,
                    color,
                    permissions: sanitizedMask.toString(),
                  })
                }}
                disabled={isPending || !hasUnsavedChanges}
                className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-white/[0.08]"
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                const trimmedName = name.trim()
                if (!trimmedName) {
                  return
                }

                const selectedMask = selectedIdsToMask(selectedPermissionIds)
                const sanitizedMask = allowAllPermissions
                  ? selectedMask
                  : selectedMask & NON_OWNER_ASSIGNABLE_MASK

                onSubmit({
                  name: trimmedName,
                  color,
                  permissions: sanitizedMask.toString(),
                })
              }}
              disabled={isPending}
              className="rounded-xl bg-[#5865F2] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4752c4] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isPending ? 'Saving...' : 'Create Role'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export function ServerSettingsPage() {
  const navigate = useNavigate()
  const params = useParams<{ serverId: string }>()
  const location = useLocation()
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const state = (location.state as ServerSettingsLocationState | null) ?? null
  const serverId = params.serverId ?? null

  const [editorMode, setEditorMode] = useState<'create' | 'edit' | null>(null)
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null)
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)

  const serverQuery = useQuery({
    queryKey: ['servers', serverId, 'detail'] as const,
    queryFn: async () => {
      if (!serverId) {
        return null
      }

      const response = await getServerByIdRequest(serverId)
      return response.data as ServerRecord
    },
    enabled: Boolean(serverId),
  })

  const rolesQuery = useQuery({
    queryKey: serverRoleQueryKeys.list(serverId ?? 'missing'),
    queryFn: async () => {
      if (!serverId) {
        return []
      }

      const response = await getServerRolesRequest(serverId)
      return response.data
    },
    enabled: Boolean(serverId),
  })

  const roles = rolesQuery.data ?? []
  const server = serverQuery.data ?? null
  const serverName = server?.name ?? state?.serverName ?? 'Server Settings'
  const isOwner = Boolean(server && user && server.ownerId === user.id)
  const allowAllPermissions = isOwner
  const selectedRole = useMemo(
    () => roles.find((role) => role.id === selectedRoleId) ?? roles[0] ?? null,
    [roles, selectedRoleId],
  )

  useEffect(() => {
    if (!serverId) {
      navigate('/app', { replace: true })
    }
  }, [navigate, serverId])

  useEffect(() => {
    if (!selectedRole && roles.length > 0) {
      setSelectedRoleId(roles[0].id)
    }
  }, [roles, selectedRole])

  useEffect(() => {
    if (selectedRoleId && !roles.some((role) => role.id === selectedRoleId)) {
      setSelectedRoleId(roles[0]?.id ?? null)
    }
  }, [roles, selectedRoleId])

  const createRoleMutation = useMutation({
    mutationFn: (payload: { name: string; color: string; permissions: string }) => {
      if (!serverId) {
        throw new Error('Server ID tidak valid')
      }

      return createServerRoleRequest(serverId, payload)
    },
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: serverRoleQueryKeys.list(serverId ?? 'missing') })
      setSelectedRoleId(response.data.id)
      setEditorMode(null)
      setEditingRoleId(null)
    },
  })

  const updateRoleMutation = useMutation({
    mutationFn: (payload: { roleId: string; name: string; color: string; permissions: string }) => {
      if (!serverId) {
        throw new Error('Server ID tidak valid')
      }

      return updateServerRoleRequest(serverId, payload.roleId, {
        name: payload.name,
        color: payload.color,
        permissions: payload.permissions,
      })
    },
    onSuccess: async (_response, variables) => {
      await queryClient.invalidateQueries({ queryKey: serverRoleQueryKeys.list(serverId ?? 'missing') })
      setSelectedRoleId(variables.roleId)
      setEditorMode(null)
      setEditingRoleId(null)
    },
  })

  const deleteRoleMutation = useMutation({
    mutationFn: (roleId: string) => {
      if (!serverId) {
        throw new Error('Server ID tidak valid')
      }

      return deleteServerRoleRequest(serverId, roleId)
    },
    onSuccess: async (_response, roleId) => {
      await queryClient.invalidateQueries({ queryKey: serverRoleQueryKeys.list(serverId ?? 'missing') })
      setSelectedRoleId((current) => (current === roleId ? null : current))
    },
  })

  const currentEditorRole = editingRoleId ? roles.find((role) => role.id === editingRoleId) ?? null : null
  const editorRole = editorMode === 'edit' ? currentEditorRole : null
  const roleErrorMessage = rolesQuery.error
    ? normalizeApiError(rolesQuery.error, 'Gagal memuat roles.').message
    : null
  const createErrorMessage = createRoleMutation.error
    ? normalizeApiError(createRoleMutation.error, 'Gagal membuat role.').message
    : null
  const updateErrorMessage = updateRoleMutation.error
    ? normalizeApiError(updateRoleMutation.error, 'Gagal memperbarui role.').message
    : null
  const deleteErrorMessage = deleteRoleMutation.error
    ? normalizeApiError(deleteRoleMutation.error, 'Gagal menghapus role.').message
    : null
  const activeMutationError = createErrorMessage ?? updateErrorMessage ?? deleteErrorMessage

  const openCreateModal = () => {
    setEditorMode('create')
    setEditingRoleId(null)
  }

  const openEditModal = (role: ServerRoleRecord) => {
    setEditorMode('edit')
    setEditingRoleId(role.id)
  }

  const closeModal = () => {
    setEditorMode(null)
    setEditingRoleId(null)
    createRoleMutation.reset()
    updateRoleMutation.reset()
  }

  const canDeleteRole = Boolean(selectedRole && !selectedRole.isDefault && !deleteRoleMutation.isPending)
  const selectedPermissionLabels = selectedRole ? maskToPermissionLabels(BigInt(selectedRole.permissionsBitmask)) : []

  if (!serverId) {
    return null
  }

  if (serverQuery.isLoading || rolesQuery.isLoading) {
    return (
      <main className="min-h-screen bg-[#202225] text-white">
        <div className="grid min-h-screen place-items-center">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] px-6 py-4 text-sm text-slate-300">
            Loading server settings...
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#202225] text-white">
      <div className="flex min-h-screen overflow-hidden">
        <aside className="hidden w-[320px] shrink-0 border-r border-white/[0.06] bg-[#1f2124] lg:flex lg:flex-col">
          <div className="border-b border-white/[0.06] px-6 py-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              {serverName}
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-50">Server Settings</h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Fokus halaman ini sekarang ke role management dan permission.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-5">
            <div className="space-y-2">
              <p className="px-4 text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">
                People
              </p>
              <SettingsSectionItem label="Roles" active />
            </div>

            <div className="mt-8 rounded-3xl border border-white/[0.06] bg-white/[0.03] px-4 py-4">
              <p className="text-sm font-semibold text-slate-100">Selected server</p>
              <p className="mt-1 text-sm text-slate-400">{serverName}</p>
              <p className="mt-3 text-xs leading-6 text-slate-500">
                Server ID: {serverId}
              </p>
              <p className="mt-3 text-xs leading-6 text-slate-500">
                Access: {isOwner ? 'Owner' : 'Conservative UI permissions'}
              </p>
            </div>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col bg-[#2f3136]">
          <header className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-7">
            <button
              type="button"
              onClick={() => navigate(`/app/servers/${serverId}`)}
              className="flex items-center gap-3 text-left text-sm font-semibold text-slate-300 transition hover:text-slate-50"
            >
              <BackArrowIcon />
              <span>Back to server</span>
            </button>

            <button
              type="button"
              onClick={() => navigate(`/app/servers/${serverId}`)}
              className="rounded-full p-2 text-slate-400 transition hover:bg-white/[0.08] hover:text-slate-100"
              aria-label="Close server settings"
            >
              <CloseIcon />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-7">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
              <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="rounded-[28px] border border-white/[0.06] bg-white/[0.04] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.16)]">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Roles
                  </p>
                  <h2 className="mt-3 text-4xl font-semibold tracking-tight text-white">
                    Organize your members
                  </h2>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
                    Role sekarang dibaca langsung dari backend. Create, edit, dan delete akan
                    tersimpan ke server, sementara pilihan permission dibatasi secara konservatif
                    kalau kamu bukan owner.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={openCreateModal}
                      className="inline-flex items-center gap-2 rounded-2xl bg-[#5865F2] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4752c4]"
                    >
                      <PlusIcon />
                      Create Role
                    </button>
                  </div>

                  {activeMutationError ? (
                    <div className="mt-5 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                      {activeMutationError}
                    </div>
                  ) : null}
                </div>

                <div className="rounded-[28px] border border-white/[0.06] bg-white/[0.04] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.16)]">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Server preview
                  </p>
                  <div className="mt-5 rounded-[28px] bg-[linear-gradient(180deg,#9bb9ff_0%,#87b1ff_100%)] p-6 text-slate-950">
                    <div className="mx-auto flex max-w-[320px] flex-col items-center rounded-[28px] bg-[#1f2124] px-5 py-6 text-white shadow-[0_18px_50px_rgba(0,0,0,0.32)]">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#5865F2] text-3xl font-black">
                        S
                      </div>
                      <p className="mt-4 text-xl font-bold tracking-tight">{serverName}</p>
                      <div className="mt-3 flex flex-wrap justify-center gap-2">
                        <span className="rounded-full bg-white/[0.08] px-3 py-1.5 text-xs font-semibold">
                          {roles.length} roles
                        </span>
                        <span className="rounded-full bg-white/[0.08] px-3 py-1.5 text-xs font-semibold">
                          {isOwner ? 'Owner access' : 'UI-limited access'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-white/[0.06] bg-[#202225] px-4 py-4 text-sm leading-6 text-slate-300">
                    Backend endpoint yang dipakai: <span className="font-semibold text-slate-100">GET/POST/PATCH/DELETE /api/role</span>
                  </div>
                </div>
              </section>

              <section className="grid gap-5 rounded-[28px] border border-white/[0.06] bg-white/[0.04] p-6 lg:grid-cols-[0.9fr_1.1fr]">
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
                        Roles
                      </p>
                      <p className="mt-2 text-sm text-slate-300">
                        Pilih role untuk melihat permission yang tersimpan di backend.
                      </p>
                    </div>
                    <span className="rounded-full bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-slate-200">
                      {roles.length}
                    </span>
                  </div>

                  {roleErrorMessage ? (
                    <div className="mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                      {roleErrorMessage}
                    </div>
                  ) : null}

                  <div className="mt-4 space-y-3">
                    {roles.length > 0 ? (
                      roles.map((role) => (
                        <RolePill
                          key={role.id}
                          role={role}
                          active={role.id === selectedRole?.id}
                          onClick={() => setSelectedRoleId(role.id)}
                        />
                      ))
                    ) : (
                      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-5 text-sm text-slate-300">
                        Belum ada role yang dimuat.
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="rounded-[24px] border border-white/[0.06] bg-[#202225] p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
                          Selected Role
                        </p>
                        <h3 className="mt-2 text-2xl font-semibold text-slate-50">
                          {selectedRole?.name ?? 'No role selected'}
                        </h3>
                      </div>
                      {selectedRole ? (
                        <span
                          className="h-5 w-5 rounded-full ring-4 ring-white/5"
                          style={{ backgroundColor: selectedRole.color ?? '#5865F2' }}
                          aria-hidden="true"
                        />
                      ) : null}
                    </div>

                    {selectedRole ? (
                      <>
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          <span className="rounded-full bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-slate-200">
                            position {selectedRole.position}
                          </span>
                          <span className="rounded-full bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-slate-200">
                            {selectedRole.isDefault ? 'default role' : 'custom role'}
                          </span>
                          <span className="rounded-full bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-slate-200">
                            {selectedPermissionLabels.length} permissions
                          </span>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-2">
                          {selectedPermissionLabels.map((label) => (
                            <span
                              key={label}
                              className="rounded-full bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-slate-100"
                            >
                              {label}
                            </span>
                          ))}
                        </div>

                        <div className="mt-5 flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => openEditModal(selectedRole)}
                            className="rounded-xl bg-white/[0.08] px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-white/[0.12]"
                          >
                            Edit Role
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!selectedRole || selectedRole.isDefault) {
                                return
                              }

                              const confirmed = window.confirm(
                                `Hapus role "${selectedRole.name}"? Aksi ini hanya FE saat ini, tapi request delete akan dikirim ke backend.`,
                              )

                              if (!confirmed) {
                                return
                              }

                              deleteRoleMutation.mutate(selectedRole.id)
                            }}
                            disabled={!canDeleteRole}
                            className="inline-flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-2.5 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <TrashIcon />
                            Delete Role
                          </button>
                        </div>
                      </>
                    ) : (
                      <p className="mt-4 text-sm leading-6 text-slate-400">
                        Pilih role di sisi kiri untuk melihat detail permission-nya.
                      </p>
                    )}
                  </div>

                  <div className="rounded-[24px] border border-white/[0.06] bg-[#202225] p-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
                      Default Permissions
                    </p>
                    <p className="mt-3 text-sm leading-6 text-slate-300">
                      Role <span className="font-semibold text-slate-50">@everyone</span> adalah
                      fondasi untuk semua member server.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </section>
      </div>

      {editorMode ? (
        <RoleEditorModal
          mode={editorMode}
          role={editorMode === 'edit' ? editorRole : null}
          allowAllPermissions={allowAllPermissions}
          isPending={createRoleMutation.isPending || updateRoleMutation.isPending}
          onCancel={closeModal}
          onSubmit={(payload) => {
            if (!serverId) {
              return
            }

            if (editorMode === 'create') {
              createRoleMutation.mutate(payload)
              return
            }

            if (editorMode === 'edit' && editingRoleId) {
              updateRoleMutation.mutate({
                roleId: editingRoleId,
                ...payload,
              })
            }
          }}
        />
      ) : null}
    </main>
  )
}
