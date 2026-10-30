<script setup lang="ts">
import type { BadgeTone } from '../../types/ui'

withDefaults(
  defineProps<{
    tone?: BadgeTone
    dot?: boolean
  }>(),
  {
    tone: 'neutral',
    dot: true,
  },
)

const toneClasses: Record<BadgeTone, string> = {
  success: 'bg-success-soft text-success-dark',
  warning: 'bg-warning-soft text-warning-dark',
  danger: 'bg-danger-soft text-danger-dark',
  info: 'bg-primary-50 text-primary-700',
  violet: 'bg-violet-soft text-violet-dark',
  neutral: 'bg-surface-muted text-text-body',
}
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold"
    :class="toneClasses[tone]"
  >
    <span v-if="dot" class="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
    <slot />
  </span>
</template>