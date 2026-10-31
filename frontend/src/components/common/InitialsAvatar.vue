<script setup lang="ts">
defineProps<{
  initials: string
}>()
</script>

<template>
  <span
    class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-muted font-display text-sm font-medium text-ink"
    aria-hidden="true"
  >
    {{ initials }}
  </span>
</template>