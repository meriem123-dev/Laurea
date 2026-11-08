<script setup lang="ts">
import { computed, ref } from 'vue'
import CalendarToolbar from '../../components/calendar/CalendarToolbar.vue'
import MonthGrid from '../../components/calendar/MonthGrid.vue'
import TimeGrid from '../../components/calendar/TimeGrid.vue'
import BaseAlert from '../../components/common/BaseAlert.vue'
import BaseCard from '../../components/common/BaseCard.vue'
import DefenseDetailsModal from '../../components/defenses/DefenseDetailsModal.vue'
import DefenseList from '../../components/defenses/DefenseList.vue'
import PageHeader from '../../components/layout/PageHeader.vue'
import { useCalendarNavigation } from '../../composables/useCalendarNavigation'
import { useDefensesData, type DefenseView } from '../../composables/useDefensesData'
import { useProfessorDefenses } from '../../composables/useProfessorDefenses'
import { initialCursor, todayISO } from '../../utils/calendar'
import { describeConflict, findConflicts } from '../../utils/defense'
import type { Defense } from '../../types/defense'
import { CURRENT_PROFESSOR_ID } from '../../mocks/currentProfessor.js'



const { defenses, rooms, professors } = useDefensesData()
const { items } = useProfessorDefenses(CURRENT_PROFESSOR_ID)

// Uniquement les soutenances où le professeur intervient (président, jury ou encadrant)
const myViews = computed(() => items.value.map((item) => item.view))

const { view, cursor, days, weeks, range, rangeLabel, shift, goToday, goTo } =
  useCalendarNavigation(initialCursor(myViews.value.map((item) => item.defense.date)))

const today = todayISO()

// Soutenances de la période affichée
const visibleViews = computed(() =>
  myViews.value.filter(
    (item) => item.defense.date >= range.value.from && item.defense.date <= range.value.to,
  ),
)

// Conflits de la période (salle ou professeur occupés deux fois sur le même créneau)
const conflictMessages = computed(() =>
  findConflicts(visibleViews.value.map((item) => item.defense)).map((conflict) =>
    describeConflict(conflict, rooms, professors, defenses.value),
  ),
)

const conflictSummary = computed(() => {
  const [first, ...rest] = conflictMessages.value
  if (!first) return ''
  return rest.length > 0 ? `${first} (et ${rest.length} autre(s)).` : first
})

const selected = ref<Defense | null>(null)
const isDetailsOpen = ref(false)

function openDetails(item: DefenseView) {
  selected.value = item.defense
  isDetailsOpen.value = true
}

function openDay(date: string) {
  goTo(date)
  view.value = 'day'
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-6xl flex-col gap-6">
    <PageHeader
      eyebrow="Espace enseignant"
      title="Mon planning"
      subtitle="Retrouvez toutes vos soutenances : jurys et projets encadrés."
    />

    <CalendarToolbar
      v-model:view="view"
      :rangeLabel="rangeLabel"
      @prev="shift(-1)"
      @next="shift(1)"
      @today="goToday"
    />

    <BaseCard :padded="false" class="overflow-hidden">
      <TimeGrid
        v-if="view === 'day' || view === 'week'"
        :days="days"
        :items="visibleViews"
        :today="today"
        @select="openDetails"
      />
      <MonthGrid
        v-else-if="view === 'month'"
        :weeks="weeks"
        :month="cursor"
        :items="visibleViews"
        :today="today"
        @select="openDetails"
        @select-day="openDay"
      />
      <DefenseList v-else :items="visibleViews" @select="openDetails" />
    </BaseCard>

    <BaseAlert
      v-if="conflictMessages.length === 0"
      variant="success"
      title="Aucun conflit détecté"
    >
      Les salles et les membres de jury sont disponibles sur cette période.
    </BaseAlert>
    <BaseAlert
      v-else
      variant="error"
      :title="`${conflictMessages.length} conflit(s) détecté(s)`"
    >
      {{ conflictSummary }}
    </BaseAlert>

    <DefenseDetailsModal v-model="isDetailsOpen" :defense="selected" />
  </div>
</template>