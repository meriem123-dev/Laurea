<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { FileUp, GraduationCap, Pencil, Plus, UserPlus } from '@lucide/vue'
import BaseButton from '../../components/common/BaseButton.vue'
import ConfirmDialog from '../../components/common/ConfirmDialog.vue'
import DetailsModal from '../../components/common/DetailsModal.vue'
import EntityFormModal from '../../components/forms/EntityFormModal.vue'
import PageHeader from '../../components/layout/PageHeader.vue'
import ProfessorCard from '../../components/professors/ProfessorCard.vue'
import { useProfessorsStore } from './stores/professors'
import type { ApiProfessor } from './api/professors.api'
import { ACCOUNT_STATUS_META } from '../../utils/accountStatus'
import { invitationNotice } from '../../utils/accountFields'
import { getErrorMessage } from '../../utils/apiError'
import { availability, displayName } from '../../utils/professor'
import {
  buildProfessorFields,
  professorToFormValues,
  toProfessorData,
} from '../../utils/professorForm'
import type { FormValues } from '../../types/form'
import type { Professor } from '../../types/professor'
import type { ImportError } from '../../types/student'

// chargement des professeurs depuis le back (GET /api/teachers)
const store = useProfessorsStore()
const { items: professors, loading, error } = storeToRefs(store)
onMounted(() => store.fetchAll())

// Professeur ciblé par la modification, le profil ou la suppression (null = création)
const selected = ref<ApiProfessor | null>(null)
const isFormOpen = ref(false)
const isProfileOpen = ref(false)
const isDeleteOpen = ref(false)

// Retours à l'utilisateur
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

// Import Excel / CSV
const fileInput = ref<HTMLInputElement | null>(null)
const isImporting = ref(false)
const importErrors = ref<ImportError[]>([])

const isEdit = computed(() => selected.value !== null)

// En modification, le professeur ne doit pas entrer en conflit avec sa propre adresse
const otherEmails = computed(() =>
  professors.value
    .filter((professor) => professor.id !== selected.value?.id)
    .map((professor) => professor.email),
)

const formFields = computed(() => buildProfessorFields(otherEmails.value))

const initialValues = computed(() =>
  selected.value ? professorToFormValues(selected.value) : undefined,
)

const profileFields = computed(() => {
  const professor = selected.value
  if (!professor) return []
  return [
    { label: 'Adresse e-mail', value: professor.email },
    { label: 'Spécialité', value: professor.specialty },
    {
      label: 'Compte',
      value: ACCOUNT_STATUS_META[professor.accountStatus].label,
    },
    { label: 'Jurys', value: String(professor.juryCount) },
    { label: 'Projets encadrés', value: String(professor.projectCount) },
  ]
})

const profileBadge = computed(() => {
  const professor = selected.value
  if (!professor) return undefined
  const status = availability(professor)
  return { label: 'Disponibilité', text: status.label, tone: status.tone }
})

// Message de suppression : prévient si le professeur est rattaché à des jurys ou des projets
const deleteMessage = computed(() => {
  const professor = selected.value
  if (!professor) return ''
  const links: string[] = []
  if (professor.juryCount > 0) links.push(`${professor.juryCount} jury(s)`)
  if (professor.projectCount > 0) links.push(`${professor.projectCount} projet(s)`)
  const attached = links.length ? ` Il est rattaché à ${links.join(' et ')}.` : ''
  return `Le compte de ${displayName(professor)} sera supprimé.${attached} Cette action est irréversible.`
})

// La carte renvoie un Professor : on retrouve la version complète (avec uuid, prénom, nom…) dans le store
function find(professor: Professor): ApiProfessor | null {
  return professors.value.find((p) => p.id === professor.id) ?? null
}

// ouverture des modales
function openCreate() {
  selected.value = null
  formError.value = null
  isFormOpen.value = true
}

function openProfile(professor: Professor) {
  selected.value = find(professor)
  isProfileOpen.value = true
}

function openEdit(professor: Professor) {
  selected.value = find(professor)
  formError.value = null
  isFormOpen.value = true
}

function editFromProfile() {
  isProfileOpen.value = false
  formError.value = null
  isFormOpen.value = true
}

function openDelete(professor: Professor) {
  selected.value = find(professor)
  isDeleteOpen.value = true
}

// créer ou modifier
async function saveProfessor(values: FormValues) {
  const data = toProfessorData(values)
  const current = selected.value
  formError.value = null
  feedback.value = null
  isSaving.value = true
  try {
    if (current) {
      await store.update(current.id, data)
      feedback.value = { tone: 'success', text: 'Professeur mis à jour.' }
    } else {
      const emailSent = await store.create(data)
      feedback.value = emailSent
        ? {
            tone: 'success',
            text: `Compte créé : une invitation a été envoyée à ${data.email}.`,
          }
        : {
            tone: 'warning',
            text: 'Compte créé, mais l’e-mail d’invitation n’a pas pu être envoyé.',
          }
    }
    isFormOpen.value = false // on ne ferme que si tout s'est bien passé
  } catch (e) {
    formError.value = getErrorMessage(e, 'Enregistrement impossible.')
  } finally {
    isSaving.value = false
  }
}

