<template>
  <AppLayout>
    <!-- Título -->
    <div class="mb-6">
      <h2 class="text-3xl font-bold text-gray-900">Panel de Staff</h2>
      <p class="text-gray-600 mt-1">Gestión de reservas y servicio al cliente</p>
    </div>

    <!-- Estadísticas rápidas -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <template #content>
          <div class="text-center">
            <i class="pi pi-calendar-times text-4xl text-yellow-600 mb-2"></i>
            <p class="text-2xl font-bold text-gray-900">{{ pendingCount }}</p>
            <p class="text-sm text-gray-600">Pendientes</p>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div class="text-center">
            <i class="pi pi-calendar-plus text-4xl text-blue-600 mb-2"></i>
            <p class="text-2xl font-bold text-gray-900">{{ confirmedCount }}</p>
            <p class="text-sm text-gray-600">Confirmadas Hoy</p>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div class="text-center">
            <i class="pi pi-users text-4xl text-green-600 mb-2"></i>
            <p class="text-2xl font-bold text-gray-900">{{ seatedCount }}</p>
            <p class="text-sm text-gray-600">Clientes Sentados</p>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div class="text-center">
            <i class="pi pi-check-circle text-4xl text-purple-600 mb-2"></i>
            <p class="text-2xl font-bold text-gray-900">{{ completedCount }}</p>
            <p class="text-sm text-gray-600">Completadas Hoy</p>
          </div>
        </template>
      </Card>
    </div>

    <!-- Grid principal -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Columna izquierda: Reservas pendientes -->
      <div class="lg:col-span-2">
        <Card>
          <template #header>
            <div class="p-4 border-b">
              <h3 class="text-xl font-semibold flex items-center">
                <i class="pi pi-clock mr-2 text-yellow-600"></i>
                Reservas Pendientes de Confirmación
                <Badge
                  :value="pendingReservations.length"
                  severity="warning"
                  class="ml-2"
                />
              </h3>
            </div>
          </template>
          <template #content>
            <div v-if="pendingReservations.length === 0" class="text-center py-8">
              <i class="pi pi-check-circle text-6xl text-green-400 mb-4"></i>
              <p class="text-gray-500">No hay reservas pendientes</p>
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="reservation in pendingReservations"
                :key="reservation.id"
                class="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                      <i class="pi pi-user text-blue-600"></i>
                      <p class="font-semibold text-gray-900">{{ reservation.userName }}</p>
                      <Tag :value="reservation.guests + ' personas'" severity="info" size="small" />
                    </div>
                    <div class="flex items-center gap-4 text-sm text-gray-600">
                      <span>
                        <i class="pi pi-table mr-1"></i>
                        Mesa {{ reservation.tableNumber }}
                      </span>
                      <span>
                        <i class="pi pi-calendar mr-1"></i>
                        {{ formatDate(reservation.reservationDate) }}
                      </span>
                      <span>
                        <i class="pi pi-clock mr-1"></i>
                        {{ formatTime(reservation.reservationTime) }}
                      </span>
                    </div>
                    <p v-if="reservation.specialRequests" class="text-sm text-orange-600 mt-2">
                      <i class="pi pi-exclamation-circle mr-1"></i>
                      {{ reservation.specialRequests }}
                    </p>
                    <p class="text-xs text-gray-500 mt-2">
                      <i class="pi pi-phone mr-1"></i>
                      {{ reservation.userPhone }}
                    </p>
                  </div>
                  <div class="flex gap-2 ml-4">
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
                      @click="rejectReservation(reservation.id)"
                      v-tooltip.top="'Rechazar'"
                    />
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Card>

        <!-- Reservas confirmadas para hoy -->
        <Card class="mt-6">
          <template #header>
            <div class="p-4 border-b">
              <h3 class="text-xl font-semibold flex items-center">
                <i class="pi pi-calendar-check mr-2 text-blue-600"></i>
                Reservas Confirmadas para Hoy
                <Badge
                  :value="todayConfirmed.length"
                  severity="info"
                  class="ml-2"
                />
              </h3>
            </div>
          </template>
          <template #content>
            <div v-if="todayConfirmed.length === 0" class="text-center py-8">
              <i class="pi pi-calendar text-6xl text-gray-300 mb-4"></i>
              <p class="text-gray-500">No hay reservas confirmadas para hoy</p>
            </div>
            <div v-else>
              <DataTable
                :value="todayConfirmed"
                stripedRows
                class="p-datatable-sm"
              >
                <Column field="reservationTime" header="Hora" sortable style="min-width: 80px">
                  <template #body="{ data }">
                    <span class="font-semibold">{{ formatTime(data.reservationTime) }}</span>
                  </template>
                </Column>

                <Column field="userName" header="Cliente" sortable style="min-width: 150px">
                  <template #body="{ data }">
                    <div>
                      <p class="font-semibold">{{ data.userName }}</p>
                      <p class="text-xs text-gray-600">{{ data.userPhone }}</p>
                    </div>
                  </template>
                </Column>

                <Column field="tableNumber" header="Mesa" sortable style="min-width: 80px">
                  <template #body="{ data }">
                    <Tag :value="'Mesa ' + data.tableNumber" severity="info" />
                  </template>
                </Column>

                <Column field="guests" header="Personas" sortable style="min-width: 90px">
                  <template #body="{ data }">
                    <i class="pi pi-users mr-1"></i>
                    {{ data.guests }}
                  </template>
                </Column>

                <Column field="status" header="Estado" style="min-width: 100px">
                  <template #body="{ data }">
                    <Tag
                      :value="getStatusLabel(data.status)"
                      :severity="getStatusSeverity(data.status)"
                      size="small"
                    />
                  </template>
                </Column>

                <Column header="Acciones" style="min-width: 120px">
                  <template #body="{ data }">
                    <div class="flex gap-2">
                      <Button
                        v-if="data.status === 'CONFIRMED'"
                        icon="pi pi-sign-in"
                        severity="success"
                        size="small"
                        rounded
                        @click="seatCustomer(data.id)"
                        v-tooltip.top="'Sentar cliente'"
                      />
                      <Button
                        v-if="data.status === 'SEATED'"
                        icon="pi pi-check-circle"
                        severity="info"
                        size="small"
                        rounded
                        @click="completeReservation(data.id)"
                        v-tooltip.top="'Completar'"
                      />
                    </div>
                  </template>
                </Column>
              </DataTable>
            </div>
          </template>
        </Card>
      </div>

      <!-- Columna derecha: Estado de mesas -->
      <div>
        <Card>
          <template #header>
            <div class="p-4 border-b">
              <h3 class="text-xl font-semibold flex items-center">
                <i class="pi pi-table mr-2 text-purple-600"></i>
                Estado de Mesas
              </h3>
            </div>
          </template>
          <template #content>
            <div class="space-y-3">
              <div
                v-for="table in tables"
                :key="table.id"
                class="p-3 rounded-lg border-2 transition-all"
                :class="getTableClass(table.status)"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
                      :class="getTableIconClass(table.status)"
                    >
                      {{ table.tableNumber }}
                    </div>
                    <div>
                      <p class="font-semibold text-gray-900">Mesa {{ table.tableNumber }}</p>
                      <p class="text-xs text-gray-600">
                        <i class="pi pi-users mr-1"></i>
                        {{ table.capacity }} personas
                      </p>
                    </div>
                  </div>
                  <Tag
                    :value="getTableStatusLabel(table.status)"
                    :severity="getTableStatusSeverity(table.status)"
                    size="small"
                  />
                </div>
              </div>
            </div>

            <!-- Resumen -->
            <div class="mt-6 pt-4 border-t">
              <div class="grid grid-cols-2 gap-2 text-sm">
                <div class="flex items-center justify-between">
                  <span class="text-gray-600">Disponibles:</span>
                  <span class="font-bold text-green-600">{{ availableTablesCount }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-600">Ocupadas:</span>
                  <span class="font-bold text-red-600">{{ occupiedTablesCount }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-600">Reservadas:</span>
                  <span class="font-bold text-blue-600">{{ reservedTablesCount }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-600">Mantenimiento:</span>
                  <span class="font-bold text-gray-600">{{ maintenanceTablesCount }}</span>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>

    <!-- Loading overlay -->
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
import { reservationService } from '@/services/reservationService'
import { tableService } from '@/services/tableService'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import AppLayout from '@/components/AppLayout.vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Badge from 'primevue/badge'
import Tag from 'primevue/tag'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

const toast = useToast()
const confirm = useConfirm()

const loading = ref(false)
const reservations = ref([])
const tables = ref([])

// Computed: Filtrar reservas por estado
const pendingReservations = computed(() =>
  reservations.value.filter(r => r.status === 'PENDING')
)

const todayConfirmed = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return reservations.value.filter(r =>
    r.reservationDate === today &&
    (r.status === 'CONFIRMED' || r.status === 'SEATED')
  )
})

// Computed: Contar por estado
const pendingCount = computed(() => pendingReservations.value.length)

const confirmedCount = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return reservations.value.filter(r =>
    r.reservationDate === today && r.status === 'CONFIRMED'
  ).length
})

