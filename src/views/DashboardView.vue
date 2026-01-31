<template>
  <AppLayout>
    <!-- Título -->
    <div class="mb-6">
      <h2 class="text-3xl font-bold text-gray-900">Dashboard</h2>
      <p class="text-gray-600 mt-1">Resumen general del restaurante</p>
    </div>

    <!-- Tarjetas de estadísticas -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Tarjeta: Total Mesas -->
      <Card>
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Total Mesas</p>
              <p class="text-3xl font-bold text-gray-900 mt-1">
                {{ tableStore.tables.length }}
              </p>
            </div>
            <div class="bg-blue-100 p-3 rounded-full">
              <i class="pi pi-table text-blue-600 text-2xl"></i>
            </div>
          </div>
        </template>
      </Card>

      <!-- Tarjeta: Total Usuarios -->
      <Card>
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Total Usuarios</p>
              <p class="text-3xl font-bold text-gray-900 mt-1">
                {{ userStore.users.length }}
              </p>
            </div>
            <div class="bg-green-100 p-3 rounded-full">
              <i class="pi pi-users text-green-600 text-2xl"></i>
            </div>
          </div>
        </template>
      </Card>

      <!-- Tarjeta: Total Reservas -->
      <Card>
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Total Reservas</p>
              <p class="text-3xl font-bold text-gray-900 mt-1">
                {{ reservationStore.reservations.length }}
              </p>
            </div>
            <div class="bg-purple-100 p-3 rounded-full">
              <i class="pi pi-bookmark text-purple-600 text-2xl"></i>
            </div>
          </div>
        </template>
      </Card>

      <!-- Tarjeta: Reservas Hoy -->
      <Card>
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Reservas Hoy</p>
              <p class="text-3xl font-bold text-gray-900 mt-1">
                {{ reservationStore.todayReservations.length }}
              </p>
            </div>
            <div class="bg-orange-100 p-3 rounded-full">
              <i class="pi pi-calendar text-orange-600 text-2xl"></i>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Grid de 2 columnas -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Reservas Pendientes -->
      <Card>
        <template #header>
          <div class="p-4 border-b">
            <h3 class="text-xl font-semibold flex items-center">
              <i class="pi pi-clock mr-2 text-yellow-600"></i>
              Reservas Pendientes
              <Badge
                :value="reservationStore.pendingReservations.length"
                severity="warning"
                class="ml-2"
              />
            </h3>
          </div>
        </template>
        <template #content>
          <div v-if="reservationStore.pendingReservations.length === 0" class="text-center py-8">
            <i class="pi pi-check-circle text-6xl text-green-400 mb-4"></i>
            <p class="text-gray-500">No hay reservas pendientes</p>
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="reservation in reservationStore.pendingReservations.slice(0, 5)"
              :key="reservation.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div class="flex-1">
                <p class="font-semibold text-gray-900">{{ reservation.userName }}</p>
                <p class="text-sm text-gray-600">
                  Mesa {{ reservation.tableNumber }} • {{ reservation.guests }} personas
                </p>
                <p class="text-xs text-gray-500 mt-1">
                  {{ formatDate(reservation.reservationDate) }} a las {{ reservation.reservationTime }}
                </p>
              </div>
              <div class="flex gap-2">
                <Button
                  icon="pi pi-check"
                  severity="success"
                  size="small"
                  rounded
                  @click="confirmReservation(reservation.id)"
                  v-tooltip.top="'Confirmar'"
                />
                <Button
                  icon="pi pi-times"
                  severity="danger"
                  size="small"
                  rounded
                  @click="cancelReservation(reservation.id)"
                  v-tooltip.top="'Cancelar'"
                />
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- Estado de Mesas -->
      <Card>
        <template #header>
          <div class="p-4 border-b">
            <h3 class="text-xl font-semibold flex items-center">
              <i class="pi pi-table mr-2 text-blue-600"></i>
              Estado de Mesas
            </h3>
          </div>
        </template>
        <template #content>
          <div class="grid grid-cols-2 gap-4">
            <div class="text-center p-4 bg-green-50 rounded-lg">
              <p class="text-sm text-gray-600 mb-2">Disponibles</p>
              <p class="text-4xl font-bold text-green-600">
                {{ availableTables }}
              </p>
            </div>
            <div class="text-center p-4 bg-red-50 rounded-lg">
              <p class="text-sm text-gray-600 mb-2">Ocupadas</p>
              <p class="text-4xl font-bold text-red-600">
                {{ occupiedTables }}
              </p>
            </div>
            <div class="text-center p-4 bg-blue-50 rounded-lg">
              <p class="text-sm text-gray-600 mb-2">Reservadas</p>
              <p class="text-4xl font-bold text-blue-600">
                {{ reservedTables }}
              </p>
            </div>
            <div class="text-center p-4 bg-gray-100 rounded-lg">
              <p class="text-sm text-gray-600 mb-2">Mantenimiento</p>
              <p class="text-4xl font-bold text-gray-600">
                {{ maintenanceTables }}
              </p>
            </div>
          </div>

          <!-- Lista de mesas disponibles -->
          <div class="mt-6">
            <h4 class="text-sm font-semibold text-gray-700 mb-3">Mesas Disponibles</h4>
            <div class="flex flex-wrap gap-2">
              <Tag
                v-for="table in availableTablesList"
                :key="table.id"
                :value="`Mesa ${table.tableNumber}`"
                severity="success"
                rounded
              />
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-xl">
        <i class="pi pi-spin pi-spinner text-4xl text-blue-600"></i>
        <p class="mt-4 text-gray-700">Cargando datos...</p>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTableStore } from '@/stores/tableStore'
