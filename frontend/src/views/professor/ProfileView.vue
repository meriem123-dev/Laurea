<script setup lang="ts">
import { computed } from 'vue'
import BaseBadge from '../../components/common/BaseBadge.vue'
import BaseCard from '../../components/common/BaseCard.vue'
import InitialsAvatar from '../../components/common/InitialsAvatar.vue'
import PageHeader from '../../components/layout/PageHeader.vue'
import AppearanceCard from '../../components/settings/AppearanceCard.vue'
import NotificationPreferencesCard from '../../components/settings/NotificationPreferencesCard.vue'
import SecurityCard from '../../components/settings/SecurityCard.vue'
import { CURRENT_PROFESSOR_ID } from '../../mocks/currentProfessor'
import { professors } from '../../mocks/professors'
import {
  availability,
  displayName,
  initials as professorInitials,
} from '../../utils/professor'
import { ROLE_LABELS } from '../../utils/roles'
import { fullName, initials } from '../../utils/student'
import { useAuthStore } from '../auth/store.js'

const auth = useAuthStore()

// TODO backend : GET /professors/me (spécialité, compteurs, disponibilité). Ici : données fictives.
const professor = professors.find((item) => item.id === CURRENT_PROFESSOR_ID)

// Le compte connecté prime ; sans compte (mode dev), on retombe sur la fiche fictive
const name = computed(() => {
  if (auth.user) return fullName(auth.user)
  return professor ? displayName(professor) : ''
})
const avatar = computed(() => {
  if (auth.user) return initials(auth.user)
  return professor ? professorInitials(professor) : ''
})
const email = computed(() => auth.user?.email ?? professor?.email ?? '')
const status = computed(() => (professor ? availability(professor) : null))

const notifyDescriptions = {
  defense: 'Planification et modification de vos soutenances.',
  project: 'Nouveaux dépôts et changements de statut de vos projets.',
  jury: 'Affectations à un jury.',
  result: 'Évaluations à compléter et résultats publiés.',
}

const labelClass = 'text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-text-secondary'
</script>

<template>
  <div class="mx-auto flex w-full max-w-3xl flex-col gap-6">
    <PageHeader
      eyebrow="Espace enseignant"
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
          <dd class="mt-1 text-sm text-ink">{{ ROLE_LABELS.TEACHER }}</dd>
        </div>
        <div class="min-w-0">
          <dt :class="labelClass">Adresse e-mail</dt>
          <dd class="mt-1 break-words text-sm text-ink">{{ email }}</dd>
        </div>

        <template v-if="professor">
          <div class="min-w-0">
            <dt :class="labelClass">Spécialité</dt>
            <dd class="mt-1 text-sm text-ink">{{ professor.specialty }}</dd>
          </div>
          <div v-if="status" class="min-w-0">
            <dt :class="labelClass">Disponibilité</dt>
            <dd class="mt-1.5">
              <BaseBadge :tone="status.tone">{{ status.label }}</BaseBadge>
            </dd>
          </div>
          <div class="min-w-0">
            <dt :class="labelClass">Jurys</dt>
            <dd class="mt-1 text-sm tabular-nums text-ink">{{ professor.juryCount }}</dd>
          </div>
          <div class="min-w-0">
            <dt :class="labelClass">Projets encadrés</dt>
            <dd class="mt-1 text-sm tabular-nums text-ink">{{ professor.projectCount }}</dd>
          </div>
        </template>
      </dl>
    </BaseCard>

    <AppearanceCard />
    <NotificationPreferencesCard :descriptions="notifyDescriptions" />
    <SecurityCard :email="email" />
  </div>
</template>