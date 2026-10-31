<script setup lang="ts">
withDefaults(
  defineProps<{
    id: string
    label?: string
    variant?: 'underline' | 'boxed'
    required?: boolean
    optional?: boolean
    hint?: string
    error?: string
  }>(),
  {
    label: '',
    variant: 'boxed',
    required: false,
    optional: false,
    hint: '',
    error: '',
  },
)
</script>

<template>
  <div>
    <label
      v-if="label"
      :for="id"
      :class="
        variant === 'underline'
          ? 'block text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-text-secondary'
          : 'mb-1.5 block text-[0.8125rem] font-semibold text-ink'
      "
    >
      {{ label }}
      <span v-if="required && variant === 'boxed'" class="text-danger-dark" aria-hidden="true">
        *
      </span>
      <span v-if="optional" class="font-normal text-text-muted">(facultatif)</span>
    </label>

    <slot />

    <p v-if="error" :id="`${id}-error`" class="mt-1.5 text-xs text-danger-dark" role="alert">
      {{ error }}
    </p>
    <p v-else-if="hint" :id="`${id}-hint`" class="mt-1.5 text-xs text-text-muted">
      {{ hint }}
    </p>
  </div>
</template>