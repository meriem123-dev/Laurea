<script setup lang="ts">
defineProps<{
  id: string
  modelValue: boolean
  label: string
  description?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<template>
  <div class="flex items-center justify-between gap-4 py-4">
    <label :for="id" class="min-w-0 cursor-pointer">
      <span class="block text-sm font-semibold text-ink">{{ label }}</span>
      <span v-if="description" class="mt-0.5 block text-xs text-text-muted">{{ description }}</span>
    </label>

    <button
      :id="id"
      type="button"
      role="switch"
      :aria-checked="modelValue"
      class="relative h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-ink/20"
      :class="modelValue ? 'bg-ink' : 'bg-border-strong'"
      @click="emit('update:modelValue', !modelValue)"
    >
      <span
        class="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-card shadow transition-transform motion-reduce:transition-none"
        :class="modelValue ? 'translate-x-5' : 'translate-x-0'"
      />
    </button>
  </div>
</template>