<script setup lang="ts">
import { serverWaking } from "../../api/server-status";
</script>

<template>
  <Transition name="fade">
    <div
      v-if="serverWaking"
      class="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-3 bg-danger-soft px-4  text-sm text-danger shadow"
    >
      <span
        class="h-2 w-4 text-sm animate-spin rounded-full border-2 border-danger-soft border-t-transparent"
      />
      Le serveur démarre, ça peut prendre jusqu'à une minute…
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>