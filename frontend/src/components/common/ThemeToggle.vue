<script setup lang="ts">
import { Moon, Sun } from '@lucide/vue'
import { useTheme } from '../../composables/useTheme'

const { isDark, toggleTheme } = useTheme()
</script>

<template>
  <button
    type="button"
    class="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-text-secondary transition hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
    :aria-label="isDark ? 'Activer le mode clair' : 'Activer le mode sombre'"
    :aria-pressed="isDark"
    @click="toggleTheme"
  >
    <Sun v-if="isDark" class="h-4 w-4" :stroke-width="1.75" aria-hidden="true" />
    <Moon v-else class="h-4 w-4" :stroke-width="1.75" aria-hidden="true" />
  </button>
</template>