import { defineStore } from "pinia";
import { computed, ref } from "vue";
import * as authApi from "./api/auth.api";
import type { AuthUser } from "./api/auth.api";
import type { UserRole } from "../../types/auth";

// pour état global de l'auth
function loadUser(): AuthUser | null {
  try {
    return JSON.parse(localStorage.getItem("user") ?? "null");
  } catch {
    return null;
  }
}

//verifie si token expiré
function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const { exp } = JSON.parse(atob(base64));
    return exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

//auth état global
export const useAuthStore = defineStore("auth", () => {
  // nettoie au démarrage si le token est mort
  if (isTokenExpired(localStorage.getItem("token"))) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  const token = ref<string | null>(localStorage.getItem("token"));
  const user = ref<AuthUser | null>(loadUser());

  function isSessionValid(): boolean {
    return !!token.value && !isTokenExpired(token.value);
  }

  function setSession(accessToken: string, authUser: AuthUser) {
    token.value = accessToken;
    user.value = authUser;
    localStorage.setItem("token", accessToken);
    localStorage.setItem("user", JSON.stringify(authUser));
  }

  async function login(email: string, password: string, role: UserRole) {
    const res = await authApi.login(email, password, role);
    setSession(res.accessToken, res.user);
    return res.user;
  }

  async function resetPassword(resetToken: string, password: string) {
    const res = await authApi.resetPassword(resetToken, password);
    setSession(res.accessToken, res.user);
    return res.user;
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  return {
    token,
    user,
    login,
    resetPassword,
    setSession,
    logout,
    isSessionValid,
  };
});
