<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<template>
  <div class="flex flex-wrap items-start justify-between gap-4">
    <div>
      <h1 class="text-2xl font-normal tracking-tight text-ink">{{ title }}</h1>
      <p v-if="subtitle" class="mt-1 text-xs text-text-secondary">{{ subtitle }}</p>
    </div>
    <slot />
  </div>
</template>