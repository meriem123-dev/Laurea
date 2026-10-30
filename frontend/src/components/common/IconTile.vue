<script setup lang="ts">
import type { Component } from 'vue'
import type { IconTone } from '../../types/ui'

withDefaults(
  defineProps<{
    icon: Component
    tone: IconTone
    size?: 'sm' | 'md'
  }>(),
  { size: 'md' },
)

const toneClasses: Record<IconTone, string> = {
  teal: 'bg-teal-soft text-teal',
  blue: 'bg-primary-50 text-primary-600',
  violet: 'bg-violet-soft text-violet',
  orange: 'bg-warning-soft text-warning',
}

const sizeClasses = {
  sm: 'h-8 w-8 rounded-lg',
  md: 'h-11 w-11 rounded-xl',
}
</script>

<template>
  <span
    class="flex shrink-0 items-center justify-center"
    :class="[toneClasses[tone], sizeClasses[size]]"
  >
    <component :is="icon" :class="size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'" aria-hidden="true" />
  </span>
</template>