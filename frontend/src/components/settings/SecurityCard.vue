<script setup lang="ts">
import { ref } from 'vue'
import { Mail } from '@lucide/vue'
import { toast } from 'vue-sonner'
import BaseButton from '../common/BaseButton.vue'
import BaseCard from '../common/BaseCard.vue'
import { forgotPassword } from '../../views/auth/api/auth.api'

const props = defineProps<{
  email?: string
}>()

const isSending = ref(false)

async function sendResetLink() {
  if (!props.email) return

  isSending.value = true
  try {
    await forgotPassword(props.email)
    toast.success(`Un lien de réinitialisation a été envoyé à ${props.email}.`)
  } catch {
    toast.error('Envoi impossible. Veuillez réessayer.')
  } finally {
    isSending.value = false
  }
}
</script>

<template>
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
      :disabled="!email"
      @click="sendResetLink"
    >
      <Mail class="h-4 w-4" aria-hidden="true" />
      Envoyer le lien de réinitialisation
    </BaseButton>
  </BaseCard>
</template>