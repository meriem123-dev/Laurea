<script setup lang="ts">
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import axios from "axios";
import AuthHeader from "../../components/auth/AuthHeader.vue";
import LoginForm from "../../components/auth/LoginForm.vue";
import AuthLayout from "../../layouts/AuthLayout.vue";
import { ROLE_HOME_PATH } from "../../utils/roles";
import type { LoginPayload } from "../../types/auth";
import { useAuthStore } from "./store.js";
import { toast } from "vue-sonner";

const router = useRouter();
const auth = useAuthStore();
const isLoading = ref(false);
const errorMessage = ref("");
const route = useRoute();
const sessionExpired = route.query.expired === "1";

async function handleLogin(payload: LoginPayload) {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const user = await auth.login(
      payload.email,
      payload.password,
      payload.role,
    );
    toast.success(`Bienvenue ${user.firstName} !`);
    await router.push(ROLE_HOME_PATH[user.role]);
  } catch (e) {
    errorMessage.value =
      axios.isAxiosError(e) && e.response?.status === 401
        ? "Email ou mot de passe incorrect."
        : axios.isAxiosError(e) && e.response?.status === 429
          ? "Trop de tentatives. Réessaie dans 15 minutes."
          : "Connexion impossible. Veuillez réessayer.";
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <AuthLayout>
    <p v-if="sessionExpired" class="text-sm text-amber-950">
      Ta session a expiré, reconnecte-toi.
    </p>
    <div class="flex flex-col gap-10">
      <AuthHeader eyebrow="Bienvenue" title="Connectez-vous à votre espace" />

      <LoginForm
        :loading="isLoading"
        :error-message="errorMessage"
        @submit="handleLogin"
      />
    </div>
  </AuthLayout>
</template>
