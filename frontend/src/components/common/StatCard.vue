<script setup lang="ts">
import type { Component } from 'vue'

type Tone = 'neutral' | 'success' | 'warning' | 'danger'

withDefaults(
  defineProps<{
    label: string
    value: string | number
    hint?: string
    hintTone?: 'success' | 'neutral'
    icon: Component
    tone?: Tone // couleur de l'icône
    interactive?: boolean // devient un bouton (utilisé comme filtre)
    active?: boolean // filtre actif
  }>(),
  { hint: '', hintTone: 'success', tone: 'neutral', interactive: false, active: false },
)

const toneClasses: Record<Tone, string> = {
  neutral: 'text-text-muted',
  success: 'text-success-dark',
  warning: 'text-warning',
  danger: 'text-danger-dark',
}
</script>

<template>
  <component
    :is="interactive ? 'button' : 'div'"
    :type="interactive ? 'button' : undefined"
    :aria-pressed="interactive ? active : undefined"
    class="relative block w-full p-4 text-left sm:p-6"
    :class="[
      active ? 'bg-surface' : 'bg-card',
      interactive
        ? 'transition-colors hover:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink/30'
        : '',
    ]"
  >
    <span class="flex items-center justify-between gap-2">
      <span class="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-text-secondary">
        {{ label }}
      </span>
      <component
        :is="icon"
        class="h-4 w-4 shrink-0"
        :class="toneClasses[tone]"
        :stroke-width="1.75"
        aria-hidden="true"
      />
    </span>

    <span
      class="mt-4 block font-display text-5xl font-normal leading-none tracking-tight text-ink tabular-nums"
    >
      {{ value }}
    </span>

    <span
      v-if="hint"
      class="mt-3 block text-xs font-medium"
      :class="hintTone === 'success' ? 'text-success-dark' : 'text-text-secondary'"
    >
      {{ hint }}
    </span>

    <span v-if="active" class="absolute inset-x-0 bottom-0 h-0.5 bg-ink" aria-hidden="true" />
  </component>
</template>