<script setup lang="ts">
import { TriangleAlert } from '@lucide/vue'
import BaseButton from './BaseButton.vue'
import BaseModal from './BaseModal.vue'

withDefaults(
  defineProps<{
    modelValue: boolean
    title: string
    message: string
    confirmLabel?: string
    cancelLabel?: string
    loading?: boolean
  }>(),
  { confirmLabel: 'Confirmer', cancelLabel: 'Annuler', loading: false },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
}>()
</script>

<template>
  <BaseModal
    :modelValue="modelValue"
    :title="title"
    :icon="TriangleAlert"
    @update:modelValue="emit('update:modelValue', $event)"
  >
    <p class="text-sm leading-relaxed text-text-body">{{ message }}</p>

    <template #footer>
      <BaseButton
        variant="secondary"
        size="md"
        class="w-full sm:w-auto"
        @click="emit('update:modelValue', false)"
      >
        {{ cancelLabel }}
      </BaseButton>
      <BaseButton
        variant="danger"
        size="md"
        class="w-full sm:w-auto"
        :loading="loading"
        @click="emit('confirm')"
      >
        {{ confirmLabel }}
      </BaseButton>
    </template>
  </BaseModal>
</template>