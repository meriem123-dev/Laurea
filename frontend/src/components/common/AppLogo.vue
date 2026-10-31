<script setup lang="ts">
import logo from '../../assets/images/logo.png'

interface Props {
  variant?: 'onDark' | 'onLight'
}

withDefaults(defineProps<Props>(), {
  variant: 'onLight',
})
</script>

<template>
  <img
    :src="logo"
    alt="Laurea"
    class="w-auto self-start object-contain"
    :class="variant === 'onDark' ? 'brightness-0 invert' : ''"
  />
</template>