import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/auth/LoginView.vue'
import AppLayout from '../layouts/AppLayout.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('../views/auth/ForgotPasswordView.vue'),
    },
    {
      path: '/admin',
      component: AppLayout,
      props: { role: 'admin' },
      children: [
        { path: '', redirect: '/admin/dashboard' },
        {
          path: 'dashboard',
          name: 'admin-dashboard',
          component: () => import('../views/admin/DashboardView.vue'),
          meta: { title: 'Tableau de bord' },
        },
        {
          path: 'students',
          name: 'admin-students',
          component: () => import('../views/admin/StudentsView.vue'),
          meta: { title: 'Étudiants' },
        },
        {
          path: 'professors',
          name: 'admin-professors',
          component: () => import('../views/admin/ProfessorsView.vue'),
          meta: { title: 'Professeurs' },
        },
        {
          path: 'projects',
          name: 'admin-projects',
          component: () => import('../views/admin/ProjectsView.vue'),
          meta: { title: 'Projets PFE' },
        },
      ],
    },
    {
      // Provisoire : toute route inconnue renvoie au login
      // (à remplacer par une vraie page 404 dans views/errors/)
      path: '/:pathMatch(.*)*',
      redirect: '/login',
    },
  ],
})

export default router