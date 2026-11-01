<script setup lang="ts">
import BaseCard from '../common/BaseCard.vue'
import BaseSwitch from '../forms/BaseSwitch.vue'
import { useTheme } from '../../composables/useTheme'

const { isDark, setTheme } = useTheme()
</script>

<template>
  <BaseCard title="Apparence" subtitle="Personnalisez l’affichage de l’interface">
    <BaseSwitch
      id="setting-dark"
      label="Mode sombre"
      description="Réduit l’éclat de l’interface en environnement peu éclairé."
      :modelValue="isDark"
      @update:modelValue="setTheme($event ? 'dark' : 'light')"
    />
  </BaseCard>
</template>