<template>
  <AppLayout>
    <!-- Encabezado -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-3xl font-bold text-gray-900">Gestión de Reservas</h2>
        <p class="text-gray-600 mt-1">Administra todas las reservas del restaurante</p>
      </div>
      <Button
        label="Nueva Reserva"
        icon="pi pi-plus"
        @click="$router.push('/new-reservation')"
      />
    </div>

    <!-- Estadísticas rápidas -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <template #content>
          <div class="text-center">
            <i class="pi pi-clock text-4xl text-yellow-600 mb-2"></i>
            <p class="text-2xl font-bold text-gray-900">{{ reservationStore.pendingReservations.length }}</p>
            <p class="text-sm text-gray-600">Pendientes</p>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div class="text-center">
            <i class="pi pi-check-circle text-4xl text-green-600 mb-2"></i>
            <p class="text-2xl font-bold text-gray-900">{{ reservationStore.confirmedReservations.length }}</p>
            <p class="text-sm text-gray-600">Confirmadas</p>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div class="text-center">
            <i class="pi pi-calendar text-4xl text-blue-600 mb-2"></i>
            <p class="text-2xl font-bold text-gray-900">{{ reservationStore.todayReservations.length }}</p>
            <p class="text-sm text-gray-600">Hoy</p>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div class="text-center">
            <i class="pi pi-list text-4xl text-purple-600 mb-2"></i>
            <p class="text-2xl font-bold text-gray-900">{{ reservationStore.reservations.length }}</p>
            <p class="text-sm text-gray-600">Total</p>
          </div>
        </template>
      </Card>
    </div>

    <!-- Tarjeta con la tabla -->
    <Card>
      <template #content>
        <!-- Toolbar con filtros -->
        <Toolbar class="mb-4">
          <template #start>
            <div class="flex gap-3">
              <!-- Búsqueda -->
              <span class="p-input-icon-left">
                <i class="pi pi-search" />
                <InputText
                  v-model="searchQuery"
                  placeholder="Buscar por cliente..."
                  class="w-64 ml-2"
                />
              </span>

              <!-- Filtro por fecha -->
              <Calendar
                v-model="dateFilter"
                dateFormat="dd/mm/yy"
                placeholder="Filtrar por fecha"
                :showIcon="true"
                class="w-48"
              />
            </div>
          </template>

          <template #end>
            <Dropdown
              v-model="tablesFilter"
              :options="tablesFilterOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Filtrar por mesa"
              class="w-45"
            />

            <Dropdown
              v-model="statusFilter"
              :options="statusFilterOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Filtrar por estado"
              class="w-52 ml-2"
            />
          </template>
        </Toolbar>

        <!-- DataTable -->
        <DataTable
          :value="filteredReservations"
          :loading="reservationStore.loading"
          stripedRows
          paginator
          :rows="10"
          :rowsPerPageOptions="[5, 10, 20, 50]"
          responsiveLayout="scroll"
          class="p-datatable-sm"
        >
          <!-- Columna: ID -->
          <Column field="id" header="ID" sortable style="min-width: 80px">
            <template #body="{ data }">
              <Badge :value="data.id" severity="info" />
            </template>
          </Column>

          <!-- Columna: Cliente -->
          <Column field="userName" header="Cliente" sortable style="min-width: 180px">
            <template #body="{ data }">
              <div>
                <div class="flex items-center mb-1">
                  <i class="pi pi-user text-blue-600 mr-2"></i>
                  <span class="font-semibold">{{ data.userName }}</span>
                </div>
                <div class="flex items-center text-sm text-gray-600">
                  <i class="pi pi-phone mr-1"></i>
                  {{ data.userPhone }}
                </div>
              </div>
            </template>
          </Column>

          <!-- Columna: Mesa -->
          <Column field="tableNumber" header="Mesa" sortable style="min-width: 100px">
            <template #body="{ data }">
              <div class="flex items-center">
                <i class="pi pi-table text-gray-600 mr-2"></i>
                <span class="font-semibold">Mesa {{ data.tableNumber }}</span>
              </div>
            </template>
          </Column>

          <!-- Columna: Fecha -->
          <Column field="reservationDate" header="Fecha" sortable style="min-width: 140px">
            <template #body="{ data }">
              <div class="flex items-center">
                <i class="pi pi-calendar text-gray-600 mr-2"></i>
                <span>{{ formatDate(data.reservationDate) }}</span>
              </div>
            </template>
          </Column>

          <!-- Columna: Hora -->
          <Column field="reservationTime" header="Hora" sortable style="min-width: 100px">
            <template #body="{ data }">
              <div class="flex items-center">
                <i class="pi pi-clock text-gray-600 mr-2"></i>
                <span class="font-semibold">{{ formatTime(data.reservationTime) }}</span>
              </div>
            </template>
          </Column>

          <!-- Columna: Comensales -->
          <Column field="guests" header="Comensales" sortable style="min-width: 120px">
            <template #body="{ data }">
              <div class="flex items-center">
                <i class="pi pi-users text-gray-600 mr-2"></i>
                {{ data.guests }} personas
              </div>
            </template>
          </Column>

          <!-- Columna: Estado -->
          <Column field="status" header="Estado" sortable style="min-width: 140px">
            <template #body="{ data }">
              <Tag
                :value="getStatusLabel(data.status)"
                :severity="getStatusSeverity(data.status)"
              />
            </template>
          </Column>

          <!-- Columna: Peticiones Especiales -->
          <Column field="specialRequests" header="Peticiones" style="min-width: 200px">
            <template #body="{ data }">
              <span v-if="data.specialRequests" class="text-gray-600">
                {{ data.specialRequests }}
              </span>
              <span v-else class="text-gray-400 italic">Sin peticiones</span>
            </template>
          </Column>

          <!-- Columna: Acciones -->
          <Column header="Acciones" :exportable="false" style="min-width: 220px">
            <template #body="{ data }">
              <div class="flex gap-2 flex-wrap">
                <!-- Confirmar (solo si está PENDING) -->
                <Button
                  v-if="data.status === 'PENDING'"
                  icon="pi pi-check"
                  severity="success"
                  size="small"
                  rounded
                  @click="confirmReservation(data.id)"
                  v-tooltip.top="'Confirmar'"
                />

                <!-- Sentar cliente (solo si está CONFIRMED) -->
                <Button
                  v-if="data.status === 'CONFIRMED'"
                  icon="pi pi-sign-in"
                  severity="info"
                  size="small"
                  rounded
                  @click="seatCustomer(data.id)"
                  v-tooltip.top="'Cliente sentado'"
                />

                <!-- Completar (solo si está SEATED) -->
                <Button
                  v-if="data.status === 'SEATED'"
                  icon="pi pi-check-circle"
                  severity="success"
                  size="small"
                  rounded
                  @click="completeReservation(data.id)"
                  v-tooltip.top="'Completar'"
                />

                <!-- Cancelar (solo si está PENDING o CONFIRMED) -->
                <Button
                  v-if="data.status === 'PENDING' || data.status === 'CONFIRMED'"
                  icon="pi pi-times"
                  severity="warning"
                  size="small"
                  rounded
                  @click="confirmCancelReservation(data)"
                  v-tooltip.top="'Cancelar'"
                />

                <!-- Ver detalles -->
                <Button
                  icon="pi pi-eye"
                  severity="info"
                  size="small"
                  rounded
                  @click="viewDetails(data)"
                  v-tooltip.top="'Ver detalles'"
                />

                <!-- Eliminar -->
                <Button
                  icon="pi pi-trash"
                  severity="danger"
                  size="small"
                  rounded
                  @click="confirmDelete(data)"
                  v-tooltip.top="'Eliminar'"
                />
              </div>
            </template>
          </Column>

          <!-- Mensaje cuando no hay datos -->
          <template #empty>
            <div class="text-center py-8">
              <i class="pi pi-bookmark text-6xl text-gray-300 mb-4"></i>
              <p class="text-gray-500">No se encontraron reservas</p>
            </div>
          </template>
        </DataTable>
      </template>
    </Card>

    <!-- Dialog: Detalles de Reserva -->
    <Dialog
      :visible="showDetailsDialog"
      @update:visible="showDetailsDialog = $event"
      header="Detalles de Reserva"
      :modal="true"
      :style="{ width: '550px' }"
    >
      <div v-if="selectedReservation" class="space-y-4">
        <!-- ID y Estado -->
        <div class="flex justify-between items-center pb-4 border-b">
          <div>
            <p class="text-sm text-gray-600">Reserva #{{ selectedReservation.id }}</p>
          </div>
          <Tag
            :value="getStatusLabel(selectedReservation.status)"
            :severity="getStatusSeverity(selectedReservation.status)"
            class="text-lg"
          />
        </div>

        <!-- Información del Cliente -->
        <div>
          <h4 class="font-semibold text-gray-900 mb-2 flex items-center">
            <i class="pi pi-user text-blue-600 mr-2"></i>
            Información del Cliente
          </h4>
          <div class="bg-gray-50 p-4 rounded-lg space-y-2">
            <p><strong>Nombre:</strong> {{ selectedReservation.userName }}</p>
            <p><strong>Teléfono:</strong> {{ selectedReservation.userPhone }}</p>
          </div>
        </div>

        <!-- Información de la Reserva -->
        <div>
          <h4 class="font-semibold text-gray-900 mb-2 flex items-center">
            <i class="pi pi-calendar text-purple-600 mr-2"></i>
            Información de la Reserva
          </h4>
          <div class="bg-gray-50 p-4 rounded-lg space-y-2">
            <p><strong>Mesa:</strong> Mesa {{ selectedReservation.tableNumber }}</p>
            <p><strong>Fecha:</strong> {{ formatDate(selectedReservation.reservationDate) }}</p>
            <p><strong>Hora:</strong> {{ formatTime(selectedReservation.reservationTime) }}</p>
            <p><strong>Comensales:</strong> {{ selectedReservation.guests }} personas</p>
          </div>
        </div>

        <!-- Peticiones Especiales -->
        <div v-if="selectedReservation.specialRequests">
          <h4 class="font-semibold text-gray-900 mb-2 flex items-center">
            <i class="pi pi-comment text-orange-600 mr-2"></i>
            Peticiones Especiales
          </h4>
          <div class="bg-orange-50 p-4 rounded-lg">
            <p class="text-gray-700">{{ selectedReservation.specialRequests }}</p>
          </div>
        </div>
      </div>

      <template #footer>
        <Button
          label="Cerrar"
          severity="secondary"
          @click="showDetailsDialog = false"
        />
      </template>
    </Dialog>
    <ConfirmDialog/>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useReservationStore } from '@/stores/reservationStore'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import AppLayout from '@/components/AppLayout.vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Calendar from 'primevue/calendar'
