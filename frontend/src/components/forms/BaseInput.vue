<script setup lang="ts">
import { computed, ref } from 'vue'
import { Eye, EyeOff } from '@lucide/vue'
import FormField from './FormField.vue'

interface Props {
  id: string
  modelValue: string
  label: string
  type?: 'text' | 'email' | 'password'
  variant?: 'underline' | 'boxed'
  placeholder?: string
  autocomplete?: string
  required?: boolean
  optional?: boolean
  hint?: string
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  variant: 'underline',
  placeholder: '',
  autocomplete: 'off',
  required: false,
  optional: false,
  hint: '',
  error: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isPassword = computed(() => props.type === 'password')
const showPassword = ref(false)
const inputType = computed(() => (isPassword.value && showPassword.value ? 'text' : props.type))

const describedBy = computed(() => {
  if (props.error) return `${props.id}-error`
  if (props.hint) return `${props.id}-hint`
  return undefined
})

const inputClasses = computed(() => {
  if (props.variant === 'boxed') {
    return [
      'h-11 rounded-lg border bg-white px-3.5 text-sm focus:ring-4',
      props.error
        ? 'border-danger focus:border-danger focus:ring-danger/10'
        : 'border-border-strong focus:border-ink focus:ring-ink/10',
      isPassword.value ? 'pr-11' : '',
    ]
  }
  return [
    'h-11 border-b bg-transparent px-0 text-[0.9375rem]',
    props.error
      ? 'border-danger'
      : 'border-border-strong focus:border-ink focus:shadow-[0_1px_0_0_var(--color-ink)]',
    isPassword.value ? 'pr-10' : '',
  ]
})

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <FormField
    :id="id"
    :label="label"
    :variant="variant"
    :required="required"
    :optional="optional"
    :hint="hint"
    :error="error"
  >
    <div class="relative" :class="variant === 'underline' ? 'mt-1' : ''">
      <input
        :id="id"
        :value="modelValue"
        :type="inputType"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :required="required"
        :aria-invalid="error ? true : undefined"
        :aria-describedby="describedBy"
        class="w-full text-ink outline-none transition placeholder:text-text-muted"
        :class="inputClasses"
        @input="onInput"
      />

      <button
        v-if="isPassword"
        type="button"
        class="absolute inset-y-0 right-0 flex items-center text-text-muted transition hover:text-ink"
        :class="variant === 'boxed' ? 'w-11 justify-center' : 'w-10 justify-end'"
        :aria-label="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
        @click="showPassword = !showPassword"
      >
        <component :is="showPassword ? EyeOff : Eye" class="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  </FormField>
</template>