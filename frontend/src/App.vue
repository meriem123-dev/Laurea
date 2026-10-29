<script setup lang="ts"></script>

<script setup lang="ts"></script>

<template>
  <header class="flex items-center gap-6 bg-blue-400 px-6 py-3 text-white">
    <strong>Soutenances</strong>
    <nav>
      <RouterLink to="/" class="hover:underline">Accueil</RouterLink>
    </nav>
  </header>
  <main class="mx-auto my-8 max-w-4xl px-4 text-blue-950">
    <RouterView />
  </main>
</template>

