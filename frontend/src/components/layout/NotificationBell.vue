<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { Bell, CheckCheck } from '@lucide/vue'
import NotificationItem from '../notifications/NotificationItem.vue'
import { useNotifications } from '../../composables/useNotifications'
import type { AppNotification } from '../../types/notification'

defineProps<{
  viewAllTo?: string // page « toutes les notifications » (absente = lien masqué)
}>()

const PREVIEW_COUNT = 5

const router = useRouter()
const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()

const isOpen = ref(false)
const root = ref<HTMLElement | null>(null)
const trigger = ref<HTMLButtonElement | null>(null)

const preview = computed(() => notifications.value.slice(0, PREVIEW_COUNT))
const badgeLabel = computed(() => (unreadCount.value > 9 ? '9+' : String(unreadCount.value)))

function close(returnFocus = false) {
  isOpen.value = false
  if (returnFocus) trigger.value?.focus()
}

function onPointerDown(event: PointerEvent) {
  if (root.value && !root.value.contains(event.target as Node)) close()
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') close(true)
}

function removeListeners() {
  document.removeEventListener('pointerdown', onPointerDown)
  document.removeEventListener('keydown', onKeydown)
}

watch(isOpen, (open) => {
  if (open) {
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeydown)
  } else {
    removeListeners()
  }
})

onBeforeUnmount(removeListeners)

function openNotification(notification: AppNotification) {
  markAsRead(notification.id)
  close()
  if (notification.to) void router.push(notification.to)
}
</script>

<template>
  <!-- Mobile : le panneau se cale sur la barre du haut ; à partir de sm : sous la cloche -->
  <div ref="root" class="sm:relative">
    <button
      ref="trigger"
      type="button"
      class="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-text-secondary transition hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
      :class="isOpen ? 'text-ink' : ''"
      aria-haspopup="dialog"
      :aria-expanded="isOpen"
      :aria-label="unreadCount > 0 ? `Notifications, ${unreadCount} non lue(s)` : 'Notifications'"
      @click="isOpen = !isOpen"
    >
      <Bell class="h-4 w-4" :stroke-width="1.75" aria-hidden="true" />
      <span
        v-if="unreadCount > 0"
        class="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-strong px-1 text-[0.625rem] font-bold leading-none text-white"
        aria-hidden="true"
      >
        {{ badgeLabel }}
      </span>
    </button>

    <div
      v-if="isOpen"
      role="dialog"
      aria-label="Notifications"
      class="absolute inset-x-4 top-full z-50 mt-2 overflow-hidden rounded-xl border border-border bg-card shadow-xl motion-safe:animate-modal-in sm:inset-x-auto sm:right-0 sm:w-96"
    >
      <div class="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <h2 class="font-display text-lg text-ink">Notifications</h2>
        <button
          v-if="unreadCount > 0"
          type="button"
          class="inline-flex items-center gap-1.5 rounded-sm text-xs font-semibold text-ink underline decoration-border-strong underline-offset-4 transition hover:decoration-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
          @click="markAllAsRead"
        >
          <CheckCheck class="h-3.5 w-3.5" aria-hidden="true" />
          Tout marquer comme lu
        </button>
      </div>

      <ul v-if="preview.length > 0" class="max-h-96 divide-y divide-border overflow-y-auto">
        <li v-for="item in preview" :key="item.id">
          <NotificationItem :notification="item" @open="openNotification" />
        </li>
      </ul>
      <p v-else class="px-4 py-10 text-center text-sm text-text-muted">Aucune notification.</p>

      <RouterLink
        v-if="viewAllTo"
        :to="viewAllTo"
        class="block border-t border-border bg-surface px-4 py-3 text-center text-xs font-semibold text-ink transition hover:underline"
        @click="close()"
      >
        Voir toutes les notifications
      </RouterLink>
    </div>
  </div>
</template>