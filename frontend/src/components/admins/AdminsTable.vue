<script setup lang="ts">
import { computed } from 'vue'
import { Pencil, Trash2 } from '@lucide/vue'
import ActionMenu, { type ActionMenuItem } from '../common/ActionMenu.vue'
import BaseCard from '../common/BaseCard.vue'
import InitialsAvatar from '../common/InitialsAvatar.vue'
import DataTable, { type TableColumn } from '../tables/DataTable.vue'
import { ACCOUNT_STATUS_META } from '../../utils/accountStatus'
import { formatLongDate } from '../../utils/format'
import type { Admin } from '../../types/admin'
import { ADMIN_TYPE_LABELS } from '../../utils/adminType'
const props = withDefaults(
  defineProps<{
    admins: Admin[]
    currentUserId?: string // pour marquer « (vous) »
    canManage?: boolean // admin système connecté : actions visibles
  }>(),
  { currentUserId: '', canManage: false },
)

const emit = defineEmits<{
  edit: [admin: Admin]
  delete: [admin: Admin]
}>()

const columns = computed<TableColumn[]>(() => [
  { key: 'admin', label: 'Administrateur' },
  { key: 'adminType', label: 'Fonction' },
  { key: 'account', label: 'Compte' },
  { key: 'createdAt', label: 'Créé le' },
  ...(props.canManage ? [{ key: 'action', label: 'Action', align: 'right' as const }] : []),
])

// L'admin système ne peut pas être supprimé : pas d'action « Supprimer » sur sa ligne
function rowActions(admin: Admin): ActionMenuItem[] {
  const items: ActionMenuItem[] = [{ key: 'edit', label: 'Modifier', icon: Pencil }]
  if (!admin.isSystemAdmin) {
    items.push({ key: 'delete', label: 'Supprimer', icon: Trash2, danger: true })
  }
  return items
}

function onAction(key: string, admin: Admin) {
  if (key === 'edit') emit('edit', admin)
  else if (key === 'delete') emit('delete', admin)
}

const countLabel = computed(() =>
  props.admins.length > 1 ? 'administrateurs' : 'administrateur',
)

const fullName = (admin: Admin) => `${admin.firstName} ${admin.lastName}`
const initials = (admin: Admin) =>
  `${admin.firstName.charAt(0)}${admin.lastName.charAt(0)}`.toUpperCase()
</script>

<template>
  <BaseCard :padded="false">
    <div class="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-4">
      <p class="text-sm text-text-body">
        <span class="mr-1 font-display text-2xl leading-none text-ink tabular-nums">
          {{ admins.length }}
        </span>
        {{ countLabel }}
      </p>
    </div>

    <DataTable
      :columns="columns"
      :rows="admins"
      :row-key="(admin) => admin.id"
      empty-text="Aucun administrateur pour le moment."
    >
      <template #cell-admin="{ row }">
        <div class="flex items-center gap-3">
          <InitialsAvatar :initials="initials(row)" />
          <div class="min-w-0">
            <p class="flex flex-wrap items-center gap-x-2 text-sm font-semibold text-ink">
              <span class="truncate">{{ fullName(row) }}</span>
              <span v-if="row.id === currentUserId" class="font-normal text-text-muted">(vous)</span>
              <span
                v-if="row.isSystemAdmin"
                class="rounded-full bg-brass/10 px-2 py-0.5 text-[0.6875rem] font-semibold text-brass-dark"
              >
                Admin système
              </span>
            </p>
            <p class="truncate text-xs text-text-muted">{{ row.email }}</p>
          </div>
        </div>
      </template>
       <template #cell-adminType="{ row }">
        {{ row.adminType ? ADMIN_TYPE_LABELS[row.adminType] : '—' }}
      </template>

      <template #cell-account="{ row }">
        {{ ACCOUNT_STATUS_META[row.accountStatus].label }}
      </template>

      <template #cell-createdAt="{ row }">
        <span class="text-xs text-text-secondary">
          {{ formatLongDate(new Date(row.createdAt)) }}
        </span>
      </template>

      <template #cell-action="{ row }">
        <ActionMenu
          :items="rowActions(row)"
          :ariaLabel="`Actions pour ${fullName(row)}`"
          @select="onAction($event, row)"
        />
      </template>
    </DataTable>
  </BaseCard>
</template>