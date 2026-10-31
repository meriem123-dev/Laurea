<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface Segment {
  value: number
  colorClass: string // classe de fond, ex. 'bg-ink'
}

defineProps<{
  segments: Segment[]
  ariaLabel?: string
}>()

// Les segments « poussent » de 0 à leur taille au premier affichage
const ready = ref(false)
onMounted(() => {
  requestAnimationFrame(() => {
    ready.value = true
  })
})
</script>

<template>
  <div
    class="flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full"
    role="img"
    :aria-label="ariaLabel ?? 'Répartition'"
  >
    <div
      v-for="(segment, index) in segments"
      :key="index"
      class="h-full min-w-0 rounded-sm transition-[flex-grow] duration-1000 ease-out motion-reduce:transition-none"
      :class="segment.colorClass"
      :style="{
        flexGrow: ready ? segment.value : 0,
        flexBasis: 0,
        transitionDelay: `${index * 100}ms`,
      }"
    />
  </div>
</template>