<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from '../../composables/useTheme'

import logoForDarkBg from '../../assets/images/logo_fond_dark.png'
import logoForLightBg from '../../assets/images/logo_fond_blanc.png'

interface Props {
  // onDark : fond toujours sombre (ex. AuthHero) / onLight : suit le thème de l'application
  variant?: 'onDark' | 'onLight'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'onLight',
})

const { isDark } = useTheme()

const logo = computed(() =>
  props.variant === 'onDark' || isDark.value ? logoForDarkBg : logoForLightBg,
)
</script>

<template>
  <img :src="logo" alt="Laurea" class="w-auto self-start object-contain" />
</template>