const seatedCount = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return reservations.value.filter(r =>
    r.reservationDate === today && r.status === 'SEATED'
  ).length
})

const completedCount = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return reservations.value.filter(r =>
    r.reservationDate === today && r.status === 'COMPLETED'
  ).length
})

// Computed: Contar mesas por estado
const availableTablesCount = computed(() =>
  tables.value.filter(t => t.status === 'AVAILABLE').length
)

const occupiedTablesCount = computed(() =>
  tables.value.filter(t => t.status === 'OCCUPIED').length
)

const reservedTablesCount = computed(() =>
  tables.value.filter(t => t.status === 'RESERVED').length
)

const maintenanceTablesCount = computed(() =>
  tables.value.filter(t => t.status === 'MAINTENANCE').length
)

// Funciones de formato
function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short'
  })
}

function formatTime(timeString) {
  return timeString.substring(0, 5)
}

function getStatusLabel(status) {
  const labels = {
    'PENDING': 'Pendiente',
    'CONFIRMED': 'Confirmada',
    'SEATED': 'Sentada',
    'COMPLETED': 'Completada',
    'CANCELLED': 'Cancelada'
  }
  return labels[status] || status
}

function getStatusSeverity(status) {
  const severities = {
    'PENDING': 'warning',
    'CONFIRMED': 'info',
    'SEATED': 'success',
    'COMPLETED': 'success',
    'CANCELLED': 'danger'
  }
  return severities[status] || 'info'
}

