<script setup lang="ts">
import type { Component } from 'vue'
import { RouterLink } from 'vue-router'
import { Award, ChevronRight, Clock, Users } from 'lucide-vue-next'
import BaseCard from '../common/BaseCard.vue'
import IconTile from '../common/IconTile.vue'
import type { TodoAction, TodoActionId } from '../../types/dashboard'
import type { IconTone } from '../../types/ui'

defineProps<{
  actions: TodoAction[]
}>()

const VISUALS: Record<TodoActionId, { icon: Component; tone: IconTone }> = {
  pendingProjects: { icon: Clock, tone: 'orange' },
  incompleteJuries: { icon: Users, tone: 'violet' },
  resultsToPublish: { icon: Award, tone: 'blue' },
}
</script>

<template>
  <BaseCard title="À traiter aujourd’hui" subtitle="Actions qui nécessitent votre attention">
    <p v-if="actions.length === 0" class="py-4 text-center text-sm text-text-muted">
      Rien à traiter pour le moment.
    </p>

    <div v-else class="grid gap-4 md:grid-cols-3">
      <RouterLink
        v-for="action in actions"
        :key="action.id"
        :to="action.to"
        class="group flex items-center gap-3 rounded-xl border border-border bg-white p-3 transition hover:border-primary-200 hover:shadow-sm focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-600/10"
      >
        <IconTile :icon="VISUALS[action.id].icon" :tone="VISUALS[action.id].tone" size="sm" />

        <div class="min-w-0 flex-1">
          <p class="truncate text-xs font-semibold text-ink">
            {{ action.count }} {{ action.label }}
          </p>
          <p class="mt-0.5 truncate text-[11px] text-text-muted">{{ action.description }}</p>
        </div>

        <ChevronRight
          class="h-4 w-4 shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </RouterLink>
    </div>
  </BaseCard>
</template>