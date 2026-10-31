<script setup lang="ts">
import { ChevronDown } from '@lucide/vue'

interface Option {
  value: string
  label: string
}

withDefaults(
  defineProps<{
    modelValue: string
    options: Option[]
    ariaLabel: string
    size?: 'sm' | 'md'
  }>(),
  { size: 'sm' },
)

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
      class="w-full appearance-none rounded-lg border border-border-strong bg-white pr-9 text-ink outline-none transition focus:border-ink focus:ring-4 focus:ring-ink/10"
      :class="size === 'md' ? 'h-10 pl-3.5 text-sm' : 'h-8 pl-3 text-xs'"
      @change="onChange"
    >
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
    <ChevronDown
      class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary"
      aria-hidden="true"
    />
  </div>
</template>