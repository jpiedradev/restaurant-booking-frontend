<template>
  <AppLayout>
    <!-- Encabezado -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-3xl font-bold text-gray-900">Mis Reservas</h2>
        <p class="text-gray-600 mt-1">Administra tus reservas en el restaurante</p>
      </div>
      <Button
        label="Nueva Reserva"
        icon="pi pi-plus"
        @click="$router.push('/new-reservation')"
      />
    </div>

    <!-- Tarjeta con la tabla -->
    <Card>
      <template #content>
        <!-- Filtro por estado -->
        <div class="mb-4">
          <Dropdown
            v-model="statusFilter"
            :options="statusFilterOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Filtrar por estado"
            class="w-52"
          />
        </div>

        <!-- DataTable -->
        <DataTable
          :value="filteredReservations"
          :loading="loading"
          stripedRows
          paginator
          :rows="10"
          responsiveLayout="scroll"
          class="p-datatable-sm"
        >
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

          <!-- Columna: Acciones -->
          <Column header="Acciones" :exportable="false" style="min-width: 120px">
            <template #body="{ data }">
              <div class="flex gap-2">
                <!-- Ver detalles -->
                <Button
                  icon="pi pi-eye"
                  severity="info"
                  size="small"
                  rounded
                  @click="viewDetails(data)"
                  v-tooltip.top="'Ver detalles'"
                />

                <!-- Cancelar (solo si está PENDING o CONFIRMED) -->
                <Button
                  v-if="data.status === 'PENDING' || data.status === 'CONFIRMED'"
                  icon="pi pi-times"
                  severity="warning"
                  size="small"
                  rounded
                  @click="confirmCancel(data)"
                  v-tooltip.top="'Cancelar'"
                />
              </div>
            </template>
          </Column>

          <!-- Mensaje cuando no hay datos -->
          <template #empty>
            <div class="text-center py-8">
              <i class="pi pi-bookmark text-6xl text-gray-300 mb-4"></i>
              <p class="text-gray-500">No tienes reservas</p>
              <Button
                label="Hacer una reserva"
                icon="pi pi-plus"
                class="mt-4"
                @click="$router.push('/new-reservation')"
              />
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
      :style="{ width: '500px' }"
    >
      <div v-if="selectedReservation" class="space-y-4">
        <!-- Estado -->
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

        <!-- Información de la Reserva -->
        <div>
          <h4 class="font-semibold text-gray-900 mb-2 flex items-center">
            <i class="pi pi-calendar text-purple-600 mr-2"></i>
            Detalles
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
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { reservationService } from '@/services/reservationService'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import AppLayout from '@/components/AppLayout.vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import Dropdown from 'primevue/dropdown'
import Tag from 'primevue/tag'

const authStore = useAuthStore()
const toast = useToast()
const confirm = useConfirm()

const reservations = ref([])
const loading = ref(false)
const statusFilter = ref(null)
const showDetailsDialog = ref(false)
const selectedReservation = ref(null)

// Opciones de filtro
const statusFilterOptions = [
  { label: 'Todas', value: null },
  { label: 'Pendientes', value: 'PENDING' },
  { label: 'Confirmadas', value: 'CONFIRMED' },
  { label: 'Sentadas', value: 'SEATED' },
  { label: 'Completadas', value: 'COMPLETED' },
  { label: 'Canceladas', value: 'CANCELLED' }
]

// Computed: Reservas filtradas
const filteredReservations = computed(() => {
  if (!statusFilter.value) return reservations.value
  return reservations.value.filter(r => r.status === statusFilter.value)
})

// Funciones de formato
function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
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

// Ver detalles
function viewDetails(reservation) {
  selectedReservation.value = reservation
  showDetailsDialog.value = true
}

// Confirmar cancelación
function confirmCancel(reservation) {
  confirm.require({
    message: `¿Estás seguro de cancelar tu reserva del ${formatDate(reservation.reservationDate)} a las ${formatTime(reservation.reservationTime)}?`,
    header: 'Cancelar Reserva',
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
    await reservationService.cancelReservation(id)
    toast.add({
      severity: 'success',
      summary: 'Reserva cancelada',
      detail: 'Tu reserva ha sido cancelada',
      life: 3000
    })
    await loadMyReservations()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'No se pudo cancelar la reserva',
      life: 3000
    })
  }
}

// Cargar reservas del usuario
async function loadMyReservations() {
  loading.value = true
  try {
    reservations.value = await reservationService.getMyReservations()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'No se pudieron cargar las reservas',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadMyReservations()
})
</script>
