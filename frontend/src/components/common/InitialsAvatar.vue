<script setup lang="ts">
withDefaults(
  defineProps<{
    initials: string
    size?: 'md' | 'lg'
  }>(),
  { size: 'md' },
)
</script>

<template>
  <span
    class="flex shrink-0 items-center justify-center rounded-full bg-surface-muted font-display font-medium text-ink"
    :class="size === 'lg' ? 'h-16 w-16 text-xl' : 'h-10 w-10 text-sm'"
    aria-hidden="true"
  >
    {{ initials }}
  </span>
</template>