import { useUserStore } from '@/stores/userStore'
import { useReservationStore } from '@/stores/reservationStore'
import { useToast } from 'primevue/usetoast'
import AppLayout from '@/components/AppLayout.vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Badge from 'primevue/badge'
import Tag from 'primevue/tag'

const tableStore = useTableStore()
const userStore = useUserStore()
const reservationStore = useReservationStore()
const toast = useToast()
const loading = ref(false)

// Computed: Conteo de mesas por estado
const availableTables = computed(() =>
  tableStore.tables.filter(t => t.status === 'AVAILABLE').length
)

const occupiedTables = computed(() =>
  tableStore.tables.filter(t => t.status === 'OCCUPIED').length
)

const reservedTables = computed(() =>
  tableStore.tables.filter(t => t.status === 'RESERVED').length
)

const maintenanceTables = computed(() =>
  tableStore.tables.filter(t => t.status === 'MAINTENANCE').length
)

const availableTablesList = computed(() =>
  tableStore.tables.filter(t => t.status === 'AVAILABLE')
)

// Formatear fecha
function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

// Confirmar reserva
async function confirmReservation(id) {
  try {
    await reservationStore.updateReservationStatus(id, 'CONFIRMED')
    toast.add({
      severity: 'success',
      summary: 'Reserva confirmada',
      detail: 'La reserva ha sido confirmada correctamente',
      life: 3000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'No se pudo confirmar la reserva',
      life: 3000
    })
  }
}

// Cancelar reserva
async function cancelReservation(id) {
  try {
    await reservationStore.cancelReservation(id)
    toast.add({
      severity: 'success',
      summary: 'Reserva cancelada',
      detail: 'La reserva ha sido cancelada',
      life: 3000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'No se pudo cancelar la reserva',
      life: 3000
    })
  }
}

// Cargar datos al montar el componente
onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      tableStore.fetchTables(),
      userStore.fetchUsers(),
      reservationStore.fetchReservations()
    ])

  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'No se pudieron cargar los datos',
      life: 3000
    })
  } finally {
    loading.value = false
  }
})
</script>
