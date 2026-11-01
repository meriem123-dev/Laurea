<script setup lang="ts">
defineProps<{
  message: string
}>()
</script>

<template>
  <p
    class="rounded-xl border border-dashed border-border-strong bg-card/60 py-16 text-center text-sm text-text-muted"
  >
    {{ message }}
  </p>
</template>