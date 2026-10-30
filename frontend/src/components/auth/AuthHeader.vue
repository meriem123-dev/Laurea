<script setup lang="ts">
import AppLogo from '../common/AppLogo.vue'

defineProps<{
  eyebrow: string
  title: string
}>()
</script>

<template>
  <header class="flex flex-col items-center text-center">
    <AppLogo variant="icon" />
    <p class="mt-3 text-xs font-bold uppercase tracking-[0.2em] text-primary-600">
      {{ eyebrow }}
    </p>
    <h1 class="mt-6 text-2xl font-semibold tracking-tight text-slate-800">
      {{ title }}
    </h1>
  </header>
</template>