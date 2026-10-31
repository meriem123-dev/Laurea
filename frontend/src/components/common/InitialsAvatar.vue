<script setup lang="ts">
withDefaults(
  defineProps<{
    initials: string
    size?: 'sm' | 'md' | 'lg'
  }>(),
  { size: 'md' },
)

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-xl',
}
</script>

<template>
  <span
    class="flex shrink-0 items-center justify-center rounded-full bg-surface-muted font-display font-medium text-ink"
    :class="sizeClasses[size]"
    aria-hidden="true"
  >
    {{ initials }}
  </span>
</template>