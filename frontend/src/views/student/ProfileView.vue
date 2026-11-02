<script setup lang="ts">
import { computed } from 'vue'
import BaseCard from '../../components/common/BaseCard.vue'
import InitialsAvatar from '../../components/common/InitialsAvatar.vue'
import PageHeader from '../../components/layout/PageHeader.vue'
import AppearanceCard from '../../components/settings/AppearanceCard.vue'
import NotificationPreferencesCard from '../../components/settings/NotificationPreferencesCard.vue'
import SecurityCard from '../../components/settings/SecurityCard.vue'
import { CURRENT_STUDENT_ID } from '../../mocks/currentStudent'
import { students } from '../../mocks/students'
import { ROLE_LABELS } from '../../utils/roles'
import { fullName, initials } from '../../utils/student'
import { useAuthStore } from '../auth/store.js'

const CURSUS_LABELS = { MASTER: 'Master', INGENIEUR: 'Ingénieur' } as const

const auth = useAuthStore()

// TODO backend : GET /students/me (matricule, spécialité, groupe). Ici : données fictives.
const student = students.find((item) => item.id === CURRENT_STUDENT_ID)

// Le compte connecté prime ; sans compte (mode dev), on retombe sur la fiche fictive
const name = computed(() => {
  if (auth.user) return fullName(auth.user)
  return student ? fullName(student) : ''
})
const avatar = computed(() => {
  if (auth.user) return initials(auth.user)
  return student ? initials(student) : ''
})
const email = computed(() => auth.user?.email ?? student?.email ?? '')

const notifyDescriptions = {
  defense: 'Planification et modification de votre soutenance.',
  project: 'Validation de votre sujet et retours de votre encadrant.',
  jury: 'Composition de votre jury.',
  result: 'Évaluations reçues et publication de vos résultats.',
}

const labelClass = 'text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-text-secondary'
</script>

<template>
  <div class="mx-auto flex w-full max-w-3xl flex-col gap-6">
    <PageHeader
      eyebrow="Espace étudiant"
      title="Mon profil"
      subtitle="Gérez votre compte, l’apparence et vos notifications."
    />

    <BaseCard v-if="name" title="Profil" subtitle="Informations de votre compte">
      <div class="flex items-center gap-4">
        <InitialsAvatar :initials="avatar" size="lg" />
        <div class="min-w-0">
          <p class="truncate font-display text-xl text-ink">{{ name }}</p>
          <p class="truncate text-sm text-text-secondary">{{ email }}</p>
        </div>
      </div>

      <dl class="mt-5 grid grid-cols-1 gap-5 border-t border-border pt-5 sm:grid-cols-2">
        <div class="min-w-0">
          <dt :class="labelClass">Rôle</dt>
          <dd class="mt-1 text-sm text-ink">{{ ROLE_LABELS.STUDENT }}</dd>
        </div>
        <div class="min-w-0">
          <dt :class="labelClass">Adresse e-mail</dt>
          <dd class="mt-1 break-words text-sm text-ink">{{ email }}</dd>
        </div>

        <template v-if="student">
          <div class="min-w-0">
            <dt :class="labelClass">Matricule</dt>
            <dd class="mt-1 text-sm tabular-nums text-ink">{{ student.matricule }}</dd>
          </div>
          <div class="min-w-0">
            <dt :class="labelClass">Cursus</dt>
            <dd class="mt-1 text-sm text-ink">{{ CURSUS_LABELS[student.cursus] }}</dd>
          </div>
          <div class="min-w-0">
            <dt :class="labelClass">Spécialité</dt>
            <dd class="mt-1 text-sm text-ink">{{ student.specialty }}</dd>
          </div>
          <div class="min-w-0">
            <dt :class="labelClass">Groupe</dt>
            <dd class="mt-1 text-sm text-ink">{{ student.group || '—' }}</dd>
          </div>
        </template>
      </dl>
    </BaseCard>

    <AppearanceCard />
    <NotificationPreferencesCard :descriptions="notifyDescriptions" />
    <SecurityCard :email="email" />
  </div>
</template>