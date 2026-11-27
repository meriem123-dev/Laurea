<script setup lang="ts">
import { computed, type Component } from 'vue'
import { useRouter } from 'vue-router'
import { BookOpen, CalendarDays, GraduationCap, Plus, Users } from '@lucide/vue'
import BaseButton from '../../components/common/BaseButton.vue'
import StatCard from '../../components/common/StatCard.vue'
import StatStrip from '../../components/common/StatStrip.vue'
import DefenseProgressCard from '../../components/dashboard/DefenseProgressCard.vue'
import TodoActionsCard from '../../components/dashboard/TodoActionsCard.vue'
import UpcomingDefensesCard from '../../components/dashboard/UpcomingDefensesCard.vue'
import PageHeader from '../../components/layout/PageHeader.vue'
import { useAdminDashboard } from './composables/useAdminDashboard'
import { useAuthStore } from '../auth/store.js'
import { formatLongDate } from '../../utils/format'
import type { StatId } from '../../types/dashboard'

const router = useRouter()
const auth = useAuthStore()
const { loading, error, stats, breakdown, upcoming, todos, reload } = useAdminDashboard()

const adminName = computed(() => auth.user?.firstName ?? 'Admin')
const today = formatLongDate(new Date())

const statIcons: Record<StatId, Component> = {
  students: Users,
  professors: GraduationCap,
  projects: BookOpen,
  defenses: CalendarDays,
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-6xl flex-col gap-8">
    <PageHeader
      :eyebrow="today"
      :title="`Bonjour ${adminName},`"
      subtitle="Voici un aperçu des soutenances pour cette année universitaire."
    >
      <BaseButton size="md" class="w-full sm:w-auto" @click="router.push('/admin/defenses')">
        <Plus class="h-4 w-4" aria-hidden="true" />
        Planifier une soutenance
      </BaseButton>
    </PageHeader>

    <div
      v-if="error"
      role="alert"
      class="flex items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
    >
      <span>{{ error }}</span>
      <BaseButton variant="secondary" size="md" @click="reload()">Réessayer</BaseButton>
    </div>

    <p v-else-if="loading" class="text-sm text-text-muted">Chargement du tableau de bord…</p>

    <template v-else>
      <StatStrip
        aria-label="Chiffres clés"
        class="motion-safe:animate-fade-up [animation-delay:100ms]"
      >
        <StatCard
          v-for="stat in stats"
          :key="stat.id"
          :label="stat.label"
          :value="stat.value"
          :hint="stat.hint"
          :icon="statIcons[stat.id]"
        />
      </StatStrip>

      <div
        class="grid grid-cols-1 gap-6 motion-safe:animate-fade-up [animation-delay:200ms] lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]"
      >
        <DefenseProgressCard :items="breakdown" subtitle="Répartition par statut" />
        <UpcomingDefensesCard
          :defenses="upcoming"
          subtitle="7 jours à venir"
          view-all-to="/admin/defenses"
        />
      </div>

      <TodoActionsCard
        :actions="todos"
        class="motion-safe:animate-fade-up [animation-delay:300ms]"
      />
    </template>
  </div>
</template>