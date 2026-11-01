<script setup lang="ts">
import { computed } from 'vue'
import { Loader2 } from '@lucide/vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit' | 'reset'
  loading?: boolean
  disabled?: boolean
  block?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'lg',
  type: 'button',
  loading: false,
  disabled: false,
  block: false,
})

const variantClasses: Record<NonNullable<Props['variant']>, string> = {
  primary: 'bg-ink text-on-ink hover:bg-ink/85',
  secondary: 'border border-border-strong bg-card text-ink hover:bg-surface',
  danger: 'bg-danger-strong text-white hover:brightness-110',
}

const sizeClasses: Record<NonNullable<Props['size']>, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-sm',
}

const classes = computed(() => [
  variantClasses[props.variant],
  sizeClasses[props.size],
  props.block ? 'w-full' : '',
])
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="group inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-ink/20 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
    :class="classes"
  >
    <Loader2 v-if="loading" class="h-4 w-4 animate-spin" aria-hidden="true" />
    <slot />
  </button>
</template>