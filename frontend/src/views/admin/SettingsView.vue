<script setup lang="ts">
import { ref } from 'vue'
import { Mail } from '@lucide/vue'
import { toast } from 'vue-sonner'
import BaseButton from '../../components/common/BaseButton.vue'
import BaseCard from '../../components/common/BaseCard.vue'
import InitialsAvatar from '../../components/common/InitialsAvatar.vue'
import BaseSwitch from '../../components/forms/BaseSwitch.vue'
import PageHeader from '../../components/layout/PageHeader.vue'
import { useSettings } from '../../composables/useSettings'
import { useTheme } from '../../composables/useTheme'
import type { NotificationType } from '../../types/notification'
import { NOTIFICATION_META } from '../../utils/notification'
import { ROLE_LABELS } from '../../utils/roles'
import { fullName, initials } from '../../utils/student'
import { forgotPassword } from '../auth/api/auth.api'
import { useAuthStore } from '../auth/store.js'

const auth = useAuthStore()
const { settings } = useSettings()
const { isDark, setTheme } = useTheme()

// Les notifications « système » restent toujours actives
const notifyOptions: { key: Exclude<NotificationType, 'system'>; description: string }[] = [
  { key: 'defense', description: 'Planification, modification et conflits de soutenances.' },
  { key: 'project', description: 'Dépôt, validation et changements de statut des projets.' },
  { key: 'jury', description: 'Jurys incomplets et affectations de membres.' },
  { key: 'result', description: 'Notes reçues, résultats à valider ou à publier.' },
]

const isSending = ref(false)

async function sendResetLink() {
  const email = auth.user?.email
  if (!email) return

  isSending.value = true
  try {
    await forgotPassword(email)
    toast.success(`Un lien de réinitialisation a été envoyé à ${email}.`)
  } catch {
    toast.error('Envoi impossible. Veuillez réessayer.')
  } finally {
    isSending.value = false
  }
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

    <BaseCard title="Apparence" subtitle="Personnalisez l’affichage de l’interface">
      <BaseSwitch
        id="setting-dark"
        label="Mode sombre"
        description="Réduit l’éclat de l’interface en environnement peu éclairé."
        :modelValue="isDark"
        @update:modelValue="setTheme($event ? 'dark' : 'light')"
      />
    </BaseCard>

    <BaseCard title="Notifications" subtitle="Choisissez ce que vous souhaitez recevoir">
      <!-- TODO backend : enregistrer ces préférences côté serveur (elles sont ici stockées dans le navigateur) -->
      <div class="-mt-4 divide-y divide-border">
        <BaseSwitch
          id="setting-email"
          v-model="settings.emailNotifications"
          label="Recevoir aussi par e-mail"
          description="Un message est envoyé à votre adresse pour les notifications importantes."
        />
        <BaseSwitch
          v-for="option in notifyOptions"
          :id="`setting-notify-${option.key}`"
          :key="option.key"
          v-model="settings.notifyTypes[option.key]"
          :label="NOTIFICATION_META[option.key].label"
          :description="option.description"
        />
      </div>
    </BaseCard>

    <BaseCard title="Sécurité" subtitle="Protégez l’accès à votre compte">
      <p class="text-sm leading-relaxed text-text-body">
        Pour changer votre mot de passe, nous envoyons un lien sécurisé, valable 30 minutes, à
        l’adresse e-mail de votre compte.
      </p>
      <BaseButton
        variant="secondary"
        size="md"
        class="mt-4 w-full sm:w-auto"
        :loading="isSending"
        @click="sendResetLink"
      >
        <Mail class="h-4 w-4" aria-hidden="true" />
        Envoyer le lien de réinitialisation
      </BaseButton>
    </BaseCard>
  </div>
</template>