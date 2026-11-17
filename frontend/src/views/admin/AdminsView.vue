<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { Pencil, Plus, UserPlus } from '@lucide/vue'
import BaseButton from '../../components/common/BaseButton.vue'
import ConfirmDialog from '../../components/common/ConfirmDialog.vue'
import EntityFormModal from '../../components/forms/EntityFormModal.vue'
import PageHeader from '../../components/layout/PageHeader.vue'
import AdminsTable from '../../components/admins/AdminsTable.vue'
import { useAdminsStore } from './stores/admins'
import { useAuthStore } from '../auth/store.js'
import { getErrorMessage } from '../../utils/apiError'
import { adminToFormValues, buildAdminFields, toAdminData } from '../../utils/adminForm'
import type { FormValues } from '../../types/form'
import type { Admin } from '../../types/admin'

const store = useAdminsStore()
const { items: admins, loading, error } = storeToRefs(store)
const auth = useAuthStore()
onMounted(() => store.fetchAll())

// Seul l'admin système voit les actions (le back refuse de toute façon les autres : 403)
const canManage = computed(() =>
  admins.value.some((admin) => admin.id === auth.user?.id && admin.isSystemAdmin),
)

// Admin ciblé par la modification ou la suppression (null = création)
const selected = ref<Admin | null>(null)
const isFormOpen = ref(false)
const isDeleteOpen = ref(false)

const isSaving = ref(false)
const formError = ref<string | null>(null)
const feedback = ref<{
  tone: 'success' | 'warning' | 'error'
  text: string
} | null>(null)

const FEEDBACK_CLASSES = {
  success: 'border-green-200 bg-green-50 text-green-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  error: 'border-red-200 bg-red-50 text-red-800',
} as const

const isEdit = computed(() => selected.value !== null)

// En modification, l'admin ne doit pas entrer en conflit avec sa propre adresse
const otherEmails = computed(() =>
  admins.value.filter((admin) => admin.id !== selected.value?.id).map((admin) => admin.email),
)
const formFields = computed(() => buildAdminFields(otherEmails.value))
const initialValues = computed(() =>
  selected.value ? adminToFormValues(selected.value) : undefined,
)

const deleteMessage = computed(() => {
  const admin = selected.value
  if (!admin) return ''
  return `Le compte de ${admin.firstName} ${admin.lastName} (${admin.email}) sera supprimé et n’aura plus accès à l’administration. Cette action est irréversible.`
})

function openCreate() {
  selected.value = null
  formError.value = null
  isFormOpen.value = true
}

function openEdit(admin: Admin) {
  selected.value = admin
  formError.value = null
  isFormOpen.value = true
}

function openDelete(admin: Admin) {
  selected.value = admin
  isDeleteOpen.value = true
}

async function saveAdmin(values: FormValues) {
  const data = toAdminData(values)
  const current = selected.value
  formError.value = null
  feedback.value = null
  isSaving.value = true
  try {
    if (current) {
      await store.update(current.id, data)
      feedback.value = { tone: 'success', text: 'Administrateur mis à jour.' }
    } else {
      const emailSent = await store.create(data)
      feedback.value = emailSent
        ? { tone: 'success', text: `Compte créé : une invitation a été envoyée à ${data.email}.` }
        : { tone: 'warning', text: 'Compte créé, mais l’e-mail d’invitation n’a pas pu être envoyé.' }
    }
    isFormOpen.value = false // on ne ferme que si tout s'est bien passé
  } catch (e) {
    formError.value = getErrorMessage(e, 'Enregistrement impossible.')
  } finally {
    isSaving.value = false
  }
}

async function deleteAdmin() {
  const current = selected.value
  if (!current) return
  feedback.value = null
  try {
    await store.remove(current.id)
    feedback.value = { tone: 'success', text: 'Administrateur supprimé.' }
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
      eyebrow="Notifications et réglages"
      title="Administrateurs"
      subtitle="Gérez les comptes ayant accès à l’espace d’administration."
    >
      <BaseButton v-if="canManage" size="md" class="w-full sm:w-auto" @click="openCreate">
        <Plus class="h-4 w-4" aria-hidden="true" />
        Ajouter un administrateur
      </BaseButton>
    </PageHeader>

    <p
      v-if="!loading && !error && !canManage"
      class="rounded-lg border border-border bg-card/60 p-4 text-sm text-text-secondary"
    >
      Seul l’administrateur système peut ajouter, modifier ou supprimer des administrateurs.
    </p>

    <p
      v-if="feedback"
      role="status"
      :class="['rounded-lg border p-4 text-sm', FEEDBACK_CLASSES[feedback.tone]]"
    >
      {{ feedback.text }}
    </p>

    <p v-if="loading" class="text-sm text-text-muted">Chargement des administrateurs…</p>
    <div
      v-else-if="error"
      role="alert"
      class="flex items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
    >
      <span>{{ error }}</span>
      <BaseButton variant="secondary" size="md" @click="store.fetchAll()">Réessayer</BaseButton>
    </div>

    <AdminsTable
      v-else
      :admins="admins"
      :currentUserId="auth.user?.id"
      :canManage="canManage"
      @edit="openEdit"
      @delete="openDelete"
    />

    <EntityFormModal
      v-model="isFormOpen"
      :title="isEdit ? 'Modifier l’administrateur' : 'Ajouter un administrateur'"
      :subtitle="
        isEdit
          ? 'Mettez à jour les informations de l’administrateur.'
          : 'Ce compte aura accès à toute l’administration de la plateforme.'
      "
      :icon="isEdit ? Pencil : UserPlus"
      :fields="formFields"
      :initialValues="initialValues"
      :submitLabel="isEdit ? 'Enregistrer' : 'Créer le compte'"
      :notice="
        isEdit
          ? undefined
          : 'Le nouvel administrateur recevra un e-mail pour activer son compte et choisir son mot de passe.'
      "
      :error="formError"
      :loading="isSaving"
      @submit="saveAdmin"
    />

    <ConfirmDialog
      v-model="isDeleteOpen"
      title="Supprimer cet administrateur ?"
      :message="deleteMessage"
      confirmLabel="Supprimer"
      @confirm="deleteAdmin"
    />
  </div>
</template>