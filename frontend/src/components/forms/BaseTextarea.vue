<script setup lang="ts">
import { computed } from 'vue'
import FormField from './FormField.vue'

const props = withDefaults(
  defineProps<{
    id: string
    modelValue: string
    label: string
    placeholder?: string
    rows?: number
    required?: boolean
    optional?: boolean
    hint?: string
    error?: string
  }>(),
  { placeholder: '', rows: 4, required: false, optional: false, hint: '', error: '' },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const describedBy = computed(() => {
  if (props.error) return `${props.id}-error`
  if (props.hint) return `${props.id}-hint`
  return undefined
})

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLTextAreaElement).value)
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
    <textarea
      :id="id"
      :value="modelValue"
      :rows="rows"
      :placeholder="placeholder"
      :required="required"
      :aria-invalid="error ? true : undefined"
      :aria-describedby="describedBy"
      class="w-full resize-y rounded-lg border bg-white px-3.5 py-3 text-sm leading-relaxed text-ink outline-none transition placeholder:text-text-muted focus:ring-4"
      :class="
        error
          ? 'border-danger focus:border-danger focus:ring-danger/10'
          : 'border-border-strong focus:border-ink focus:ring-ink/10'
      "
      @input="onInput"
    />
  </FormField>
</template>