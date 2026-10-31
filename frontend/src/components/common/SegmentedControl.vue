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
  <div role="tablist" :aria-label="ariaLabel" class="flex gap-5 border-b border-border sm:gap-7">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      role="tab"
      :aria-selected="option.value === modelValue"
      class="relative -mb-px rounded-sm pb-3 text-[0.8125rem] font-semibold transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:bg-ink after:transition-transform after:duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
      :class="
        option.value === modelValue
          ? 'text-ink after:scale-x-100'
          : 'text-text-muted after:scale-x-0 hover:text-ink'
      "
      @click="emit('update:modelValue', option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>