<script setup lang="ts">
import { computed, ref } from 'vue'
import { Eye, EyeOff } from '@lucide/vue'

interface Props {
  id: string
  modelValue: string
  label: string
  type?: 'text' | 'email' | 'password'
  placeholder?: string
  autocomplete?: string
  required?: boolean
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  autocomplete: 'off',
  required: false,
  error: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isPassword = computed(() => props.type === 'password')
const showPassword = ref(false)
const inputType = computed(() => (isPassword.value && showPassword.value ? 'text' : props.type))

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <div>
    <label
      :for="id"
      class="block text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-text-secondary"
    >
      {{ label }}
    </label>

    <div class="relative mt-1">
      <input
        :id="id"
        :value="modelValue"
        :type="inputType"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :required="required"
        class="h-11 w-full border-b bg-transparent px-0 text-[0.9375rem] text-ink outline-none transition placeholder:text-text-muted"
        :class="[
          error
            ? 'border-danger'
            : 'border-border-strong focus:border-ink focus:shadow-[0_1px_0_0_var(--color-ink)]',
          isPassword ? 'pr-10' : '',
        ]"
        @input="onInput"
      />

      <button
        v-if="isPassword"
        type="button"
        class="absolute inset-y-0 right-0 flex w-10 items-center justify-end text-text-muted transition hover:text-ink"
        :aria-label="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
        @click="showPassword = !showPassword"
      >
        <component :is="showPassword ? EyeOff : Eye" class="h-4 w-4" aria-hidden="true" />
      </button>
    </div>

    <p v-if="error" class="mt-1.5 text-xs text-danger-dark">{{ error }}</p>
  </div>
</template>