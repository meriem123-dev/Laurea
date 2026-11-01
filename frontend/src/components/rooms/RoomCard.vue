<script setup lang="ts">
import { DoorOpen, Eye, Pencil, Trash2 } from '@lucide/vue'
import ActionMenu, { type ActionMenuItem } from '../common/ActionMenu.vue'
import BaseBadge from '../common/BaseBadge.vue'
import BaseCard from '../common/BaseCard.vue'
import { roomSubtitle } from '../../utils/room'
import type { Room } from '../../types/room'
import type { BadgeTone } from '../../types/ui'

const props = defineProps<{
  room: Room
  status: { label: string; tone: BadgeTone }
}>()

const emit = defineEmits<{
  view: [room: Room]
  edit: [room: Room]
  delete: [room: Room]
}>()

const menuItems: ActionMenuItem[] = [
  { key: 'view', label: 'Voir la fiche', icon: Eye },
  { key: 'edit', label: 'Modifier', icon: Pencil },
  { key: 'delete', label: 'Supprimer', icon: Trash2, danger: true },
]

function onAction(key: string) {
  if (key === 'view') emit('view', props.room)
  else if (key === 'edit') emit('edit', props.room)
  else if (key === 'delete') emit('delete', props.room)
}
</script>

<template>
  <BaseCard class="h-full transition duration-300 hover:-translate-y-0.5 hover:border-border-strong">
    <div class="flex items-start gap-4">
      <span
        class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-muted text-ink"
        aria-hidden="true"
      >
        <DoorOpen class="h-5 w-5" :stroke-width="1.75" />
      </span>

      <div class="min-w-0 flex-1">
        <h2 class="break-words font-display text-xl leading-snug text-ink">{{ room.name }}</h2>
        <p class="mt-1 text-xs text-text-muted">{{ roomSubtitle(room) }}</p>
        <BaseBadge :tone="status.tone" class="mt-3">{{ status.label }}</BaseBadge>
      </div>

      <div class="-mr-2 -mt-1 shrink-0">
        <ActionMenu :items="menuItems" :ariaLabel="`Actions pour ${room.name}`" @select="onAction" />
      </div>
    </div>
  </BaseCard>
</template>