// suppression
async function deleteProfessor() {
  const current = selected.value
  if (!current) return
  feedback.value = null
  try {
    await store.remove(current.id)
    feedback.value = { tone: 'success', text: 'Professeur supprimé.' }
  } catch (e) {
    feedback.value = {
      tone: 'error',
      text: getErrorMessage(e, 'Suppression impossible.'),
    }
  } finally {
    isDeleteOpen.value = false
  }
}

// importer un fichier
async function onFileChosen(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  feedback.value = null
  importErrors.value = []
  isImporting.value = true
  try {
    const result = await store.importFile(file)
    importErrors.value = result.errors

    const failedMails = result.emailsFailed
      ? ` ${result.emailsFailed} invitation(s) non envoyée(s).`
      : ''

    feedback.value = {
      tone: result.errors.length || result.emailsFailed ? 'warning' : 'success',
      text: `${result.created} professeur(s) importé(s) sur ${result.total}, ${result.errors.length} ligne(s) rejetée(s).${failedMails}`,
    }
  } catch (e) {
    feedback.value = {
      tone: 'error',
      text: getErrorMessage(e, 'Import impossible.'),
    }
  } finally {
    isImporting.value = false
    input.value = '' // permet de re-sélectionner le même fichier
  }
}

// télécharger le modèle Excel
async function downloadTemplate() {
  try {
    const blob = await store.downloadTemplate()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'modele-enseignants.xlsx'
    a.click()
    URL.revokeObjectURL(url)
  } catch (e) {
    feedback.value = {
      tone: 'error',
      text: getErrorMessage(e, 'Téléchargement impossible.'),
    }
  }
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-6xl flex-col gap-6">
    <PageHeader
      eyebrow="Ressources & cohortes"
      title="Gestion des professeurs"
      subtitle="Gérez les enseignants, leurs spécialités et leurs disponibilités."
    >
      <div class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        <input
          ref="fileInput"
          type="file"
          accept=".xlsx,.csv"
          class="hidden"
          @change="onFileChosen"
        />
        <BaseButton
          variant="secondary"
          size="md"
          class="w-full sm:w-auto"
          @click="downloadTemplate"
        >
          Télécharger le modèle
        </BaseButton>
        <BaseButton
          variant="secondary"
          size="md"
          class="w-full sm:w-auto"
          :disabled="isImporting"
          @click="fileInput?.click()"
        >
          <FileUp class="h-4 w-4" aria-hidden="true" />
          {{ isImporting ? 'Import en cours…' : 'Importer' }}
        </BaseButton>
        <BaseButton size="md" class="w-full sm:w-auto" @click="openCreate">
          <Plus class="h-4 w-4" aria-hidden="true" />
          Ajouter un professeur
        </BaseButton>
      </div>
    </PageHeader>

    <p
      v-if="feedback"
      role="status"
      :class="['rounded-lg border p-4 text-sm', FEEDBACK_CLASSES[feedback.tone]]"
    >
      {{ feedback.text }}
    </p>

    <ul
      v-if="importErrors.length"
      class="max-h-60 overflow-y-auto rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
    >
      <li v-for="err in importErrors" :key="err.line">
        <strong>Ligne {{ err.line }}</strong> : {{ err.message }}
      </li>
    </ul>

    <p v-if="loading" class="text-sm text-text-muted">Chargement des professeurs…</p>
    <div
      v-else-if="error"
      role="alert"
      class="flex items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
    >
      <span>{{ error }}</span>
      <BaseButton variant="secondary" size="md" @click="store.fetchAll()">Réessayer</BaseButton>
    </div>

    <p
      v-else-if="professors.length === 0"
      class="rounded-xl border border-dashed border-border-strong bg-card/60 py-16 text-center text-sm text-text-muted"
    >
      Aucun professeur pour le moment.
    </p>

    <ul v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <li
        v-for="(professor, index) in professors"
        :key="professor.id"
        class="min-w-0 motion-safe:animate-fade-up"
        :style="{ animationDelay: `${Math.min(index, 8) * 60}ms` }"
      >
        <ProfessorCard
          :professor="professor"
          @view="openProfile"
          @edit="openEdit"
          @delete="openDelete"
        />
      </li>
    </ul>

    <EntityFormModal
      v-model="isFormOpen"
      :title="isEdit ? 'Modifier le professeur' : 'Ajouter un professeur'"
      :subtitle="
        isEdit
          ? 'Mettez à jour les informations du professeur.'
          : 'Remplissez les informations ci-dessous pour créer un nouveau compte professeur.'
      "
      :icon="isEdit ? Pencil : UserPlus"
      :fields="formFields"
      :initialValues="initialValues"
      :submitLabel="isEdit ? 'Enregistrer' : 'Ajouter le professeur'"
      :notice="isEdit ? undefined : invitationNotice('Le professeur')"
      :footerNote="isEdit ? undefined : 'Les informations peuvent être mises à jour plus tard.'"
      :error="formError"
      :loading="isSaving"
      @submit="saveProfessor"
    />

    <DetailsModal
      v-model="isProfileOpen"
      :title="selected ? displayName(selected) : ''"
      :subtitle="selected?.specialty"
      :icon="GraduationCap"
      :fields="profileFields"
      :badge="profileBadge"
      editable
      @edit="editFromProfile"
    />

    <ConfirmDialog
      v-model="isDeleteOpen"
      title="Supprimer ce professeur ?"
      :message="deleteMessage"
      confirmLabel="Supprimer"
      @confirm="deleteProfessor"
    />
  </div>
</template>