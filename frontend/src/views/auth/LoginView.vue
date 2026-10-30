<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthHeader from '../../components/auth/AuthHeader.vue'
import LoginForm from '../../components/auth/LoginForm.vue'
import BaseAlert from '../../components/common/BaseAlert.vue'
import AuthLayout from '../../layouts/AuthLayout.vue'
import { ROLE_HOME_PATH } from '../../utils/roles'
import type { LoginPayload } from '../../types/auth'

const router = useRouter()
const isLoading = ref(false)
const errorMessage = ref('')

async function handleLogin(payload: LoginPayload) {
  isLoading.value = true
  errorMessage.value = ''

  try {
    // TODO backend : appeler l'API d'authentification (api/ + store auth)
    // Pour l'instant : simulation, AUCUNE vérification réelle.
    await new Promise((resolve) => setTimeout(resolve, 600))
    await router.push(ROLE_HOME_PATH[payload.role])
  } catch {
    errorMessage.value = 'Connexion impossible. Veuillez réessayer.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <AuthLayout>
    <div class="flex flex-col gap-10">
      <AuthHeader eyebrow="Bienvenue" title="Connectez-vous à votre espace" />

      <LoginForm :loading="isLoading" :error-message="errorMessage" @submit="handleLogin" />

      <BaseAlert title="Compte de démonstration">
        Les identifiants sont préremplis pour ce prototype.
      </BaseAlert>
    </div>
  </AuthLayout>
</template>