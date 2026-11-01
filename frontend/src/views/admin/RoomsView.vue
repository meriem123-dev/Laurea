<script setup lang="ts">
import { computed, ref } from 'vue'
import { DoorOpen, Pencil, Plus } from '@lucide/vue'
import BaseAlert from '../../components/common/BaseAlert.vue'
import BaseButton from '../../components/common/BaseButton.vue'
import ConfirmDialog from '../../components/common/ConfirmDialog.vue'
import DetailsModal from '../../components/common/DetailsModal.vue'
import EmptyState from '../../components/common/EmptyState.vue'
import EntityFormModal from '../../components/forms/EntityFormModal.vue'
import BaseInput from '../../components/forms/BaseInput.vue'
import PageHeader from '../../components/layout/PageHeader.vue'
import RoomCard from '../../components/rooms/RoomCard.vue'
import { useDefensesData } from '../../composables/useDefensesData'
import { useRoomsData } from '../../composables/useRoomsData'
import { todayISO } from '../../utils/calendar'
import { formatDayMonth } from '../../utils/format'
import { capacityLabel, roomAvailability, roomSubtitle } from '../../utils/room'
import { buildRoomFields, roomToFormValues, toRoomData } from '../../utils/roomForm'
import type { FormValues } from '../../types/form'
import type { Room } from '../../types/room'

const { rooms, addRoom, updateRoom, removeRoom } = useRoomsData()
const { defenses } = useDefensesData()

// Jour pour lequel on calcule la disponibilité (par défaut : aujourd'hui)
const date = ref(todayISO())
const day = computed(() => date.value || todayISO())

// Salle ciblée par la modification, la fiche ou la suppression (null = création)
const selected = ref<Room | null>(null)
const isFormOpen = ref(false)
const isDetailsOpen = ref(false)
const isDeleteOpen = ref(false)
const blockedMessage = ref('')

const isEdit = computed(() => selected.value !== null)

const formFields = computed(() =>
  buildRoomFields(
    rooms.filter((room) => room.id !== selected.value?.id).map((room) => room.name),
  ),
)

const initialValues = computed(() => (selected.value ? roomToFormValues(selected.value) : undefined))

function statusOf(room: Room) {
  return roomAvailability(room, defenses.value, day.value)
}

function bookingCount(room: Room): number {
  return defenses.value.filter((defense) => defense.roomId === room.id).length
}

const detailsFields = computed(() => {
  const room = selected.value
  if (!room) return []
  return [
    { label: 'Bloc', value: room.block },
    { label: 'Pôle', value: room.pole },
    { label: 'Capacité', value: capacityLabel(room.capacity) },
    { label: 'Équipements', value: room.equipment },
    { label: 'Soutenances planifiées', value: String(bookingCount(room)) },
  ]
})

const detailsBadge = computed(() => {
  const room = selected.value
  if (!room) return undefined
  const status = statusOf(room)
  return { label: `Disponibilité le ${formatDayMonth(day.value)}`, text: status.label, tone: status.tone }
})

function openCreate() {
  blockedMessage.value = ''
  selected.value = null
  isFormOpen.value = true
}

function openDetails(room: Room) {
  blockedMessage.value = ''
  selected.value = room
  isDetailsOpen.value = true
}

function openEdit(room: Room) {
  blockedMessage.value = ''
  selected.value = room
  isFormOpen.value = true
}

function editFromDetails() {
  isDetailsOpen.value = false
  isFormOpen.value = true
}

function openDelete(room: Room) {
  const count = bookingCount(room)
  if (count > 0) {
    // On refuse de supprimer une salle utilisée : les soutenances perdraient leur lieu
    blockedMessage.value = `Impossible de supprimer ${room.name} : ${count} soutenance(s) y sont planifiées. Déplacez-les d’abord.`
    return
  }
  blockedMessage.value = ''
  selected.value = room
  isDeleteOpen.value = true
}

function saveRoom(values: FormValues) {
  // TODO backend : POST /rooms ou PUT /rooms/:id. Ici : enregistrement local en mémoire,
  // perdu au rechargement.
  const data = toRoomData(values)
  if (selected.value) updateRoom(selected.value.id, data)
  else addRoom(data)
  isFormOpen.value = false
}

function deleteRoom() {
  // TODO backend : DELETE /rooms/:id. Ici : suppression locale, non enregistrée.
  const current = selected.value
  if (!current) return
  removeRoom(current.id)
  isDeleteOpen.value = false
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-6xl flex-col gap-6">
    <PageHeader
      eyebrow="Ressources & cohortes"
      title="Gestion des salles"
      subtitle="Consultez les capacités et disponibilités des espaces."
    >
      <BaseButton size="md" class="w-full sm:w-auto" @click="openCreate">
        <Plus class="h-4 w-4" aria-hidden="true" />
        Ajouter une salle
      </BaseButton>
    </PageHeader>

    <div class="w-full sm:w-64">
      <BaseInput
        id="rooms-date"
        :modelValue="date"
        variant="boxed"
        type="date"
        label="Disponibilité le"
        @update:modelValue="date = $event"
      />
    </div>

    <BaseAlert v-if="blockedMessage" variant="error">{{ blockedMessage }}</BaseAlert>

    <EmptyState v-if="rooms.length === 0" message="Aucune salle pour le moment." />

    <ul v-else class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <li
        v-for="(room, index) in rooms"
        :key="room.id"
        class="min-w-0 motion-safe:animate-fade-up"
        :style="{ animationDelay: `${Math.min(index, 8) * 60}ms` }"
      >
        <RoomCard
          :room="room"
          :status="statusOf(room)"
          @view="openDetails"
          @edit="openEdit"
          @delete="openDelete"
        />
      </li>
    </ul>

    <EntityFormModal
      v-model="isFormOpen"
      :title="isEdit ? 'Modifier la salle' : 'Ajouter une salle'"
      :subtitle="
        isEdit
          ? 'Mettez à jour les informations de la salle.'
          : 'Créez un nouvel espace et configurez ses informations de base.'
      "
      :icon="isEdit ? Pencil : DoorOpen"
      :fields="formFields"
      :initialValues="initialValues"
      :submitLabel="isEdit ? 'Enregistrer' : 'Ajouter la salle'"
      @submit="saveRoom"
    />

    <DetailsModal
      v-model="isDetailsOpen"
      :title="selected?.name ?? ''"
      :subtitle="selected ? roomSubtitle(selected) : ''"
      :icon="DoorOpen"
      :fields="detailsFields"
      :badge="detailsBadge"
      editable
      @edit="editFromDetails"
    />

    <ConfirmDialog
      v-model="isDeleteOpen"
      title="Supprimer cette salle ?"
      :message="
        selected ? `La salle « ${selected.name} » sera supprimée. Cette action est irréversible.` : ''
      "
      confirmLabel="Supprimer"
      @confirm="deleteRoom"
    />
  </div>
</template>