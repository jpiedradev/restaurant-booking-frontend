import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import DashboardView from '../views/DashboardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/staff',
      name: 'dashboard-staff',
      component: () => import('../views/DashboardStaffView.vue'),
      meta: { requiresAuth: true, requiresStaff: true }
    },
    {
      path: '/my-reservations',
      name: 'my-reservations',
      component: () => import('../views/MyReservationsView.vue'),
      meta: { requiresAuth: true, requiresCustomer: true }
    },
    {
      path: '/tables',
      name: 'tables',
      component: () => import('../views/TablesView.vue'),
      meta: { requiresAuth: true, requiresAdminOrStaff: true }
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('../views/UsersView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/reservations',
      name: 'reservations',
      component: () => import('../views/ReservationsView.vue'),
      meta: { requiresAuth: true, requiresAdminOrStaff: true }
    },
    {
      path: '/new-reservation',
      name: 'new-reservation',
      component: () => import('../views/NewReservationView.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

// Guard global
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Rutas que requieren autenticación
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }

  // Rutas que requieren ser invitado (no logueado)
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    // Redirigir según rol
    if (authStore.isAdmin) {
      next('/')
    } else if (authStore.isStaff) {
      next('/staff')
    } else {
      next('/my-reservations')
    }
    return
  }

  // Rutas que requieren ser admin
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next(getDefaultRoute(authStore))
    return
  }

  // Rutas que requieren ser staff
  if (to.meta.requiresStaff && !authStore.isStaff) {
    next(getDefaultRoute(authStore))
    return
  }

  // Rutas que requieren ser customer
  if (to.meta.requiresCustomer && !authStore.isCustomer) {
    next(getDefaultRoute(authStore))
    return
  }

  // Rutas que requieren ser admin o staff
  if (to.meta.requiresAdminOrStaff && !authStore.isAdmin && !authStore.isStaff) {
    next(getDefaultRoute(authStore))
    return
  }

  next()
})

// Función helper para obtener la ruta por defecto según rol
function getDefaultRoute(authStore) {
  if (authStore.isAdmin) return '/'
  if (authStore.isStaff) return '/staff'
  if (authStore.isCustomer) return '/my-reservations'
  return '/login'
}

export default router
