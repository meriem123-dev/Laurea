<script setup lang="ts">
import type { Component } from 'vue'
import { useRouter } from 'vue-router'
import { BookOpen, CalendarDays, GraduationCap, Plus, Users } from '@lucide/vue'
import BaseButton from '../../components/common/BaseButton.vue'
import StatCard from '../../components/common/StatCard.vue'
import DefenseProgressCard from '../../components/dashboard/DefenseProgressCard.vue'
import TodoActionsCard from '../../components/dashboard/TodoActionsCard.vue'
import UpcomingDefensesCard from '../../components/dashboard/UpcomingDefensesCard.vue'
import PageHeader from '../../components/layout/PageHeader.vue'
import {
  adminStats,
  defenseBreakdown,
  todoActions,
  upcomingDefenses,
} from '../../mocks/adminDashboard'
import type { StatId } from '../../types/dashboard'
import type { IconTone } from '../../types/ui'

const router = useRouter()

// TODO backend : nom issu du store auth
const adminName = 'Admin'

const statVisuals: Record<StatId, { icon: Component; tone: IconTone }> = {
  students: { icon: Users, tone: 'teal' },
  professors: { icon: GraduationCap, tone: 'blue' },
  projects: { icon: BookOpen, tone: 'violet' },
  defenses: { icon: CalendarDays, tone: 'orange' },
}
</script>

<template>
  <div class="mx-auto flex max-w-7xl flex-col gap-6">
    <PageHeader
      :title="`Bonjour ${adminName},`"
      subtitle="Voici un aperçu des soutenances pour cette année universitaire."
    >
      <BaseButton size="md" @click="router.push('/admin/planning')">
        <Plus class="h-4 w-4" aria-hidden="true" />
        Planifier une soutenance
      </BaseButton>
    </PageHeader>

    <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Chiffres clés">
      <StatCard
        v-for="(stat, index) in adminStats"
        :key="stat.id"
        :label="stat.label"
        :value="stat.value"
        :hint="stat.hint"
        :icon="statVisuals[stat.id].icon"
        :tone="statVisuals[stat.id].tone"
        class="motion-safe:animate-fade-up"
        :style="{ animationDelay: `${index * 80}ms` }"
      />
    </section>

    <div class="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <DefenseProgressCard
        :items="defenseBreakdown"
        subtitle="Répartition par statut · Promotion 2025"
      />
      <UpcomingDefensesCard
        :defenses="upcomingDefenses"
        subtitle="7 jours à venir"
        view-all-to="/admin/defenses"
      />
    </div>

    <TodoActionsCard :actions="todoActions" />
  </div>
</template>