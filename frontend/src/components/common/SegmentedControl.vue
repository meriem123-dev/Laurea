<script setup lang="ts" generic="T extends string">
interface SegmentedOption<V extends string> {
  value: V
  label: string
}

defineProps<{
  options: SegmentedOption<T>[]
  modelValue: T
  ariaLabel?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: T]
}>()
</script>

<template>
  <div
    role="tablist"
    :aria-label="ariaLabel"
    class="grid auto-cols-fr grid-flow-col gap-1 rounded-xl bg-surface-muted p-1"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      role="tab"
      :aria-selected="option.value === modelValue"
      class="rounded-lg px-3 py-2.5 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-700/40"
      :class="
        option.value === modelValue
          ? 'bg-white text-primary-700 shadow-sm'
          : 'text-slate-400 hover:text-slate-600'
      "
      @click="emit('update:modelValue', option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>