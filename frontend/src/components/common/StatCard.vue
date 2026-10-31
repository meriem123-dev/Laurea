<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  label: string
  value: string | number
  hint?: string
  icon: Component
}>()
</script>

<template>
  <div class="bg-white p-4 sm:p-6">
    <div class="flex items-center justify-between gap-2">
      <p class="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-text-secondary">
        {{ label }}
      </p>
      <component
        :is="icon"
        class="h-4 w-4 shrink-0 text-text-muted"
        :stroke-width="1.75"
        aria-hidden="true"
      />
    </div>

    <p
      class="mt-4 font-display text-5xl font-normal leading-none tracking-tight text-ink tabular-nums"
    >
      {{ value }}
    </p>

    <p v-if="hint" class="mt-3 text-xs font-medium text-success-dark">{{ hint }}</p>
  </div>
</template>