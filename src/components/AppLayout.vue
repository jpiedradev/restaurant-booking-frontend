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
            <router-link
              to="/"
              class="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100"
              active-class="bg-blue-100 text-blue-700"
            >
              <i class="pi pi-chart-line mr-2"></i>
              Dashboard
            </router-link>
            <router-link
              to="/tables"
              class="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100"
              active-class="bg-blue-100 text-blue-700"
            >
              <i class="pi pi-table mr-2"></i>
              Mesas
            </router-link>
            <router-link
              to="/users"
              class="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100"
              active-class="bg-blue-100 text-blue-700"
            >
              <i class="pi pi-users mr-2"></i>
              Usuarios
            </router-link>
            <router-link
              to="/reservations"
              class="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100"
              active-class="bg-blue-100 text-blue-700"
            >
              <i class="pi pi-bookmark mr-2"></i>
              Reservas
            </router-link>
          </nav>

          <!-- Botón de nueva reserva -->
          <div>
            <Button
              label="Nueva Reserva"
              icon="pi pi-plus"
              @click="router.push('/new-reservation')"
            />
          </div>
        </div>
      </div>
    </header>

    <!-- Contenido principal -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
const router = useRouter()

</script>
