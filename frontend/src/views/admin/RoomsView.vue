<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

import { DoorOpen, Pencil, Plus } from "@lucide/vue";
import BaseAlert from "../../components/common/BaseAlert.vue";
import BaseButton from "../../components/common/BaseButton.vue";
import ConfirmDialog from "../../components/common/ConfirmDialog.vue";
import DetailsModal from "../../components/common/DetailsModal.vue";
import EmptyState from "../../components/common/EmptyState.vue";
import EntityFormModal from "../../components/forms/EntityFormModal.vue";
import BaseInput from "../../components/forms/BaseInput.vue";
import PageHeader from "../../components/layout/PageHeader.vue";
import RoomCard from "../../components/rooms/RoomCard.vue";
import { useDefensesData } from "../../composables/useDefensesData";
import { todayISO } from "../../utils/calendar";
import { formatDayMonth } from "../../utils/format";
import {
  capacityLabel,
  roomAvailability,
  roomSubtitle,
} from "../../utils/room";
import {
  buildRoomFields,
  roomToFormValues,
  toRoomData,
} from "../../utils/roomForm";
import type { FormValues } from "../../types/form";
import type { Room } from "../../types/room";
import { useRoomsStore } from "./stores/rooms.js";
import { storeToRefs } from "pinia";
import { isAxiosError } from "axios";
import { getErrorMessage } from "../../utils/apiError";

const roomsStore = useRoomsStore();
const { items: rooms, loading, error } = storeToRefs(roomsStore);
const isSaving = ref(false);
const formError = ref<string | null>(null);

onMounted(() => roomsStore.fetchAll());

function apiMessage(e: unknown): string {
  if (isAxiosError(e)) {
    if (e.response?.status === 409) return "Une salle porte déjà ce nom.";
    const msg = e.response?.data?.message;
    if (msg) return Array.isArray(msg) ? msg.join(", ") : String(msg);
  }
  return "Une erreur est survenue. Réessayez.";
}

const { defenses } = useDefensesData();

// Jour pour lequel on calcule la disponibilité (par défaut : aujourd'hui)
const date = ref(todayISO());
const day = computed(() => date.value || todayISO());

// Salle ciblée par la modification, la fiche ou la suppression (null = création)
const selected = ref<Room | null>(null);
const isFormOpen = ref(false);
const isDetailsOpen = ref(false);
const isDeleteOpen = ref(false);
const blockedMessage = ref("");

const isEdit = computed(() => selected.value !== null);

const feedback = ref<{
  tone: "success" | "warning" | "error";
  text: string;
} | null>(null);

const FEEDBACK_CLASSES = {
  success: "border-green-200 bg-green-50 text-green-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  error: "border-red-200 bg-red-50 text-red-800",
} as const;

const formFields = computed(() =>
  buildRoomFields(
    rooms.value
      .filter((room) => room.id !== selected.value?.id)
      .map((room) => room.name),
  ),
);

const initialValues = computed(() =>
  selected.value ? roomToFormValues(selected.value) : undefined,
);

function statusOf(room: Room) {
  return roomAvailability(room, defenses.value, day.value);
}

function bookingCount(room: Room): number {
  return defenses.value.filter((defense) => defense.roomId === room.id).length;
}

const detailsFields = computed(() => {
  const room = selected.value;
  if (!room) return [];
  return [
    { label: "Bloc", value: room.block },
    { label: "Pôle", value: room.pole },
    { label: "Capacité", value: capacityLabel(room.capacity) },
    { label: "Équipements", value: room.equipment },
    { label: "Soutenances planifiées", value: String(bookingCount(room)) },
  ];
});

const detailsBadge = computed(() => {
  const room = selected.value;
  if (!room) return undefined;
  const status = statusOf(room);
  return {
    label: `Disponibilité le ${formatDayMonth(day.value)}`,
    text: status.label,
    tone: status.tone,
  };
});

function openCreate() {
  formError.value = null;
  blockedMessage.value = "";
  selected.value = null;
  isFormOpen.value = true;
}

function openDetails(room: Room) {
  blockedMessage.value = "";
  selected.value = room;
  isDetailsOpen.value = true;
}

function openEdit(room: Room) {
  formError.value = null;
  blockedMessage.value = "";
  selected.value = room;
  isFormOpen.value = true;
}

function editFromDetails() {
  formError.value = null;
  isDetailsOpen.value = false;
  isFormOpen.value = true;
}

function openDelete(room: Room) {
  const count = bookingCount(room);
  if (count > 0) {
    // On refuse de supprimer une salle utilisée : les soutenances perdraient leur lieu
    blockedMessage.value = `Impossible de supprimer ${room.name} : ${count} soutenance(s) y sont planifiées. Déplacez-les d’abord.`;
    return;
  }
  blockedMessage.value = "";
  selected.value = room;
  isDeleteOpen.value = true;
}
async function saveRoom(values: FormValues) {
  const data = toRoomData(values);
  formError.value = null;
  feedback.value = null;
  isSaving.value = true;
  try {
    if (selected.value) {
      await roomsStore.update(selected.value.id, data);
      feedback.value = {
        tone: "success",
        text: "Salle mise à jour avec succès.",
      };
    } else {
      await roomsStore.create(data);
      feedback.value = { tone: "success", text: "Salle ajoutée avec succès." };
    }
    isFormOpen.value = false; // seulement si tout s'est bien passé
  } catch (e) {
    formError.value = apiMessage(e);
  } finally {
    isSaving.value = false;
  }
}

async function deleteRoom() {
  const current = selected.value;
  if (!current) return;
  try {
    await roomsStore.remove(current.id);
    feedback.value = { tone: "success", text: "salle supprimée avec succès" };
  } catch (e) {
    feedback.value = {
      tone: "error",
      text: getErrorMessage(e, "Suppression impossible."),
    };
  }
  isDeleteOpen.value = false;
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

    <p
      v-if="feedback"
      role="status"
      :class="[
        'rounded-lg border p-4 text-sm',
        FEEDBACK_CLASSES[feedback.tone],
      ]"
    >
      {{ feedback.text }}
    </p>

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

    <BaseAlert v-if="blockedMessage" variant="error">{{
      blockedMessage
    }}</BaseAlert>

    <BaseAlert v-if="error" variant="error">{{ error }}</BaseAlert>
    <p v-if="loading" class="text-sm text-slate-500">Chargement des salles…</p>

    <EmptyState
      v-if="rooms.length === 0"
      message="Aucune salle pour le moment."
    />

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
      :error="formError"
      :loading="isSaving"
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
        selected
          ? `La salle « ${selected.name} » sera supprimée. Cette action est irréversible.`
          : ''
      "
      confirmLabel="Supprimer"
      @confirm="deleteRoom"
    />
  </div>
</template>
