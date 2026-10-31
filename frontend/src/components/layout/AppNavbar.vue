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
    class="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-border bg-surface/85 px-4 backdrop-blur sm:px-6 lg:px-10"
  >
    <div class="flex min-w-0 items-center gap-3">
      <button
        type="button"
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-text-secondary transition hover:bg-surface-muted hover:text-ink lg:hidden"
        aria-label="Ouvrir le menu"
        @click="emit('toggle-sidebar')"
      >
        <Menu class="h-5 w-5" aria-hidden="true" />
      </button>

      <nav aria-label="Fil d’Ariane" class="flex min-w-0 items-center gap-2 text-xs">
        <span class="text-text-muted">Laurea</span>
        <ChevronRight class="h-3 w-3 shrink-0 text-text-muted" aria-hidden="true" />
        <span class="truncate font-semibold text-ink">{{ title }}</span>
      </nav>
    </div>

    <div class="flex shrink-0 items-center gap-3">
      <button
        type="button"
        class="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-text-secondary transition hover:text-ink"
        aria-label="Notifications"
      >
        <Bell class="h-4 w-4" :stroke-width="1.75" aria-hidden="true" />
        <span
          v-if="hasUnread"
          class="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-danger"
          aria-hidden="true"
        />
      </button>

      <div class="flex items-center gap-2.5">
        <span
          class="flex h-10 w-10 items-center justify-center rounded-full bg-ink font-display text-lg text-white"
          aria-hidden="true"
        >
          {{ userInitial }}
        </span>
        <span class="hidden text-xs font-semibold text-ink sm:block">{{ userLabel }}</span>
      </div>
    </div>
  </header>
</template>