<script setup lang="ts">
import { RouterView } from 'vue-router'
import { Toaster } from 'vue-sonner'
import 'vue-sonner/style.css'
import ServerWakingBanner from './components/common/ServerWakingBanner.vue';
</script>

<template>
  <ServerWakingBanner />
  <RouterView />
   <Toaster position="top-right" rich-colors />
</template>