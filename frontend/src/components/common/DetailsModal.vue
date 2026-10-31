<script setup lang="ts">
import type { Component } from 'vue'
import BaseBadge from './BaseBadge.vue'
import BaseButton from './BaseButton.vue'
import BaseModal from './BaseModal.vue'
import type { BadgeTone } from '../../types/ui'

defineProps<{
  modelValue: boolean
  title: string
  subtitle?: string
  icon?: Component
  fields: { label: string; value: string }[]
  badge?: { label: string; text: string; tone: BadgeTone }
  editable?: boolean // affiche le bouton « Modifier »
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  edit: []
}>()
</script>

<template>
  <BaseModal
    :modelValue="modelValue"
    :title="title"
    :subtitle="subtitle"
    :icon="icon"
    @update:modelValue="emit('update:modelValue', $event)"
  >
    <dl class="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
      <div v-for="field in fields" :key="field.label" class="min-w-0">
        <dt class="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-text-secondary">
          {{ field.label }}
        </dt>
        <dd class="mt-1 break-words text-sm text-ink">{{ field.value || '—' }}</dd>
      </div>

      <div v-if="badge">
        <dt class="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-text-secondary">
          {{ badge.label }}
        </dt>
        <dd class="mt-1.5">
          <BaseBadge :tone="badge.tone">{{ badge.text }}</BaseBadge>
        </dd>
      </div>
    </dl>

    <template #footer>
      <BaseButton
        variant="secondary"
        size="md"
        class="w-full sm:w-auto"
        @click="emit('update:modelValue', false)"
      >
        Fermer
      </BaseButton>
      <BaseButton v-if="editable" size="md" class="w-full sm:w-auto" @click="emit('edit')">
        Modifier
      </BaseButton>
    </template>
  </BaseModal>
</template>