import Dropdown from 'primevue/dropdown'
import Tag from 'primevue/tag'
import Badge from 'primevue/badge'
import Toolbar from 'primevue/toolbar'
import ConfirmDialog from 'primevue/confirmdialog'

const reservationStore = useReservationStore()
const toast = useToast()
const confirm = useConfirm()

// Estado de filtros
const searchQuery = ref('')
const dateFilter = ref(null)
const statusFilter = ref(null)
const tablesFilter = ref(null)

// Estado de dialogs
const showDetailsDialog = ref(false)
const selectedReservation = ref(null)

//Opciones de filtro de mesa
const tablesFilterOptions = computed(() => {
  const uniqueTables = [
    ...new Set(reservationStore.reservations.map(r => r.tableNumber))
  ]

  return [
    { label: 'Todas', value: null },
    ...uniqueTables.map(num => ({
      label: `Mesa ${num}`,
      value: num
    }))
  ]
})

// Opciones de filtro de estado
const statusFilterOptions = [
  { label: 'Todos', value: null },
  { label: 'Pendientes', value: 'PENDING' },
  { label: 'Confirmadas', value: 'CONFIRMED' },
  { label: 'Sentadas', value: 'SEATED' },
  { label: 'Completadas', value: 'COMPLETED' },
  { label: 'Canceladas', value: 'CANCELLED' },
  { label: 'No presentados', value: 'NO_SHOW' }
]

