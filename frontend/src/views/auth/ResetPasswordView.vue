<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { toast } from 'vue-sonner'
import AuthHeader from '../../components/auth/AuthHeader.vue'
import AuthLayout from '../../layouts/AuthLayout.vue'
import BaseAlert from '../../components/common/BaseAlert.vue'
import BaseButton from '../../components/common/BaseButton.vue'
import BaseInput from '../../components/forms/BaseInput.vue'
import { resetPassword } from '../auth/api/auth.api'

const route = useRoute()
const router = useRouter()

const token = typeof route.query.token === 'string' ? route.query.token : ''
const password = ref('')
const confirm = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

async function handleSubmit() {
  errorMessage.value = ''

  if (!token) {
    errorMessage.value = 'Lien invalide. Refaites une demande de réinitialisation.'
    return
  }
  if (password.value.length < 8) {
    errorMessage.value = 'Le mot de passe doit contenir au moins 8 caractères.'
    return
  }
  if (password.value !== confirm.value) {
    errorMessage.value = 'Les mots de passe ne correspondent pas.'
    return
  }

  isLoading.value = true
  try {
    await resetPassword(token, password.value)
    toast.success('Mot de passe modifié. Vous pouvez vous connecter.')
    await router.push('/login')
  } catch (e) {
    errorMessage.value =
      axios.isAxiosError(e) && e.response?.status === 400
        ? 'Lien invalide ou expiré. Refaites une demande.'
        : 'Une erreur est survenue. Veuillez réessayer.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <AuthLayout>
    <div class="flex flex-col gap-10">
      <AuthHeader eyebrow="Sécurité" title="Choisissez un nouveau mot de passe" />

      <form class="flex flex-col gap-7" @submit.prevent="handleSubmit">
        <BaseInput
          id="password"
          v-model="password"
          label="Nouveau mot de passe"
          type="password"
          autocomplete="new-password"
          required
        />
        <BaseInput
          id="confirm"
          v-model="confirm"
          label="Confirmer le mot de passe"
          type="password"
          autocomplete="new-password"
          required
        />

        <BaseAlert v-if="errorMessage" variant="error">
          {{ errorMessage }}
        </BaseAlert>

        <BaseButton type="submit" block :loading="isLoading">
          Modifier le mot de passe
        </BaseButton>
      </form>
    </div>
  </AuthLayout>
</template>