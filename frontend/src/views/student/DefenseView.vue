<script setup lang="ts">
import { computed } from 'vue'
import { Building2, CalendarDays, Clock } from '@lucide/vue'
import BaseBadge from '../../components/common/BaseBadge.vue'
import BaseCard from '../../components/common/BaseCard.vue'
import EmptyState from '../../components/common/EmptyState.vue'
import InitialsAvatar from '../../components/common/InitialsAvatar.vue'
import PageHeader from '../../components/layout/PageHeader.vue'
import { useStudentSpace } from '../../composables/useStudentSpace'
import { CURRENT_STUDENT_ID } from '../../mocks/currentStudent'
import { formatLongDay } from '../../utils/calendar'
import { JURY_MEMBER_COUNT, defenseSlot, formatTime } from '../../utils/defense'
import { formatDay, formatMonthShort } from '../../utils/format'
import { displayName, initials } from '../../utils/professor'
import { roomLocation } from '../../utils/room'
import type { Professor } from '../../types/professor'

const { project, supervisor, defense } = useStudentSpace(CURRENT_STUDENT_ID)

const slot = computed(() => (defense.value ? defenseSlot(defense.value.defense) : null))

const status = computed(() => {
  const current = defense.value
  if (!current) return null
  return current.defense.memberIds.length >= JURY_MEMBER_COUNT
    ? { label: 'Confirmée', tone: 'success' as const }
    : { label: 'Planifiée', tone: 'warning' as const }
})

// Président, encadrant, puis examinateurs (sans doublon)
const jury = computed(() => {
  const current = defense.value
  if (!current) return []

  const list: { professor: Professor; role: string }[] = []
  const seen = new Set<number>()
  const add = (professor: Professor | undefined, role: string) => {
    if (!professor || seen.has(professor.id)) return
    seen.add(professor.id)
    list.push({ professor, role })
  }

  add(current.president, 'Président')
  add(supervisor.value, 'Encadrant')
  current.members.forEach((member) => add(member, 'Examinateur'))
  return list
})

// TODO backend : déroulement paramétrable par établissement
const steps = [
  { minutes: 25, label: 'Présentation orale du candidat (sans interruption du jury).' },
  { minutes: 20, label: 'Questions et débat avec les membres du jury.' },
  { minutes: 15, label: 'Délibération à huis clos et proclamation de la note et mention.' },
]
const totalMinutes = steps.reduce((sum, step) => sum + step.minutes, 0)
</script>

<template>
  <div class="mx-auto flex w-full max-w-4xl flex-col gap-6">
    <PageHeader
      eyebrow="Espace étudiant"
      title="Ma soutenance"
      subtitle="Toutes les informations pratiques pour le jour J."
    />

    <EmptyState
      v-if="!project"
      message="Aucun projet n’est rattaché à votre compte pour le moment."
    />
    <EmptyState
      v-else-if="!defense || !slot"
      message="Votre soutenance n’est pas encore planifiée. La date vous sera communiquée."
    />

    <template v-else>
      <BaseCard class="motion-safe:animate-fade-up">
        <div class="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div
            class="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-xl bg-primary-600 text-white"
          >
            <p class="font-display text-4xl leading-none">{{ formatDay(defense.defense.date) }}</p>
            <p class="mt-1.5 text-[0.625rem] font-bold uppercase tracking-[0.14em]">
              {{ formatMonthShort(defense.defense.date) }}
            </p>
          </div>

          <div class="min-w-0 flex-1">
            <BaseBadge v-if="status" :tone="status.tone">{{ status.label }}</BaseBadge>

            <h2 class="mt-2 break-words font-display text-2xl leading-snug text-ink">
              {{ project.title }}
            </h2>

            <ul class="mt-3 space-y-1.5 text-sm text-text-secondary">
              <li class="flex items-center gap-2">
                <Clock class="h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" />
                <span>
                  {{ formatLongDay(defense.defense.date) }} ·
                  <span class="tabular-nums">
                    {{ formatTime(slot.start) }} – {{ formatTime(slot.end) }}
                  </span>
                  · Durée prévue : {{ defense.defense.duration }} min
                </span>
              </li>
              <li v-if="defense.room" class="flex items-center gap-2">
                <Building2 class="h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" />
                <span>
                  {{ defense.room.name }}
                  <template v-if="roomLocation(defense.room)">
                    · {{ roomLocation(defense.room) }}
                  </template>
                </span>
              </li>
            </ul>
          </div>
        </div>
      </BaseCard>

      <BaseCard
        title="Composition du jury"
        subtitle="Les membres qui évalueront votre soutenance."
        class="motion-safe:animate-fade-up [animation-delay:100ms]"
      >
        <p v-if="jury.length === 0" class="py-4 text-center text-sm text-text-muted">
          Le jury n’est pas encore constitué.
        </p>

        <ul v-else class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <li
            v-for="member in jury"
            :key="member.professor.id"
            class="flex min-w-0 items-center gap-3 rounded-lg border border-border px-3 py-3"
          >
            <InitialsAvatar :initials="initials(member.professor)" size="sm" />
            <div class="min-w-0">
              <p class="truncate text-sm font-semibold text-ink">
                {{ displayName(member.professor) }}
              </p>
              <p class="truncate text-xs text-text-muted">{{ member.role }}</p>
            </div>
          </li>
        </ul>
      </BaseCard>

      <BaseCard
        :title="`Déroulement réglementaire (${totalMinutes} minutes au total)`"
        class="motion-safe:animate-fade-up [animation-delay:200ms]"
      >
        <ol class="divide-y divide-border">
          <li v-for="(step, index) in steps" :key="index" class="flex items-start gap-4 py-3">
            <span
              class="w-14 shrink-0 rounded-full bg-surface-muted px-2.5 py-1 text-center text-xs font-semibold tabular-nums text-ink"
            >
              {{ step.minutes }} min
            </span>
            <p class="text-sm text-text-body">{{ step.label }}</p>
          </li>
        </ol>
      </BaseCard>
    </template>
  </div>
</template>