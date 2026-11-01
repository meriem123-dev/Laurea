import { createRouter, createWebHistory } from "vue-router";
import LoginView from "../views/auth/LoginView.vue";
import AppLayout from "../layouts/AppLayout.vue";
import { ROLE_HOME_PATH } from "../utils/roles";
import type { UserRole } from "../types/auth";
import { useAuthStore } from "../views/auth/store.js";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      redirect: "/login",
    },
    {
      path: "/login",
      name: "login",
      component: LoginView,
    },
    {
      path: "/forgot-password",
      name: "forgot-password",
      component: () => import("../views/auth/ForgotPasswordView.vue"),
    },
    {
      path: "/reset-password",
      name: "reset-password",
      component: () => import("../views/auth/ResetPasswordView.vue"),
    },
    {
      path: "/admin",
      component: AppLayout,
      props: { role: "ADMIN_STAFF" },
      meta: { requiresAuth: true, roles: ["ADMIN_STAFF"] },
      children: [
        { path: "", redirect: "/admin/dashboard" },
        {
          path: "dashboard",
          name: "admin-dashboard",
          component: () => import("../views/admin/DashboardView.vue"),
          meta: { title: "Tableau de bord" },
        },
        {
          path: "students",
          name: "admin-students",
          component: () => import("../views/admin/StudentsView.vue"),
          meta: { title: "Étudiants" },
        },
        {
          path: "professors",
          name: "admin-professors",
          component: () => import("../views/admin/ProfessorsView.vue"),
          meta: { title: "Professeurs" },
        },
        {
          path: "projects",
          name: "admin-projects",
          component: () => import("../views/admin/ProjectsView.vue"),
          meta: { title: "Projets PFE" },
        },
        {
          path: "defenses",
          name: "admin-defenses",
          component: () => import("../views/admin/DefensesView.vue"),
          meta: { title: "Soutenances" },
        },
        {
          path: "juries",
          name: "admin-juries",
          component: () => import("../views/admin/JuriesView.vue"),
          meta: { title: "Jurys" },
        },
        {
          path: "rooms",
          name: "admin-rooms",
          component: () => import("../views/admin/RoomsView.vue"),
          meta: { title: "Salles" },
        },
        {
          path: "results",
          name: "admin-results",
          component: () => import("../views/admin/ResultsView.vue"),
          meta: { title: "Notes et résultats" },
        },
        {
          path: "notifications",
          name: "admin-notifications",
          component: () => import("../views/admin/NotificationsView.vue"),
          meta: { title: "Notifications" },
        },
        {
          path: "settings",
          name: "admin-settings",
          component: () => import("../views/admin/SettingsView.vue"),
          meta: { title: "Paramètres" },
        },
      ],
    },
    {
      path: "/professor",
      component: AppLayout,
      props: { role: "TEACHER" },
      meta: { requiresAuth: true, roles: ["TEACHER"] },
      children: [
        { path: "", redirect: "/professor/dashboard" },
        {
          path: "dashboard",
          name: "professor-dashboard",
          component: () => import("../views/professor/DashboardView.vue"),
          meta: { title: "Tableau de bord" },
        },
        {
          path: "projects",
          name: "professor-projects",
          component: () => import("../views/professor/ProjectsView.vue"),
          meta: { title: "Mes projets" },
        },
        {
          path: "defenses",
          name: "professor-defenses",
          component: () => import("../views/professor/DefensesView.vue"),
          meta: { title: "Mes soutenances" },
        },
        {
          path: "defenses/:id",
          name: "professor-defense-details",
          component: () => import("../views/professor/DefenseDetailsView.vue"),
          meta: { title: "Détails d’une soutenance" },
        },
        {
          path: "planning",
          name: "professor-planning",
          component: () => import("../views/professor/PlanningView.vue"),
          meta: { title: "Mon planning" },
        },
        {
          path: "evaluations",
          name: "professor-evaluations",
          component: () => import("../views/professor/EvaluationsView.vue"),
          meta: { title: "Documents et évaluations" },
        },
        {
          path: "notifications",
          name: "professor-notifications",
          component: () => import("../views/professor/NotificationsView.vue"),
          meta: { title: "Notifications" },
        },
        {
          path: "profile",
          name: "professor-profile",
          component: () => import("../views/professor/ProfileView.vue"),
          meta: { title: "Mon profil" },
        },
      ],
    },
    {
      // Provisoire : toute route inconnue renvoie au login
      // (à remplacer par une vraie page 404 dans views/errors/)
      path: "/:pathMatch(.*)*",
      redirect: "/login",
    },
  ],
});

router.beforeEach((to) => {
  // DEV UNIQUEMENT (npm run dev) : l'espace enseignant s'ouvre sans compte backend.
  // En production, import.meta.env.DEV vaut false : cette ligne est inactive.
  // À supprimer quand les comptes enseignants existeront côté backend.
  if (import.meta.env.DEV && to.path.startsWith("/professor")) return true;

  const auth = useAuthStore();

  // page protégée sans être connectée → login
  if (to.meta.requiresAuth && !auth.token) return "/login";

  // déjà connectée → pas besoin de revoir le login
  if (to.path === "/login" && auth.token && auth.user) {
    return ROLE_HOME_PATH[auth.user.role];
  }

  // mauvais espace pour ce rôle → renvoie vers le sien
  const roles = to.meta.roles as UserRole[] | undefined;
  if (roles && auth.user && !roles.includes(auth.user.role)) {
    return ROLE_HOME_PATH[auth.user.role];
  }
});

export default router;