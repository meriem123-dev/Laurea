<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { ArrowRight, BookOpen, CalendarDays, Check, CircleCheck, Clock } from '@lucide/vue'
import BaseBadge from '../../components/common/BaseBadge.vue'
import BaseCard from '../../components/common/BaseCard.vue'
import EmptyState from '../../components/common/EmptyState.vue'
import IconTile from '../../components/common/IconTile.vue'
import SegmentedBar from '../../components/common/SegmentedBar.vue'
import PageHeader from '../../components/layout/PageHeader.vue'
import NotificationItem from '../../components/notifications/NotificationItem.vue'
import { useNotifications } from '../../composables/useNotifications'
import { useStudentSpace } from '../../composables/useStudentSpace'
import { CURRENT_STUDENT_ID } from '../../mocks/currentStudent'
import { projectSteps } from '../../mocks/studentSpace'
import { formatFullDate, formatWeekdayDayMonth } from '../../utils/dateLabels'
import { formatDayMonth } from '../../utils/format'
import { displayName } from '../../utils/professor'
import { projectProgress } from '../../utils/project'
import { PROJECT_STATUS_META } from '../../utils/projectStatus'
import { useAuthStore } from '../auth/store.js'
import type { AppNotification } from '../../types/notification'
import type { IconTone } from '../../types/ui'
import type { Component } from 'vue'

const CURSUS_LABELS = { MASTER: 'Master', INGENIEUR: 'Ingénieur' } as const

interface InfoCard {
  key: string
  label: string
  title: string
  detail: string
  action: string
  to: string
  icon: Component
  tone: IconTone
}

const router = useRouter()
const auth = useAuthStore()
const { student, project, supervisor, defense, meta } = useStudentSpace(CURRENT_STUDENT_ID)
const { notifications, unreadCount, markAsRead } = useNotifications('STUDENT')

const greeting = computed(() => {
  const firstName = auth.user?.firstName ?? student.value?.firstName
  return firstName ? `Bonjour ${firstName},` : 'Bonjour,'
})

const progress = computed(() => (project.value ? projectProgress(project.value.status) : 0))
const segments = computed(() => [
  { value: progress.value, colorClass: 'bg-primary-500' },
  { value: 100 - progress.value, colorClass: 'bg-surface-muted' },
])

const cards = computed<InfoCard[]>(() => {
  const current = defense.value
  return [
    {
      key: 'defense',
      label: 'Ma soutenance',
      title: current ? formatWeekdayDayMonth(current.defense.date) : 'Non planifiée',
      detail: current
        ? `${current.defense.time}${current.room ? ` · ${current.room.name}` : ''}`
        : 'La date vous sera communiquée.',
      action: 'Voir les détails',
      to: '/student/defense',
      icon: CalendarDays,
      tone: 'blue',
    },
    {
      key: 'deadline',
      label: 'Prochaine échéance',
      title: 'Rapport final',
      detail: meta.value ? `À déposer avant le ${formatDayMonth(meta.value.reportDeadline)}` : '',
      action: 'Déposer maintenant',
      to: '/student/project',
      icon: Clock,
      tone: 'orange',
    },
    {
      key: 'validation',
      label: 'Validation',
      title: 'Sujet approuvé',
      detail: meta.value ? `Validé le ${formatFullDate(meta.value.validatedOn)}` : '',
      action: 'Voir le suivi',
      to: '/student/project',
      icon: CircleCheck,
      tone: 'teal',
    },
  ]
})

const steps = computed(() =>
  projectSteps.map((step) =>
    step.id === 'defense' && defense.value
      ? { ...step, detail: formatFullDate(defense.value.defense.date) }
      : step,
  ),
)

const recent = computed(() => notifications.value.slice(0, 2))
const notificationsSubtitle = computed(() =>
  unreadCount.value > 0
    ? `${unreadCount.value} nouvelle(s) notification(s)`
    : 'Vous êtes à jour.',
)

