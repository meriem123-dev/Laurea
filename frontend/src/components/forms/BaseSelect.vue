<script setup lang="ts">
import { ChevronDown } from '@lucide/vue'

interface Option {
  value: string
  label: string
}

defineProps<{
  modelValue: string
  options: Option[]
  ariaLabel: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function onChange(event: Event) {
  emit('update:modelValue', (event.target as HTMLSelectElement).value)
}
</script>

<template>
  <div class="relative">
    <select
      :value="modelValue"
      :aria-label="ariaLabel"
      class="h-8 appearance-none rounded-lg border border-border bg-white pl-3 pr-8 text-xs text-ink outline-none transition focus:border-primary-600 focus:ring-4 focus:ring-primary-600/10"
      @change="onChange"
    >
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
    <ChevronDown
      class="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-secondary"
      aria-hidden="true"
    />
  </div>
</template>