function getTableStatusLabel(status) {
  const labels = {
    'AVAILABLE': 'Disponible',
    'OCCUPIED': 'Ocupada',
    'RESERVED': 'Reservada',
    'MAINTENANCE': 'Mantenimiento'
  }
  return labels[status] || status
}

function getTableStatusSeverity(status) {
  const severities = {
    'AVAILABLE': 'success',
    'OCCUPIED': 'danger',
    'RESERVED': 'warning',
    'MAINTENANCE': 'secondary'
  }
  return severities[status] || 'info'
}

function getTableClass(status) {
  const classes = {
    'AVAILABLE': 'border-green-300 bg-green-50',
    'OCCUPIED': 'border-red-300 bg-red-50',
    'RESERVED': 'border-yellow-300 bg-yellow-50',
    'MAINTENANCE': 'border-gray-300 bg-gray-50'
  }
  return classes[status] || 'border-gray-300'
}

function getTableIconClass(status) {
  const classes = {
    'AVAILABLE': 'bg-green-500',
    'OCCUPIED': 'bg-red-500',
    'RESERVED': 'bg-yellow-500',
    'MAINTENANCE': 'bg-gray-500'
  }
  return classes[status] || 'bg-gray-500'
}

// Confirmar reserva
async function confirmReservation(id) {
  try {
    await reservationService.updateReservationStatus(id, 'CONFIRMED')
    toast.add({
      severity: 'success',
      summary: 'Reserva confirmada',
      detail: 'La reserva ha sido confirmada correctamente',
      life: 3000
    })
    loadData()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'No se pudo confirmar la reserva',
      life: 3000
    })
  }
}

// Rechazar reserva
function rejectReservation(id) {
  confirm.require({
    message: '¿Estás seguro de rechazar esta reserva?',
    header: 'Confirmar Rechazo',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Sí, rechazar',
    rejectLabel: 'Cancelar',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await reservationService.cancelReservation(id)
        toast.add({
          severity: 'success',
          summary: 'Reserva rechazada',
          detail: 'La reserva ha sido rechazada',
          life: 3000
        })
        loadData()
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message || 'No se pudo rechazar la reserva',
          life: 3000
        })
      }
    }
  })
}

// Sentar cliente
async function seatCustomer(id) {
  try {
    await reservationService.updateReservationStatus(id, 'SEATED')
    toast.add({
      severity: 'success',
      summary: 'Cliente sentado',
      detail: 'El cliente ha sido sentado en su mesa',
      life: 3000
    })
    loadData()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'No se pudo actualizar el estado',
      life: 3000
    })
  }
}

// Completar reserva
async function completeReservation(id) {
  try {
    await reservationService.updateReservationStatus(id, 'COMPLETED')
    toast.add({
      severity: 'success',
      summary: 'Reserva completada',
      detail: 'La reserva ha sido completada',
      life: 3000
    })
    loadData()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'No se pudo completar la reserva',
      life: 3000
    })
  }
}

// Cargar datos
async function loadData() {
  loading.value = true
  try {
    const [reservationsData, tablesData] = await Promise.all([
      reservationService.getAllReservations(),
      tableService.getAllTables()
    ])
    reservations.value = reservationsData
    tables.value = tablesData
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
}

onMounted(() => {
  loadData()
})
</script>
