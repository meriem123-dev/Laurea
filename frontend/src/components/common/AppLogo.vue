<script setup lang="ts">
import { computed } from 'vue'

import logoLight from '../../assets/images/logo_fond_dark.png'
import logoDark from '../../assets/images/logo_fond_blanc.png'

interface Props {
  variant?: 'onDark' | 'onLight'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'onLight',
})

const logo = computed(() =>
  props.variant === 'onDark' ? logoLight : logoDark
)
</script>

<template>
  <img
    :src="logo"
    alt="Laurea"
    class="w-auto self-start object-contain"
  />
</template>