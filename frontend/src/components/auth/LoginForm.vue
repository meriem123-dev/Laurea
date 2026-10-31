<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowRight } from '@lucide/vue'
import BaseAlert from '../common/BaseAlert.vue'
import BaseButton from '../common/BaseButton.vue'
import SegmentedControl from '../common/SegmentedControl.vue'
import BaseCheckbox from '../forms/BaseCheckbox.vue'
import BaseInput from '../forms/BaseInput.vue'
import { demoEmails } from '../../mocks/demoAccounts'
import { ROLE_OPTIONS } from '../../utils/roles'
import type { LoginPayload, UserRole } from '../../types/auth'

interface Props {
  loading?: boolean
  errorMessage?: string
}

withDefaults(defineProps<Props>(), {
  loading: false,
  errorMessage: '',
})

const emit = defineEmits<{
  submit: [payload: LoginPayload]
}>()

const role = ref<UserRole>('admin')
const email = ref(demoEmails[role.value])
const password = ref('')
const remember = ref(true)

// Prototype : l'email se préremplit selon l'onglet choisi
watch(role, (newRole) => {
  email.value = demoEmails[newRole]
})

function handleSubmit() {
  emit('submit', {
    email: email.value.trim(),
    password: password.value,
    remember: remember.value,
    role: role.value,
  })
}
</script>

<template>
  <form class="flex flex-col gap-7" @submit.prevent="handleSubmit">
    <SegmentedControl v-model="role" :options="ROLE_OPTIONS" aria-label="Choix de l'espace" />

    <BaseInput
      id="email"
      v-model="email"
      label="Adresse e-mail"
      type="email"
      autocomplete="email"
      required
    />

    <BaseInput
      id="password"
      v-model="password"
      label="Mot de passe"
      type="password"
      autocomplete="current-password"
      required
    />

    <div class="flex flex-wrap items-center justify-between gap-3">
      <BaseCheckbox id="remember" v-model="remember" label="Se souvenir de moi" />
      <RouterLink
        to="/forgot-password"
        class="text-xs font-semibold text-ink underline decoration-border-strong underline-offset-4 transition hover:decoration-ink"
      >
        Mot de passe oublié ?
      </RouterLink>
    </div>

    <BaseAlert v-if="errorMessage" variant="error">
      {{ errorMessage }}
    </BaseAlert>

    <BaseButton type="submit" block :loading="loading">
      Se connecter
      <ArrowRight
        class="h-4 w-4 transition-transform group-hover:translate-x-1"
        aria-hidden="true"
      />
    </BaseButton>
  </form>
</template>