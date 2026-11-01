<script setup lang="ts">
import AuthHero from '../components/auth/AuthHero.vue'
import ThemeToggle from '../components/common/ThemeToggle.vue'
</script>

<template>
  <div class="grid min-h-screen bg-surface lg:grid-cols-2">
    <AuthHero />

    <main class="relative flex items-center justify-center px-6 py-12 sm:px-10">
      <div class="absolute right-4 top-4 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>

      <div class="w-full max-w-md">
        <slot />
      </div>
    </main>
  </div>
</template>