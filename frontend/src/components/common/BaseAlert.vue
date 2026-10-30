<script setup lang="ts">
import { computed } from 'vue'
import { AlertCircle, Check } from '@lucide/vue'

type Variant = 'info' | 'error'

interface Props {
  variant?: Variant
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'info',
  title: '',
})

const styles: Record<Variant, { box: string; accent: string }> = {
  info: { box: 'bg-primary-50', accent: 'text-primary-700' },
  error: { box: 'bg-red-50', accent: 'text-red-600' },
}

const icon = computed(() => (props.variant === 'error' ? AlertCircle : Check))
</script>

<template>
  <div
    class="flex items-start gap-3 rounded-xl px-4 py-3"
    :class="styles[variant].box"
    :role="variant === 'error' ? 'alert' : 'status'"
  >
    <component
      :is="icon"
      class="mt-0.5 h-3.5 w-3.5 shrink-0"
      :class="styles[variant].accent"
      aria-hidden="true"
    />
    <div>
      <p v-if="title" class="text-xs font-semibold" :class="styles[variant].accent">
        {{ title }}
      </p>
      <p class="mt-0.5 text-[11px] text-slate-500">
        <slot />
      </p>
    </div>
  </div>
</template>