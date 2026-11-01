<script setup lang="ts">
import BaseCard from '../../components/common/BaseCard.vue'
import InitialsAvatar from '../../components/common/InitialsAvatar.vue'
import PageHeader from '../../components/layout/PageHeader.vue'
import AppearanceCard from '../../components/settings/AppearanceCard.vue'
import NotificationPreferencesCard from '../../components/settings/NotificationPreferencesCard.vue'
import SecurityCard from '../../components/settings/SecurityCard.vue'
import { ROLE_LABELS } from '../../utils/roles'
import { fullName, initials } from '../../utils/student'
import { useAuthStore } from '../auth/store.js'

const auth = useAuthStore()

const notifyDescriptions = {
  defense: 'Planification, modification et conflits de soutenances.',
  project: 'Dépôt, validation et changements de statut des projets.',
  jury: 'Jurys incomplets et affectations de membres.',
  result: 'Notes reçues, résultats à valider ou à publier.',
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-3xl flex-col gap-6">
    <PageHeader
      eyebrow="Notifications et réglages"
      title="Paramètres"
      subtitle="Gérez votre compte, l’apparence et vos notifications."
    />

    <BaseCard v-if="auth.user" title="Profil" subtitle="Informations de votre compte">
      <div class="flex items-center gap-4">
        <InitialsAvatar :initials="initials(auth.user)" size="lg" />
        <div class="min-w-0">
          <p class="truncate font-display text-xl text-ink">{{ fullName(auth.user) }}</p>
          <p class="truncate text-sm text-text-secondary">{{ auth.user.email }}</p>
        </div>
      </div>

      <dl class="mt-5 grid grid-cols-1 gap-5 border-t border-border pt-5 sm:grid-cols-2">
        <div class="min-w-0">
          <dt class="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-text-secondary">
            Rôle
          </dt>
          <dd class="mt-1 text-sm text-ink">{{ ROLE_LABELS[auth.user.role] }}</dd>
        </div>
        <div class="min-w-0">
          <dt class="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-text-secondary">
            Adresse e-mail
          </dt>
          <dd class="mt-1 break-words text-sm text-ink">{{ auth.user.email }}</dd>
        </div>
      </dl>
    </BaseCard>

    <AppearanceCard />
    <NotificationPreferencesCard :descriptions="notifyDescriptions" />
    <SecurityCard :email="auth.user?.email" />
  </div>
</template>