<script setup lang="ts">
interface Props {
  title?: string
  subtitle?: string
  padded?: boolean
}

withDefaults(defineProps<Props>(), {
  title: '',
  subtitle: '',
  padded: true,
})
</script>

<template>
  <section class="rounded-2xl border border-border bg-white shadow-sm" :class="padded ? 'p-6' : ''">
    <header v-if="title || $slots.action" class="mb-5 flex items-start justify-between gap-4">
      <div>
        <h2 class="text-base font-medium text-ink">{{ title }}</h2>
        <p v-if="subtitle" class="mt-1 text-xs text-text-muted">{{ subtitle }}</p>
      </div>
      <slot name="action" />
    </header>

    <slot />
  </section>
</template>