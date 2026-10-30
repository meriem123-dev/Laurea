<script setup lang="ts">
import type { Component } from 'vue'
import type { IconTone } from '../../types/ui'
import BaseCard from './BaseCard.vue'
import IconTile from './IconTile.vue'

defineProps<{
  label: string
  value: string | number
  hint?: string
  icon: Component
  tone: IconTone
}>()
</script>

<template>
  <BaseCard
    :padded="false"
    class="p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-md"
  >
    <div class="flex items-center gap-4">
      <IconTile :icon="icon" :tone="tone" />
      <div>
        <p class="text-2xl font-semibold leading-none text-ink">{{ value }}</p>
        <p class="mt-1.5 text-xs text-text-secondary">{{ label }}</p>
      </div>
    </div>

    <p v-if="hint" class="mt-4 text-[11px] font-medium text-success">{{ hint }}</p>
  </BaseCard>
</template>