<script setup lang="ts">
import AppLogo from '../common/AppLogo.vue'

defineProps<{
  eyebrow: string
  title: string
}>()
</script>

<template>
  <header>
    <AppLogo variant="onLight" class="mb-8 h-14 lg:hidden" />

    <p
      class="flex items-center gap-3 text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-brass-dark"
    >
      <span class="h-px w-8 bg-brass" aria-hidden="true" />
      {{ eyebrow }}
    </p>

    <h1
      class="mt-4 font-display text-3xl font-normal leading-[1.1] tracking-tight text-ink sm:text-4xl"
    >
      {{ title }}
    </h1>
  </header>
</template>