function openNotification(item: AppNotification) {
  // TODO backend : PATCH /notifications/:id/read
  markAsRead(item.id)
  if (item.to) void router.push(item.to)
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-6xl flex-col gap-8">
    <PageHeader
      :title="greeting"
      subtitle="Votre projet avance bien. Voici les prochaines étapes à retenir."
    />

    <EmptyState v-if="!project" message="Aucun projet n’est rattaché à votre compte pour le moment." />

    <template v-else>
      <section
        class="relative overflow-hidden rounded-xl border border-primary-200 bg-primary-50 p-5 motion-safe:animate-fade-up sm:p-6"
      >
        <div class="flex items-center justify-between gap-6">
          <div class="min-w-0 flex-1">
            <BaseBadge :tone="PROJECT_STATUS_META[project.status].tone">
              Projet {{ PROJECT_STATUS_META[project.status].label.toLowerCase() }}
            </BaseBadge>

            <h2 class="mt-3 max-w-xl break-words font-display text-2xl leading-snug text-ink sm:text-3xl">
              {{ project.title }}
            </h2>

            <p class="mt-2 text-xs text-text-secondary">
              <template v-if="supervisor">
                Encadré par <span class="font-semibold text-ink">{{ displayName(supervisor) }}</span>
              </template>
              <template v-if="student">
                · {{ CURSUS_LABELS[student.cursus] }} {{ student.specialty }}
              </template>
            </p>

            <div class="mt-4 max-w-md">
              <div class="mb-2 flex items-center justify-between text-xs">
                <span class="text-text-muted">Progression du projet</span>
                <span class="font-semibold tabular-nums text-ink">{{ progress }}%</span>
              </div>
              <SegmentedBar
                :segments="segments"
                :aria-label="`Progression du projet : ${progress}%`"
              />
            </div>
          </div>

          <span
            class="hidden h-24 w-24 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600 sm:flex"
            aria-hidden="true"
          >
            <BookOpen class="h-9 w-9" :stroke-width="1.5" />
          </span>
        </div>
      </section>

      <ul
        class="grid grid-cols-1 gap-4 motion-safe:animate-fade-up [animation-delay:100ms] md:grid-cols-3"
      >
        <li v-for="card in cards" :key="card.key" class="min-w-0">
          <BaseCard class="h-full">
            <div class="flex items-start gap-4">
              <IconTile :icon="card.icon" :tone="card.tone" />
              <div class="min-w-0 flex-1">
                <p class="text-[0.625rem] font-bold uppercase tracking-[0.14em] text-text-muted">
                  {{ card.label }}
                </p>
                <p class="mt-1.5 font-display text-lg leading-snug text-ink">{{ card.title }}</p>
                <p class="mt-0.5 text-xs text-text-secondary">{{ card.detail }}</p>

                <RouterLink
                  :to="card.to"
                  class="group mt-3 inline-flex items-center gap-1.5 rounded-sm text-xs font-semibold text-ink underline decoration-border-strong underline-offset-4 transition hover:decoration-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
                >
                  {{ card.action }}
                  <ArrowRight
                    class="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </RouterLink>
              </div>
            </div>
          </BaseCard>
        </li>
      </ul>

      <div
        class="grid grid-cols-1 gap-6 motion-safe:animate-fade-up [animation-delay:200ms] lg:grid-cols-2"
      >
        <BaseCard title="Étapes du projet" subtitle="Votre parcours PFE">
          <ol class="grid grid-cols-2 gap-y-6 sm:grid-cols-4">
            <li
              v-for="(step, index) in steps"
              :key="step.id"
              class="relative flex flex-col items-center px-1 text-center"
            >
              <span
                v-if="index < steps.length - 1"
                class="absolute left-1/2 top-3.5 hidden h-px w-full bg-border sm:block"
                aria-hidden="true"
              />

              <span
                class="relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold"
                :class="
                  step.state === 'done'
                    ? 'bg-success text-white'
                    : step.state === 'current'
                      ? 'bg-ink text-on-ink'
                      : 'border border-border-strong bg-card text-text-muted'
                "
                :aria-current="step.state === 'current' ? 'step' : undefined"
              >
                <Check v-if="step.state === 'done'" class="h-3.5 w-3.5" aria-hidden="true" />
                <template v-else>{{ index + 1 }}</template>
              </span>

              <p class="mt-3 text-xs font-semibold text-ink">{{ step.label }}</p>
              <p class="mt-0.5 text-[0.6875rem] text-text-muted">{{ step.detail }}</p>
            </li>
          </ol>
        </BaseCard>

        <BaseCard :padded="false" class="overflow-hidden">
          <header class="flex items-start justify-between gap-4 px-5 pb-4 pt-5 sm:px-6 sm:pt-6">
            <div class="min-w-0">
              <h2 class="font-display text-xl font-normal tracking-tight text-ink">
                Notifications récentes
              </h2>
              <p class="mt-1 text-xs text-text-muted">{{ notificationsSubtitle }}</p>
            </div>
            <RouterLink
              to="/student/notifications"
              class="shrink-0 rounded-sm text-xs font-semibold text-ink underline decoration-border-strong underline-offset-4 transition hover:decoration-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
            >
              Voir tout
            </RouterLink>
          </header>

          <p v-if="recent.length === 0" class="px-5 pb-8 pt-2 text-center text-sm text-text-muted">
            Aucune notification.
          </p>
          <ul v-else class="divide-y divide-border border-t border-border">
            <li v-for="item in recent" :key="item.id">
              <NotificationItem :notification="item" @open="openNotification" />
            </li>
          </ul>
        </BaseCard>
      </div>
    </template>
  </div>
</template>