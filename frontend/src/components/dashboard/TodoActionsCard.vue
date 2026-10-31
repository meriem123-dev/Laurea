<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { ArrowUpRight } from '@lucide/vue'
import BaseCard from '../common/BaseCard.vue'
import type { TodoAction } from '../../types/dashboard'

defineProps<{
  actions: TodoAction[]
}>()
</script>

<template>
  <BaseCard title="À traiter aujourd’hui" subtitle="Actions qui nécessitent votre attention">
    <p v-if="actions.length === 0" class="py-4 text-center text-sm text-text-muted">
      Rien à traiter pour le moment.
    </p>

    <ul v-else class="-mx-3 grid grid-cols-1 gap-1 border-t border-border pt-3 md:grid-cols-3">
      <li v-for="action in actions" :key="action.id">
        <RouterLink
          :to="action.to"
          class="group flex items-center gap-4 rounded-lg px-3 py-3 transition hover:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
        >
          <span
            class="min-w-12 shrink-0 font-display text-5xl leading-none text-brass tabular-nums"
          >
            {{ action.count }}
          </span>

          <span class="min-w-0 flex-1">
            <span class="block truncate text-sm font-semibold text-ink">{{ action.label }}</span>
            <span class="mt-0.5 block truncate text-xs text-text-muted">
              {{ action.description }}
            </span>
          </span>

          <ArrowUpRight
            class="h-4 w-4 shrink-0 text-text-muted transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink"
            aria-hidden="true"
          />
        </RouterLink>
      </li>
    </ul>
  </BaseCard>
</template>