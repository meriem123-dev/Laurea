<script setup lang="ts">
import AuthHero from '../components/auth/AuthHero.vue'
</script>

<template>
  <div class="grid min-h-screen bg-white lg:grid-cols-2">
    <AuthHero />

    <main class="flex items-center justify-center px-6 py-12 sm:px-10">
      <div class="w-full max-w-sm">
        <slot />
      </div>
    </main>
  </div>
</template>