<script setup lang="ts">
import { computed } from 'vue'
import { CircleCheck, Clock } from '@lucide/vue'
import InitialsAvatar from '../common/InitialsAvatar.vue'
import SegmentedBar from '../common/SegmentedBar.vue'

const props = defineProps<{
  name: string
  initials: string
  roleLabel: string
  filled: number
  total: number
  isYou?: boolean
}>()

const isComplete = computed(() => props.filled >= props.total)
const segments = computed(() => [
  { value: props.filled, colorClass: isComplete.value ? 'bg-success' : 'bg-warning' },
  { value: props.total - props.filled, colorClass: 'bg-surface-muted' },
])
</script>

<template>
  <article class="rounded-xl border border-border bg-card p-4">
    <div class="flex items-center gap-3">
      <InitialsAvatar :initials="initials" size="sm" />
      <div class="min-w-0">
        <p class="truncate text-sm font-semibold text-ink">
          {{ name }}
          <span v-if="isYou" class="font-normal text-text-muted">· vous</span>
        </p>
        <p class="truncate text-xs text-text-muted">{{ roleLabel }}</p>
      </div>
    </div>

    <div class="mt-4 flex items-center justify-between gap-2 text-xs">
      <span
        class="inline-flex items-center gap-1.5 font-semibold"
        :class="isComplete ? 'text-success-dark' : 'text-warning-dark'"
      >
        <component :is="isComplete ? CircleCheck : Clock" class="h-3.5 w-3.5" aria-hidden="true" />
        {{ isComplete ? 'Évaluation complète' : 'Évaluation en cours' }}
      </span>
      <span class="tabular-nums text-text-muted">{{ filled }} / {{ total }} critères</span>
    </div>

    <SegmentedBar
      :segments="segments"
      :aria-label="`${filled} critères notés sur ${total}`"
      class="mt-2"
    />
  </article>
</template>