<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
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
import { useAdminDefenses } from '../../composables/useAdminDefenses'
import type { DefenseView } from '../../composables/useDefensesData'
import type { DefenseNotifications } from './api/defenses.api'
import { getErrorMessage } from '../../utils/apiError'
import { formatDayMonth } from '../../utils/format'
import { initialCursor, nearestWeekday, todayISO } from '../../utils/calendar'
import { describeConflict, findConflicts } from '../../utils/defense'
import type { Defense } from '../../types/defense'

// soutenances, projets, professeurs et salles chargés depuis le back
const { defenses, views, rooms, professors, loading, error, loadAll, removeDefense } =
  useAdminDefenses()

const { view, cursor, days, weeks, range, rangeLabel, shift, goToday, goTo } =
  useCalendarNavigation(initialCursor(defenses.value.map((defense) => defense.date)))

// au premier chargement, le calendrier se place sur la prochaine soutenance (comme avant)
onMounted(async () => {
  await loadAll()
  goTo(initialCursor(defenses.value.map((defense) => defense.date)))
})

// Retours à l'utilisateur (enregistrement, suppression, mails envoyés)
const feedback = ref<{ tone: 'success' | 'warning' | 'error'; text: string } | null>(null)

const FEEDBACK_CLASSES = {
  success: 'border-green-200 bg-green-50 text-green-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  error: 'border-red-200 bg-red-50 text-red-800',
} as const

function mailFeedback(action: string, notifications: DefenseNotifications) {
  if (notifications.failed > 0) {
    feedback.value = {
      tone: 'warning',
      text: `${action}, mais ${notifications.failed} e-mail(s) n’ont pas pu être envoyés.`,
    }
  } else {
    const mails = notifications.sent ? ` ${notifications.sent} e-mail(s) envoyé(s).` : ''
    feedback.value = { tone: 'success', text: `${action}.${mails}` }
  }
}

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
    describeConflict(conflict, rooms.value, professors.value, defenses.value),
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

// la fiche affiche la soutenance enrichie avec les données du back
const selectedView = computed(() =>
  selected.value ? (views.value.find((item) => item.defense.id === selected.value?.id) ?? null) : null,
)

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

// après enregistrement : on va à la date de la soutenance et on indique les mails envoyés
function onSaved(date: string, notifications: DefenseNotifications) {
  goTo(date)
  mailFeedback(selected.value ? 'Soutenance modifiée' : 'Soutenance planifiée', notifications)
}

// la soutenance sélectionnée peut avoir été mise à jour par le back (réponses du jury…)
watch(defenses, () => {
  if (selected.value) {
    selected.value = defenses.value.find((item) => item.id === selected.value?.id) ?? null
  }
})

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

// DELETE /defenses/:id : le back envoie les annulations par mail
async function confirmDelete() {
  const current = selected.value
  if (!current) return
  feedback.value = null
  try {
    mailFeedback('Soutenance supprimée', await removeDefense(current.id))
  } catch (e) {
    feedback.value = { tone: 'error', text: getErrorMessage(e, 'Suppression impossible.') }
  } finally {
    isDeleteOpen.value = false
  }
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

        <p
      v-if="feedback"
      role="status"
      :class="['rounded-lg border p-4 text-sm', FEEDBACK_CLASSES[feedback.tone]]"
    >
      {{ feedback.text }}
    </p>

    <p v-if="loading" class="text-sm text-text-muted">Chargement des soutenances…</p>
    <div
      v-else-if="error"
      role="alert"
      class="flex items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
    >
      <span>{{ error }}</span>
      <BaseButton variant="secondary" size="md" @click="loadAll()">Réessayer</BaseButton>
    </div>
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
      @saved="onSaved"
    />

    <DefenseDetailsModal
      v-model="isDetailsOpen"
      :defense="selected"
      editable
      deletable
      @edit="editFromDetails"
      @delete="deleteFromDetails"
      :view="selectedView"
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