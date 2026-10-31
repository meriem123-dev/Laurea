<script setup lang="ts">
import { computed, ref } from 'vue'
import { GraduationCap, Pencil, Plus, UserPlus } from '@lucide/vue'
import BaseButton from '../../components/common/BaseButton.vue'
import ConfirmDialog from '../../components/common/ConfirmDialog.vue'
import DetailsModal from '../../components/common/DetailsModal.vue'
import EntityFormModal from '../../components/forms/EntityFormModal.vue'
import PageHeader from '../../components/layout/PageHeader.vue'
import ProfessorCard from '../../components/professors/ProfessorCard.vue'
import { professors as professorsMock } from '../../mocks/professors'
import { invitationNotice } from '../../utils/accountFields'
import { availability, displayName } from '../../utils/professor'
import {
  buildProfessorFields,
  professorToFormValues,
  toProfessorData,
} from '../../utils/professorForm'
import type { FormValues } from '../../types/form'
import type { Professor } from '../../types/professor'

// TODO backend : charger la liste via api/ + store (avec états chargement / erreur)
const professors = ref<Professor[]>(professorsMock)

// Professeur ciblé par la modification, le profil ou la suppression (null = création)
const selected = ref<Professor | null>(null)
const isFormOpen = ref(false)
const isProfileOpen = ref(false)
const isDeleteOpen = ref(false)

const isEdit = computed(() => selected.value !== null)

// En modification, le professeur ne doit pas entrer en conflit avec sa propre adresse
const otherEmails = computed(() =>
  professors.value
    .filter((professor) => professor.id !== selected.value?.id)
    .map((professor) => professor.email),
)

const formFields = computed(() => buildProfessorFields(otherEmails.value, !isEdit.value))

const initialValues = computed(() =>
  selected.value ? professorToFormValues(selected.value) : undefined,
)

const profileFields = computed(() => {
  const professor = selected.value
  if (!professor) return []
  return [
    { label: 'Adresse e-mail', value: professor.email },
    { label: 'Spécialité', value: professor.specialty },
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

function openCreate() {
  selected.value = null
  isFormOpen.value = true
}

function openProfile(professor: Professor) {
  selected.value = professor
  isProfileOpen.value = true
}

function openEdit(professor: Professor) {
  selected.value = professor
  isFormOpen.value = true
}

function editFromProfile() {
  isProfileOpen.value = false
  isFormOpen.value = true
}

function openDelete(professor: Professor) {
  selected.value = professor
  isDeleteOpen.value = true
}

function saveProfessor(values: FormValues) {
  // TODO backend : POST /professors (avec le mot de passe temporaire : c'est le backend qui envoie
  // l'e-mail d'invitation et impose le changement de mot de passe à la première connexion)
  // ou PUT /professors/:id. Ici : modification locale, non enregistrée.
  // Le mot de passe n'est volontairement pas conservé.
  const data = toProfessorData(values)
  const current = selected.value

  if (current) {
    // Le titre (Pr./Dr.), la disponibilité et les compteurs sont conservés tels quels
    professors.value = professors.value.map((professor) =>
      professor.id === current.id
        ? { ...professor, name: data.name, email: data.email, specialty: data.specialty }
        : professor,
    )
  } else {
    const nextId = Math.max(0, ...professors.value.map((professor) => professor.id)) + 1
    professors.value = [
      {
        id: nextId,
        name: data.name,
        email: data.email,
        specialty: data.specialty,
        juryCount: 0,
        projectCount: 0,
      },
      ...professors.value,
    ]
  }
  isFormOpen.value = false
}

function deleteProfessor() {
  // TODO backend : DELETE /professors/:id (le backend doit gérer les jurys et projets rattachés).
  // Ici : suppression locale, non enregistrée.
  const current = selected.value
  if (!current) return
  professors.value = professors.value.filter((professor) => professor.id !== current.id)
  isDeleteOpen.value = false
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-6xl flex-col gap-6">
    <PageHeader
      eyebrow="Ressources & cohortes"
      title="Gestion des professeurs"
      subtitle="Gérez les enseignants, leurs spécialités et leurs disponibilités."
    >
      <BaseButton size="md" class="w-full sm:w-auto" @click="openCreate">
        <Plus class="h-4 w-4" aria-hidden="true" />
        Ajouter un professeur
      </BaseButton>
    </PageHeader>

    <p
      v-if="professors.length === 0"
      class="rounded-xl border border-dashed border-border-strong bg-white/60 py-16 text-center text-sm text-text-muted"
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