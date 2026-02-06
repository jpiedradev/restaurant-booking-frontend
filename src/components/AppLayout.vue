<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Barra superior -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo y título -->
          <div class="flex items-center">
            <i class="pi pi-calendar text-3xl text-blue-600 mr-3"></i>
            <h1 class="text-2xl font-bold text-gray-900">
              Restaurant Booking
            </h1>
          </div>

          <!-- Navegación principal -->
          <nav class="hidden md:flex space-x-4">
            <!-- Dashboard (ADMIN) -->
            <router-link
              v-if="authStore.isAdmin"
              to="/"
              class="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100"
              active-class="bg-blue-100 text-blue-700"
            >
              <i class="pi pi-chart-line mr-2"></i>
              Dashboard
            </router-link>

            <!-- Dashboard Staff (STAFF) -->
            <router-link
              v-if="authStore.isStaff"
              to="/staff"
              class="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100"
              active-class="bg-blue-100 text-blue-700"
            >
              <i class="pi pi-chart-line mr-2"></i>
              Panel Staff
            </router-link>

            <!-- Mis Reservas (CUSTOMER) -->
            <router-link
              v-if="authStore.isCustomer"
              to="/my-reservations"
              class="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100"
              active-class="bg-blue-100 text-blue-700"
            >
              <i class="pi pi-bookmark mr-2"></i>
              Mis Reservas
            </router-link>

            <!-- Mesas (ADMIN y STAFF) -->
            <router-link
              v-if="authStore.isAdmin || authStore.isStaff"
              to="/tables"
              class="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100"
              active-class="bg-blue-100 text-blue-700"
            >
              <i class="pi pi-table mr-2"></i>
              Mesas
            </router-link>

            <!-- Usuarios (solo ADMIN) -->
            <router-link
              v-if="authStore.isAdmin"
              to="/users"
              class="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100"
              active-class="bg-blue-100 text-blue-700"
            >
              <i class="pi pi-users mr-2"></i>
              Usuarios
            </router-link>

            <!-- Reservas (ADMIN y STAFF) -->
            <router-link
              v-if="authStore.isAdmin || authStore.isStaff"
              to="/reservations"
              class="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100"
              active-class="bg-blue-100 text-blue-700"
            >
              <i class="pi pi-bookmark mr-2"></i>
              Reservas
            </router-link>
          </nav>

          <!-- Usuario y botones -->
          <div class="flex items-center gap-4">
            <!-- Info del usuario -->
            <div class="hidden md:block text-right">
              <p class="text-sm font-semibold text-gray-900">
                {{ authStore.user?.fullName }}
              </p>
              <p class="text-xs text-gray-600">
                {{ getRoleLabel(authStore.user?.role) }}
              </p>
            </div>

            <!-- Botón de nueva reserva -->
            <Button
              label="Nueva Reserva"
              icon="pi pi-plus"
              size="small"
              @click="$router.push('/new-reservation')"
            />

            <!-- Menú de usuario -->
            <Button
              icon="pi pi-user"
              severity="secondary"
              rounded
              @click="toggleUserMenu"
            />
          </div>
        </div>
      </div>
    </header>

    <!-- Menú desplegable del usuario -->
    <Menu
      ref="userMenu"
      :model="menuItems"
      :popup="true"
    />

    <!-- Contenido principal -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useConfirm } from 'primevue/useconfirm'
import Button from 'primevue/button'
import Menu from 'primevue/menu'

const router = useRouter()
const authStore = useAuthStore()
const confirm = useConfirm()
const userMenu = ref()

// Función para obtener el label del rol
function getRoleLabel(role) {
  const labels = {
    'CUSTOMER': 'Cliente',
    'STAFF': 'Personal',
    'ADMIN': 'Administrador'
  }
  return labels[role] || role
}

// Toggle del menú de usuario
function toggleUserMenu(event) {
  userMenu.value.toggle(event)
}

// Items del menú de usuario
const menuItems = computed(() => [
  {
    label: 'Mi Perfil',
    icon: 'pi pi-user',
    command: () => {
      // Implementar más adelante
      console.log('Ver perfil')
    }
  },
  {
    separator: true
  },
  {
    label: 'Cerrar Sesión',
    icon: 'pi pi-sign-out',
    command: () => {
      confirmLogout()
    }
  }
])

// Confirmar logout
function confirmLogout() {
  confirm.require({
    message: '¿Estás seguro de cerrar sesión?',
    header: 'Cerrar Sesión',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Sí, cerrar',
    rejectLabel: 'Cancelar',
    accept: () => {
      authStore.logout()
      router.push('/login')
    }
  })
}
</script>
