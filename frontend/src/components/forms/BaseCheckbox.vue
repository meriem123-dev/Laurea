<script setup lang="ts">
defineProps<{
  id: string
  modelValue: boolean
  label: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

function onChange(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).checked)
}
</script>

<template>
  <label
    :for="id"
    class="inline-flex cursor-pointer items-center gap-2.5 text-xs text-text-body"
  >
    <input
      :id="id"
      type="checkbox"
      :checked="modelValue"
      class="h-4 w-4 cursor-pointer rounded accent-ink"
      @change="onChange"
    />
    {{ label }}
  </label>
</template>