// Computed: Reservas filtradas
const filteredReservations = computed(() => {
  let filtered = reservationStore.reservations

  // Filtrar por búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(reservation =>
      reservation.userName.toLowerCase().includes(query) ||
      reservation.userPhone.includes(query)
    )
  }

  // Filtrar por fecha
  if (dateFilter.value) {
    const filterDate = dateFilter.value.toISOString().split('T')[0]
    filtered = filtered.filter(reservation =>
      reservation.reservationDate === filterDate
    )
  }

  // Filtrar por estado
  if (statusFilter.value) {
    filtered = filtered.filter(reservation =>
      reservation.status === statusFilter.value
    )
  }

  // Filtrar por mesa
  if (tablesFilter.value) {
    filtered = filtered.filter(reservation =>
      reservation.tableNumber === tablesFilter.value
    )
  }

  // Ordenar: reservas más próximas primero (fecha + hora)
  filtered = filtered.slice().sort((a, b) => {
    const dateTimeA = new Date(`${a.reservationDate}T${a.reservationTime}`)
    const dateTimeB = new Date(`${b.reservationDate}T${b.reservationTime}`)
    return dateTimeA - dateTimeB // ASC → más próxima arriba
  })

  return filtered
})

// Funciones para labels y severities
function getStatusLabel(status) {
  const labels = {
    'PENDING': 'Pendiente',
    'CONFIRMED': 'Confirmada',
    'SEATED': 'Sentada',
    'COMPLETED': 'Completada',
    'CANCELLED': 'Cancelada',
    'NO_SHOW': 'No se presentó'
  }
  return labels[status] || status
}

