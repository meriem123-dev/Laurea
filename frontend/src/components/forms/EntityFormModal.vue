<script setup lang="ts">
import { computed, reactive, useId, watch, type Component } from 'vue'
import BaseAlert from '../common/BaseAlert.vue'
import BaseButton from '../common/BaseButton.vue'
import BaseModal from '../common/BaseModal.vue'
import BaseInput from './BaseInput.vue'
import BaseSelect from './BaseSelect.vue'
import type { FormFieldConfig, FormValues } from '../../types/form'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title: string
    subtitle?: string
    icon?: Component
    fields: FormFieldConfig[]
    initialValues?: FormValues // présent = formulaire prérempli (modification)
    submitLabel?: string
    notice?: string // encadré d'information en bas du formulaire
    footerNote?: string // phrase à gauche des boutons
    loading?: boolean
  }>(),
  { submitLabel: 'Enregistrer', loading: false },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [values: FormValues]
}>()

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const formId = useId()
const values = reactive<FormValues>({})
const errors = reactive<FormValues>({})

const hasRequired = computed(() => props.fields.some((field) => field.required))

// Formulaire réinitialisé à l'ouverture ET à la fermeture (un mot de passe ne reste pas en mémoire)
function reset() {
  for (const key of Object.keys(values)) delete values[key]
  for (const key of Object.keys(errors)) delete errors[key]
  for (const field of props.fields) {
    values[field.key] = props.initialValues?.[field.key] ?? ''
    errors[field.key] = ''
  }
}
watch(() => props.modelValue, reset, { immediate: true })

function inputType(field: FormFieldConfig): 'text' | 'email' | 'password' {
  return field.type === 'email' || field.type === 'password' ? field.type : 'text'
}

function onInput(key: string, value: string) {
  values[key] = value
  errors[key] = '' // l'erreur disparaît dès qu'on modifie le champ
}

function normalized(field: FormFieldConfig, raw: string): string {
  if (field.normalize) return field.normalize(raw)
  if (field.type === 'password') return raw
  if (field.type === 'email') return raw.trim().toLowerCase()
  return raw.trim()
}

function validate(): FormValues | null {
  const result: FormValues = {}
  let firstInvalid: string | null = null

  for (const field of props.fields) {
    const value = normalized(field, values[field.key] ?? '')
    result[field.key] = value

    let message = ''
    if (!value) {
      if (field.required) message = field.requiredMessage ?? 'Ce champ est obligatoire.'
    } else if (field.type === 'email' && !EMAIL_PATTERN.test(value)) {
      message = 'Saisissez une adresse e-mail valide.'
    } else if (field.minLength && value.length < field.minLength) {
      message = `Au moins ${field.minLength} caractères.`
    } else if (field.validate) {
      message = field.validate(value)
    }

    errors[field.key] = message
    if (message && firstInvalid === null) firstInvalid = field.key
  }

  if (firstInvalid !== null) {
    document.getElementById(`${formId}-${firstInvalid}`)?.focus()
    return null
  }
  return result
}

function handleSubmit() {
  const result = validate()
  if (result) emit('submit', result)
}

function close() {
  emit('update:modelValue', false)
}
</script>

<template>
  <BaseModal
    :modelValue="modelValue"
    :title="title"
    :subtitle="subtitle"
    :icon="icon"
    @update:modelValue="emit('update:modelValue', $event)"
  >
    <form
      :id="formId"
      class="grid grid-cols-1 gap-5 sm:grid-cols-2"
      novalidate
      @submit.prevent="handleSubmit"
    >
      <p v-if="hasRequired" class="text-xs text-text-secondary sm:col-span-2">
        <span class="text-danger-dark" aria-hidden="true">*</span> Champs obligatoires
      </p>

      <div v-for="field in fields" :key="field.key" :class="field.half ? '' : 'sm:col-span-2'">
        <BaseSelect
          v-if="field.type === 'select'"
          :id="`${formId}-${field.key}`"
          :modelValue="values[field.key] ?? ''"
          :options="field.options ?? []"
          :label="field.label"
          :placeholder="field.placeholder"
          size="lg"
          :required="field.required"
          :optional="field.optional"
          :hint="field.hint"
          :error="errors[field.key]"
          @update:modelValue="onInput(field.key, $event)"
        />
        <BaseInput
          v-else
          :id="`${formId}-${field.key}`"
          :modelValue="values[field.key] ?? ''"
          variant="boxed"
          :type="inputType(field)"
          :label="field.label"
          :placeholder="field.placeholder"
          :autocomplete="field.autocomplete"
          :required="field.required"
          :optional="field.optional"
          :hint="field.hint"
          :error="errors[field.key]"
          @update:modelValue="onInput(field.key, $event)"
        />
      </div>

      <BaseAlert v-if="notice" class="sm:col-span-2">{{ notice }}</BaseAlert>
    </form>

    <template #footer>
      <p
        v-if="footerNote"
        class="text-center text-xs text-text-muted sm:mr-auto sm:self-center sm:text-left"
      >
        {{ footerNote }}
      </p>
      <BaseButton variant="secondary" size="md" class="w-full sm:w-auto" @click="close">
        Annuler
      </BaseButton>
      <BaseButton
        type="submit"
        :form="formId"
        size="md"
        class="w-full sm:w-auto"
        :loading="loading"
      >
        {{ submitLabel }}
      </BaseButton>
    </template>
  </BaseModal>
</template>