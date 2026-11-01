<script setup lang="ts">
import { computed, type Component } from 'vue'
import { BookOpen, CalendarDays, Users } from '@lucide/vue'
import StatCard from '../../components/common/StatCard.vue'
import StatStrip from '../../components/common/StatStrip.vue'
import ProfessorTodosCard from '../../components/dashboard/ProfessorTodosCard.vue'
import UpcomingDefensesCard from '../../components/dashboard/UpcomingDefensesCard.vue'
import PageHeader from '../../components/layout/PageHeader.vue'
import {
  professorPriority,
  professorStats,
  professorTodos,
  professorUpcomingDefenses,
} from '../../mocks/professorDashboard'
import { formatLongDate } from '../../utils/format'
import { useAuthStore } from '../auth/store.js'
import type { ProfessorStatId } from '../../types/dashboard'

const auth = useAuthStore()

const greeting = computed(() =>
  auth.user ? `Bonjour ${auth.user.firstName},` : 'Bonjour,',
)
const today = formatLongDate(new Date())

const statIcons: Record<ProfessorStatId, Component> = {
  supervised: BookOpen,
  upcoming: CalendarDays,
  juries: Users,
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-6xl flex-col gap-8">
    <PageHeader
      eyebrow="Vue d’ensemble"
      :title="greeting"
      subtitle="Votre espace d’encadrement et de participation aux jurys."
    >
      <div class="border-l-2 border-primary-400 pl-3">
        <p class="text-[0.625rem] font-bold uppercase tracking-[0.14em] text-text-muted">
          Aujourd’hui
        </p>
        <p class="mt-0.5 text-xs font-semibold text-ink">{{ today }}</p>
      </div>
    </PageHeader>

    <StatStrip
      :columns="3"
      aria-label="Chiffres clés"
      class="motion-safe:animate-fade-up [animation-delay:100ms]"
    >
      <StatCard
        v-for="stat in professorStats"
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
      <UpcomingDefensesCard
        title="Mes prochaines soutenances"
        subtitle="Semaine du 16 juin"
        viewAllLabel="Planning complet"
        view-all-to="/professor/planning"
        :defenses="professorUpcomingDefenses"
      />
      <ProfessorTodosCard :actions="professorTodos" :priority="professorPriority" />
    </div>
  </div>
</template>