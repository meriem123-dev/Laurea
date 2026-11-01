<script setup lang="ts">
withDefaults(
  defineProps<{
    columns?: 3 | 4
  }>(),
  { columns: 4 },
)
</script>

<template>
  <section
    class="grid gap-px overflow-hidden rounded-xl border border-border bg-border"
    :class="columns === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2 lg:grid-cols-4'"
  >
    <slot />
  </section>
</template>