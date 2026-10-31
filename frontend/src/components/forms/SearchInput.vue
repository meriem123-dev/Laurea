<script setup lang="ts">
import { Search } from '@lucide/vue'

withDefaults(
  defineProps<{
    modelValue: string
    ariaLabel: string
    placeholder?: string
  }>(),
  { placeholder: 'Rechercher…' },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <div class="relative">
    <Search
      class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
      :stroke-width="1.75"
      aria-hidden="true"
    />
    <input
      type="search"
      :value="modelValue"
      :placeholder="placeholder"
      :aria-label="ariaLabel"
      class="h-10 w-full rounded-lg border border-border-strong bg-white pl-10 pr-3 text-sm text-ink outline-none transition placeholder:text-text-muted focus:border-ink focus:ring-4 focus:ring-ink/10"
      @input="onInput"
    />
  </div>
</template>