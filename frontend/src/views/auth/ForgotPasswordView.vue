<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowLeft } from '@lucide/vue'
import AuthHeader from '../../components/auth/AuthHeader.vue'
import ForgotPasswordForm from '../../components/auth/ForgotPasswordForm.vue'
import BaseAlert from '../../components/common/BaseAlert.vue'
import AuthLayout from '../../layouts/AuthLayout.vue'

const isLoading = ref(false)
const isSent = ref(false)
const errorMessage = ref('')

async function handleRequest(email: string) {
  isLoading.value = true
  errorMessage.value = ''

  try {
    // TODO backend : appeler l'API de réinitialisation (api/ + service auth)
    // Pour l'instant : simulation, AUCUN e-mail n'est envoyé.
    console.info('Demande de réinitialisation (simulée) pour :', email)
    await new Promise((resolve) => setTimeout(resolve, 600))
    isSent.value = true
  } catch {
    errorMessage.value = 'Envoi impossible. Veuillez réessayer.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <AuthLayout>
    <div class="flex flex-col gap-10">
      <AuthHeader eyebrow="Mot de passe oublié" title="Réinitialisez votre mot de passe" />

      <BaseAlert v-if="isSent" title="Vérifiez votre boîte mail">
        Si un compte existe pour cette adresse, un lien de réinitialisation vient d’être envoyé.
      </BaseAlert>

      <ForgotPasswordForm
        v-else
        :loading="isLoading"
        :error-message="errorMessage"
        @submit="handleRequest"
      />

      <RouterLink
        to="/login"
        class="inline-flex items-center justify-center gap-2 text-xs font-semibold text-primary-600 hover:underline"
      >
        <ArrowLeft class="h-3.5 w-3.5" aria-hidden="true" />
        Retour à la connexion
      </RouterLink>
    </div>
  </AuthLayout>
</template>