<script setup lang="ts">
import { computed } from 'vue'
import { AlertCircle, Info } from '@lucide/vue'

type Variant = 'info' | 'error'

interface Props {
  variant?: Variant
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'info',
  title: '',
})

const styles: Record<Variant, { box: string; title: string; icon: string }> = {
  info: {
    box: 'border border-dashed border-border-strong bg-white/60',
    title: 'text-ink',
    icon: 'text-brass',
  },
  error: {
    box: 'border border-danger/30 bg-danger-soft',
    title: 'text-danger-dark',
    icon: 'text-danger-dark',
  },
}

const icon = computed(() => (props.variant === 'error' ? AlertCircle : Info))
</script>

<template>
  <div
    class="flex items-start gap-3 rounded-lg px-4 py-3"
    :class="styles[variant].box"
    :role="variant === 'error' ? 'alert' : 'status'"
  >
    <component
      :is="icon"
      class="mt-0.5 h-4 w-4 shrink-0"
      :class="styles[variant].icon"
      aria-hidden="true"
    />
    <div>
      <p v-if="title" class="text-xs font-semibold" :class="styles[variant].title">
        {{ title }}
      </p>
      <p class="text-xs text-text-secondary" :class="title ? 'mt-0.5' : ''">
        <slot />
      </p>
    </div>
  </div>
</template>