function getStatusSeverity(status) {
  const severities = {
    'PENDING': 'warning',
    'CONFIRMED': 'info',
    'SEATED': 'success',
    'COMPLETED': 'success',
    'CANCELLED': 'danger',
    'NO_SHOW': 'secondary'
  }
  return severities[status] || 'info'
}

// Formatear fecha
function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

// Formatear hora
function formatTime(timeString) {
  return timeString.substring(0, 5)
}

// Ver detalles
function viewDetails(reservation) {
  selectedReservation.value = reservation
  showDetailsDialog.value = true
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

// Sentar cliente
async function seatCustomer(id) {
  try {
    await reservationStore.updateReservationStatus(id, 'SEATED')
    toast.add({
      severity: 'success',
      summary: 'Cliente sentado',
      detail: 'El cliente ha sido sentado en su mesa',
      life: 3000
    })
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
    await reservationStore.updateReservationStatus(id, 'COMPLETED')
    toast.add({
      severity: 'success',
      summary: 'Reserva completada',
      detail: 'La reserva ha sido completada',
      life: 3000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'No se pudo completar la reserva',
      life: 3000
    })
  }
}

// Confirmar cancelación
function confirmCancelReservation(reservation) {
  confirm.require({
    message: `¿Estás seguro de cancelar la reserva de ${reservation.userName}?`,
    header: 'Confirmar cancelación',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Sí, cancelar',
    rejectLabel: 'No',
    acceptClass: 'p-button-warning',
    accept: () => cancelReservation(reservation.id)
  })
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

// Confirmar eliminación
function confirmDelete(reservation) {
  confirm.require({
    message: `¿Estás seguro de eliminar la reserva de ${reservation.userName}?`,
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Sí, eliminar',
    rejectLabel: 'Cancelar',
    acceptClass: 'p-button-danger',
    accept: () => handleDelete(reservation.id)
  })
}

// Eliminar reserva
async function handleDelete(id) {
  try {
    await reservationStore.deleteReservation(id)
    toast.add({
      severity: 'success',
      summary: 'Reserva eliminada',
      detail: 'La reserva se eliminó correctamente',
      life: 3000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'No se pudo eliminar la reserva',
      life: 3000
    })
  }
}

// Cargar reservas al montar
onMounted(async () => {
  try {
    await reservationStore.fetchReservations()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'No se pudieron cargar las reservas',
      life: 3000
    })
  }
})
</script>
