<script setup lang="ts">
import { ref } from 'vue'
import BaseAlert from '../common/BaseAlert.vue'
import BaseButton from '../common/BaseButton.vue'
import BaseInput from '../forms/BaseInput.vue'

interface Props {
  loading?: boolean
  errorMessage?: string
}

withDefaults(defineProps<Props>(), {
  loading: false,
  errorMessage: '',
})

const emit = defineEmits<{
  submit: [email: string]
}>()

const email = ref('')

function handleSubmit() {
  emit('submit', email.value.trim())
}
</script>

<template>
  <form class="flex flex-col gap-6" @submit.prevent="handleSubmit">
    <p class="text-center text-sm leading-relaxed text-slate-500">
      Saisissez l’adresse e-mail associée à votre compte. Nous vous enverrons un lien pour
      choisir un nouveau mot de passe.
    </p>

    <BaseInput
      id="forgot-email"
      v-model="email"
      label="Adresse e-mail"
      type="email"
      autocomplete="email"
      placeholder="nom@univ-demo.fr"
      required
    />

    <BaseAlert v-if="errorMessage" variant="error">
      {{ errorMessage }}
    </BaseAlert>

    <BaseButton type="submit" block :loading="loading">Envoyer le lien</BaseButton>
  </form>
</template>