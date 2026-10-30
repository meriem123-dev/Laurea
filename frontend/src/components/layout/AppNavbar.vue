<script setup lang="ts">
import { Bell, ChevronRight, Menu } from '@lucide/vue'

withDefaults(
  defineProps<{
    title: string
    userLabel: string
    userInitial: string
    hasUnread?: boolean
  }>(),
  { hasUnread: false },
)

const emit = defineEmits<{
  'toggle-sidebar': []
}>()
</script>

<template>
  <header
    class="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-white px-4 sm:px-6 lg:px-8"
  >
    <div class="flex items-center gap-3">
      <button
        type="button"
        class="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition hover:bg-surface lg:hidden"
        aria-label="Ouvrir le menu"
        @click="emit('toggle-sidebar')"
      >
        <Menu class="h-5 w-5" aria-hidden="true" />
      </button>

      <nav aria-label="Fil d’Ariane" class="flex items-center gap-2 text-xs">
        <span class="text-text-muted">Laurea</span>
        <ChevronRight class="h-3 w-3 text-text-muted" aria-hidden="true" />
        <span class="font-semibold text-ink">{{ title }}</span>
      </nav>
    </div>

    <div class="flex items-center gap-4">
      <button
        type="button"
        class="relative flex h-9 w-9 items-center justify-center rounded-lg bg-surface text-text-secondary transition hover:bg-surface-muted"
        aria-label="Notifications"
      >
        <Bell class="h-4 w-4" aria-hidden="true" />
        <span
          v-if="hasUnread"
          class="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-danger"
          aria-hidden="true"
        />
      </button>

      <div class="flex items-center gap-3">
        <span
          class="flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-primary-500 to-primary-700 text-sm font-semibold text-white"
          aria-hidden="true"
        >
          {{ userInitial }}
        </span>
        <span class="hidden text-xs font-semibold text-ink sm:block">{{ userLabel }}</span>
      </div>
    </div>
  </header>
</template>