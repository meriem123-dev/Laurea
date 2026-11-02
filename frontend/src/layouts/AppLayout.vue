<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import AppNavbar from '../components/layout/AppNavbar.vue'
import AppSidebar from '../components/layout/AppSidebar.vue'
import { useNotifications } from '../composables/useNotifications'
import { NAV_BY_ROLE } from '../utils/navigation'
import { ROLE_LABELS } from '../utils/roles'
import { useAuthStore } from '../views/auth/store.js'
import type { UserRole } from '../types/auth'

const NOTIFICATIONS_PATH_BY_ROLE: Record<UserRole, string> = {
  ADMIN_STAFF: '/admin/notifications',
  TEACHER: '/professor/notifications',
  STUDENT: '/student/notifications',
}

const props = defineProps<{
  role: UserRole
}>()

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { unreadCount } = useNotifications(() => props.role)
const sidebarOpen = ref(false)

// Le badge « Notifications » de la barre latérale suit le nombre de notifications non lues
const sections = computed(() =>
  NAV_BY_ROLE[props.role].map((section) => ({
    ...section,
    items: section.items.map((item) =>
      item.to === NOTIFICATIONS_PATH_BY_ROLE[props.role]
        ? { ...item, badge: unreadCount.value }
        : item,
    ),
  })),
)

// L'espace étudiant n'a pas encore de page de notifications
const notificationsTo = computed(() => NOTIFICATIONS_PATH_BY_ROLE[props.role])

// nom du vrai utilisateur, sinon le libellé du rôle en secours
const userLabel = computed(() =>
  auth.user ? `${auth.user.firstName} ${auth.user.lastName}` : ROLE_LABELS[props.role],
)

const userInitials = computed(() =>
  userLabel.value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase(),
)

const pageTitle = computed(() => (typeof route.meta.title === 'string' ? route.meta.title : ''))

// Le menu mobile se referme quand on change de page
watch(
  () => route.fullPath,
  () => {
    sidebarOpen.value = false
  },
)

function logout() {
  auth.logout() // vide token + user
  void router.push('/login')
}
</script>

<template>
  <!-- overflow-x-clip (et non hidden) : empêche tout défilement horizontal sans casser le sticky -->
  <div class="flex min-h-screen w-full overflow-x-clip bg-surface">
    <AppSidebar
      :sections="sections"
      :open="sidebarOpen"
      :userLabel="userLabel"
      :userInitials="userInitials"
      :roleLabel="ROLE_LABELS[role]"
      @logout="logout"
    />

    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-30 bg-scrim/60 lg:hidden"
      aria-hidden="true"
      @click="sidebarOpen = false"
    />

    <div class="flex min-w-0 flex-1 flex-col">
      <AppNavbar
        :title="pageTitle"
        :userLabel="userLabel"
        :userInitial="userLabel.charAt(0)"
        :role="role"
        :notificationsTo="notificationsTo"
        @toggle-sidebar="sidebarOpen = !sidebarOpen"
      />

      <main class="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        <RouterView />
      </main>
    </div>
  </div>
</template>