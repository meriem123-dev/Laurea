<script setup lang="ts">
import { computed, reactive, useId, watch, type Component } from 'vue'
import BaseAlert from '../common/BaseAlert.vue'
import BaseButton from '../common/BaseButton.vue'
import BaseModal from '../common/BaseModal.vue'
import BaseInput from './BaseInput.vue'
import BaseSelect from './BaseSelect.vue'
import BaseTextarea from './BaseTextarea.vue'
import type { FormFieldConfig, FormValues } from '../../types/form'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title: string
    subtitle?: string
    icon?: Component
    fields: FormFieldConfig[]
    initialValues?: FormValues // valeurs de départ (modification, ou valeurs par défaut)
    submitLabel?: string
    notice?: string // encadré d'information en bas du formulaire
    footerNote?: string // phrase à gauche des boutons
    size?: 'md' | 'lg'
    loading?: boolean
  }>(),
  { submitLabel: 'Enregistrer', size: 'md', loading: false },
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

// Champs affichés (les champs conditionnels dépendent des valeurs saisies)
const visibleFields = computed(() =>
  props.fields.filter((field) => !field.visibleWhen || field.visibleWhen(values)),
)

// Chaque champ, avec le titre de section à afficher avant lui (s'il ouvre une nouvelle section)
const rows = computed(() =>
  visibleFields.value.map((field, index) => {
    const previous = visibleFields.value[index - 1]
    const heading = field.section && field.section !== previous?.section ? field.section : ''
    return { field, heading }
  }),
)

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
    // Champ masqué : ignoré à la validation et envoyé vide
    if (field.visibleWhen && !field.visibleWhen(values)) {
      result[field.key] = ''
      errors[field.key] = ''
      continue
    }

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
      message = field.validate(value, values)
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
    :size="size"
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

      <template v-for="row in rows" :key="row.field.key">
        <p
          v-if="row.heading"
          class="border-b border-border pb-2 pt-1 text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-brass-dark sm:col-span-2"
        >
          {{ row.heading }}
        </p>

        <div :class="row.field.half ? '' : 'sm:col-span-2'">
          <BaseSelect
            v-if="row.field.type === 'select'"
            :id="`${formId}-${row.field.key}`"
            :modelValue="values[row.field.key] ?? ''"
            :options="row.field.options ?? []"
            :label="row.field.label"
            :placeholder="row.field.placeholder"
            size="lg"
            :required="row.field.required"
            :optional="row.field.optional"
            :hint="row.field.hint"
            :error="errors[row.field.key]"
            @update:modelValue="onInput(row.field.key, $event)"
          />
          <BaseTextarea
            v-else-if="row.field.type === 'textarea'"
            :id="`${formId}-${row.field.key}`"
            :modelValue="values[row.field.key] ?? ''"
            :label="row.field.label"
            :placeholder="row.field.placeholder"
            :rows="row.field.rows"
            :required="row.field.required"
            :optional="row.field.optional"
            :hint="row.field.hint"
            :error="errors[row.field.key]"
            @update:modelValue="onInput(row.field.key, $event)"
          />
          <BaseInput
            v-else
            :id="`${formId}-${row.field.key}`"
            :modelValue="values[row.field.key] ?? ''"
            variant="boxed"
            :type="inputType(row.field)"
            :label="row.field.label"
            :placeholder="row.field.placeholder"
            :autocomplete="row.field.autocomplete"
            :required="row.field.required"
            :optional="row.field.optional"
            :hint="row.field.hint"
            :error="errors[row.field.key]"
            @update:modelValue="onInput(row.field.key, $event)"
          />
        </div>
      </template>

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