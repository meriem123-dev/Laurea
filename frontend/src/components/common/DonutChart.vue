<script setup lang="ts">
import { computed } from 'vue'

interface Segment {
  value: number
  colorClass: string // classe de couleur de texte, ex. 'text-navy-900' (utilisée via currentColor)
}

interface Props {
  segments: Segment[]
  size?: number
  thickness?: number
  ariaLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 176,
  thickness: 30,
  ariaLabel: 'Graphique en anneau',
})

const center = computed(() => props.size / 2)
const radius = computed(() => (props.size - props.thickness) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const total = computed(() => props.segments.reduce((sum, segment) => sum + segment.value, 0))

const arcs = computed(() => {
  let offset = 0
  return props.segments.map((segment) => {
    const length = total.value > 0 ? (segment.value / total.value) * circumference.value : 0
    const arc = {
      colorClass: segment.colorClass,
      dasharray: `${length} ${circumference.value - length}`,
      dashoffset: -offset,
    }
    offset += length
    return arc
  })
})
</script>

<template>
  <div class="relative shrink-0" :style="{ width: `${size}px`, height: `${size}px` }">
    <svg
      :width="size"
      :height="size"
      :viewBox="`0 0 ${size} ${size}`"
      class="-rotate-90"
      role="img"
      :aria-label="ariaLabel"
    >
      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        fill="none"
        :stroke-width="thickness"
        class="stroke-surface-muted"
      />
      <circle
        v-for="(arc, index) in arcs"
        :key="index"
        :cx="center"
        :cy="center"
        :r="radius"
        fill="none"
        stroke="currentColor"
        :stroke-width="thickness"
        :stroke-dasharray="arc.dasharray"
        :stroke-dashoffset="arc.dashoffset"
        :class="arc.colorClass"
      />
    </svg>

    <div class="absolute inset-0 flex flex-col items-center justify-center">
      <slot />
    </div>
  </div>
</template>