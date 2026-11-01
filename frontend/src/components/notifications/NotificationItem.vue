<script setup lang="ts">
import { computed } from 'vue'
import { Check, Trash2 } from '@lucide/vue'
import IconTile from '../common/IconTile.vue'
import type { AppNotification } from '../../types/notification'
import { NOTIFICATION_META, formatRelative } from '../../utils/notification'

const props = withDefaults(
  defineProps<{
    notification: AppNotification
    showActions?: boolean // boutons « marquer comme lue » et « supprimer » (page complète)
  }>(),
  { showActions: false },
)

const emit = defineEmits<{
  open: [notification: AppNotification]
  read: [notification: AppNotification]
  remove: [notification: AppNotification]
}>()

const meta = computed(() => NOTIFICATION_META[props.notification.type])

const iconButton =
  'flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/30'
</script>

<template>
  <div class="flex items-start" :class="notification.read ? 'bg-card' : 'bg-surface'">
    <button
      type="button"
      class="flex min-w-0 flex-1 items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-surface-muted/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink/30"
      @click="emit('open', notification)"
    >
      <IconTile :icon="meta.icon" :tone="meta.tone" size="sm" />

      <span class="min-w-0 flex-1">
        <span class="flex items-center gap-2">
          <span
            class="truncate text-sm text-ink"
            :class="notification.read ? 'font-medium' : 'font-bold'"
          >
            {{ notification.title }}
          </span>
          <span v-if="!notification.read" class="h-2 w-2 shrink-0 rounded-full bg-brass">
            <span class="sr-only">Non lue</span>
          </span>
        </span>
        <span class="mt-0.5 block text-xs leading-relaxed text-text-secondary">
          {{ notification.message }}
        </span>
        <span class="mt-1.5 block text-[0.6875rem] text-text-muted">
          {{ meta.label }} · {{ formatRelative(notification.createdAt) }}
        </span>
      </span>
    </button>

    <div v-if="showActions" class="flex shrink-0 items-center gap-1 pr-4 pt-4">
      <button
        v-if="!notification.read"
        type="button"
        :class="[iconButton, 'hover:bg-surface-muted hover:text-ink']"
        :aria-label="`Marquer « ${notification.title} » comme lue`"
        @click="emit('read', notification)"
      >
        <Check class="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        :class="[iconButton, 'hover:bg-danger-soft hover:text-danger-dark']"
        :aria-label="`Supprimer « ${notification.title} »`"
        @click="emit('remove', notification)"
      >
        <Trash2 class="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>