<script setup lang="ts">
import { computed } from 'vue'
import { Loader2 } from 'lucide-vue-next'

interface Props {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'md' | 'lg'
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
  primary: 'bg-primary-700 text-white shadow-lg shadow-primary-700/25 hover:bg-primary-800',
  secondary: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
  danger: 'bg-red-600 text-white shadow-lg shadow-red-600/20 hover:bg-red-700',
}

const sizeClasses: Record<NonNullable<Props['size']>, string> = {
  md: 'h-10 rounded-lg px-5',
  lg: 'h-12 rounded-full px-6',
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
    class="inline-flex items-center justify-center gap-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-700/25 disabled:cursor-not-allowed disabled:opacity-60"
    :class="classes"
  >
    <Loader2 v-if="loading" class="h-4 w-4 animate-spin" aria-hidden="true" />
    <slot />
  </button>
</template>