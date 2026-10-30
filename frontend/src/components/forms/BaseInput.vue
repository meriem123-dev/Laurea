<script setup lang="ts">
import { computed, ref } from 'vue'
import { Eye, EyeOff } from 'lucide-vue-next'

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
    <label :for="id" class="mb-2 block text-xs font-semibold text-slate-800">
      {{ label }}
    </label>

    <div class="relative">
      <input
        :id="id"
        :value="modelValue"
        :type="inputType"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :required="required"
        class="h-12 w-full rounded-xl border bg-white px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-primary-700 focus:ring-4 focus:ring-primary-700/10"
        :class="[error ? 'border-red-400' : 'border-slate-200', isPassword ? 'pr-12' : '']"
        @input="onInput"
      />

      <button
        v-if="isPassword"
        type="button"
        class="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-400 transition hover:text-slate-600"
        :aria-label="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
        @click="showPassword = !showPassword"
      >
        <component :is="showPassword ? EyeOff : Eye" class="h-4 w-4" aria-hidden="true" />
      </button>
    </div>

    <p v-if="error" class="mt-1.5 text-xs text-red-600">{{ error }}</p>
  </div>
</template>