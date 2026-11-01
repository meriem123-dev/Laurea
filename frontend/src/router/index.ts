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
