<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AppNavbar from '../components/layout/AppNavbar.vue'
import AppSidebar from '../components/layout/AppSidebar.vue'
import { NAV_BY_ROLE } from '../utils/navigation'
import { ROLE_LABELS } from '../utils/roles'
import type { UserRole } from '../types/auth'

const props = defineProps<{
  role: UserRole
}>()

const route = useRoute()
const sidebarOpen = ref(false)

const sections = computed(() => NAV_BY_ROLE[props.role])
// TODO backend : remplacer par l'utilisateur du store auth
const userLabel = computed(() => ROLE_LABELS[props.role])
const pageTitle = computed(() => (typeof route.meta.title === 'string' ? route.meta.title : ''))

// Referme le tiroir mobile après chaque navigation
watch(
  () => route.fullPath,
  () => {
    sidebarOpen.value = false
  },
)
</script>

<template>
  <!-- overflow-x-clip (et non hidden) : empêche tout défilement horizontal sans casser le sticky -->
  <div class="flex min-h-screen w-full overflow-x-clip bg-surface">
    <AppSidebar :sections="sections" :open="sidebarOpen" />

    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-30 bg-ink/50 lg:hidden"
      aria-hidden="true"
      @click="sidebarOpen = false"
    />

    <div class="flex min-w-0 flex-1 flex-col">
      <AppNavbar
        :title="pageTitle"
        :user-label="userLabel"
        :user-initial="userLabel.charAt(0)"
        has-unread
        @toggle-sidebar="sidebarOpen = !sidebarOpen"
      />

      <main class="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        <RouterView />
      </main>
    </div>
  </div>
</template>