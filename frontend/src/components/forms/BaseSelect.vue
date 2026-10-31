<script setup lang="ts">
import { computed } from 'vue'
import { ChevronDown } from '@lucide/vue'
import FormField from './FormField.vue'

interface Option {
  value: string
  label: string
}

interface Props {
  modelValue: string
  options: Option[]
  id?: string
  label?: string // si absent : select compact sans label (barres de filtres), utiliser ariaLabel
  ariaLabel?: string
  placeholder?: string
  size?: 'sm' | 'md' | 'lg'
  required?: boolean
  optional?: boolean
  hint?: string
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  id: '',
  label: '',
  placeholder: '',
  size: 'sm',
  required: false,
  optional: false,
  hint: '',
  error: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const sizeClasses = {
  sm: 'h-8 pl-3 text-xs',
  md: 'h-10 pl-3.5 text-sm',
  lg: 'h-11 pl-3.5 text-sm',
}

const isPlaceholder = computed(() => props.placeholder !== '' && props.modelValue === '')

const describedBy = computed(() => {
  if (props.error) return `${props.id}-error`
  if (props.hint) return `${props.id}-hint`
  return undefined
})

function onChange(event: Event) {
  emit('update:modelValue', (event.target as HTMLSelectElement).value)
}
</script>

<template>
  <FormField
    :id="id"
    :label="label"
    :required="required"
    :optional="optional"
    :hint="hint"
    :error="error"
  >
    <div class="relative">
      <select
        :id="id || undefined"
        :value="modelValue"
        :required="required"
        :aria-label="label ? undefined : ariaLabel"
        :aria-invalid="error ? true : undefined"
        :aria-describedby="describedBy"
        class="w-full appearance-none rounded-lg border bg-white pr-9 outline-none transition focus:ring-4"
        :class="[
          sizeClasses[size],
          error
            ? 'border-danger focus:border-danger focus:ring-danger/10'
            : 'border-border-strong focus:border-ink focus:ring-ink/10',
          isPlaceholder ? 'text-text-muted' : 'text-ink',
        ]"
        @change="onChange"
      >
        <option v-if="placeholder" value="" disabled hidden>{{ placeholder }}</option>
        <option v-for="option in options" :key="option.value" :value="option.value" class="text-ink">
          {{ option.label }}
        </option>
      </select>
      <ChevronDown
        class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary"
        aria-hidden="true"
      />
    </div>
  </FormField>
</template>