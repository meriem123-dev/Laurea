<script setup lang="ts">
import { GraduationCap } from '@lucide/vue'
import logo from '../../assets/images/logo.png'

interface Props {
  variant?: 'full' | 'icon'
}

withDefaults(defineProps<Props>(), {
  variant: 'full',
})
</script>

<template>
  <img
    v-if="variant === 'full'"
    :src="logo"
    alt="Laurea"
    class="h-16 w-auto self-start object-contain"
  />

  <GraduationCap
    v-else
    class="h-12 w-12 text-primary-600"
    :stroke-width="1.5"
    aria-label="Laurea"
  />
</template>