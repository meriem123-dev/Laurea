<script setup lang="ts">
import { computed, ref } from 'vue'
import { Plus } from '@lucide/vue'
import CalendarToolbar from '../../components/calendar/CalendarToolbar.vue'
import MonthGrid from '../../components/calendar/MonthGrid.vue'
import TimeGrid from '../../components/calendar/TimeGrid.vue'
import BaseAlert from '../../components/common/BaseAlert.vue'
import BaseButton from '../../components/common/BaseButton.vue'
import BaseCard from '../../components/common/BaseCard.vue'
import ConfirmDialog from '../../components/common/ConfirmDialog.vue'
import DefenseDetailsModal from '../../components/defenses/DefenseDetailsModal.vue'
import DefenseFormModal from '../../components/defenses/DefenseFormModal.vue'
import DefenseList from '../../components/defenses/DefenseList.vue'
import PageHeader from '../../components/layout/PageHeader.vue'
import { useCalendarNavigation } from '../../composables/useCalendarNavigation'
import { useDefensesData, type DefenseView } from '../../composables/useDefensesData'
import { formatDayMonth } from '../../utils/format'
import { initialCursor, nearestWeekday, todayISO } from '../../utils/calendar'
import { describeConflict, findConflicts } from '../../utils/defense'
import type { Defense } from '../../types/defense'

const { defenses, views, rooms, professors, removeDefense } = useDefensesData()

const { view, cursor, days, weeks, range, rangeLabel, shift, goToday, goTo } =
  useCalendarNavigation(initialCursor(defenses.value.map((defense) => defense.date)))

const today = todayISO()

// Soutenances de la période affichée
const visibleViews = computed(() =>
  views.value.filter(
    (item) => item.defense.date >= range.value.from && item.defense.date <= range.value.to,
  ),
)

// Conflits de la période (salle ou professeur occupés deux fois sur le même créneau)
const conflictMessages = computed(() => {
  const visible = visibleViews.value.map((item) => item.defense)
  return findConflicts(visible).map((conflict) =>
    describeConflict(conflict, rooms, professors, defenses.value),
  )
})

const conflictSummary = computed(() => {
  const [first, ...rest] = conflictMessages.value
  if (!first) return ''
  return rest.length > 0 ? `${first} (et ${rest.length} autre(s)).` : first
})

// Soutenance ciblée par la fiche, la modification ou la suppression (null = création)
const selected = ref<Defense | null>(null)
const isFormOpen = ref(false)
const isDetailsOpen = ref(false)
const isDeleteOpen = ref(false)

const formDate = computed(() => nearestWeekday(cursor.value))

const deleteMessage = computed(() => {
  const current = selected.value
  if (!current) return ''
  const names = views.value.find((item) => item.defense.id === current.id)?.studentNames ?? ''
  return `La soutenance de ${names} du ${formatDayMonth(current.date)} à ${current.time} sera supprimée. Cette action est irréversible.`
})

function openCreate() {
  selected.value = null
  isFormOpen.value = true
}

function openDetails(item: DefenseView) {
  selected.value = item.defense
  isDetailsOpen.value = true
}

function editFromDetails() {
  isDetailsOpen.value = false
  isFormOpen.value = true
}

function deleteFromDetails() {
  isDetailsOpen.value = false
  isDeleteOpen.value = true
}

function openDay(date: string) {
  goTo(date)
  view.value = 'day'
}

function confirmDelete() {
  // TODO backend : DELETE /defenses/:id. Ici : suppression locale, non enregistrée.
  const current = selected.value
  if (!current) return
  removeDefense(current.id)
  isDeleteOpen.value = false
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-6xl flex-col gap-6">
    <PageHeader
      eyebrow="Pilotage académique"
      title="Planification des soutenances"
      subtitle="Organisez le calendrier, les salles et les membres des jurys."
    >
      <BaseButton size="md" class="w-full sm:w-auto" @click="openCreate">
        <Plus class="h-4 w-4" aria-hidden="true" />
        Nouvelle soutenance
      </BaseButton>
    </PageHeader>

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

    <DefenseFormModal
      v-model="isFormOpen"
      :defense="selected"
      :initialDate="formDate"
      @saved="goTo"
    />

    <DefenseDetailsModal
      v-model="isDetailsOpen"
      :defense="selected"
      editable
      deletable
      @edit="editFromDetails"
      @delete="deleteFromDetails"
    />

    <ConfirmDialog
      v-model="isDeleteOpen"
      title="Supprimer cette soutenance ?"
      :message="deleteMessage"
      confirmLabel="Supprimer"
      @confirm="confirmDelete"
    />
  </div>
</template>