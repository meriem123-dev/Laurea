<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  eyebrow?: string
}>()
</script>

<template>
  <div class="flex flex-wrap items-end justify-between gap-5">
    <div class="min-w-0">
      <p
        v-if="eyebrow"
        class="mb-2 text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-brass-dark"
      >
        {{ eyebrow }}
      </p>
      <h1 class="font-display text-3xl font-normal tracking-tight text-ink sm:text-4xl">
        {{ title }}
      </h1>
      <p v-if="subtitle" class="mt-2 max-w-xl text-sm text-text-secondary">{{ subtitle }}</p>
    </div>
    <slot />
  </div>
</template>