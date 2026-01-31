<template>
  <AppLayout>
    <!-- Encabezado -->
    <div class="mb-8 text-center">
      <h2 class="text-4xl font-bold text-gray-900 mb-2">Nueva Reserva</h2>
      <p class="text-gray-600">Reserva tu mesa en 4 simples pasos</p>
    </div>

    <!-- Indicador de pasos -->
    <div class="max-w-3xl mx-auto mb-8">
      <div class="flex items-center justify-between">
        <div
          v-for="(step, index) in steps"
          :key="index"
          class="flex items-center flex-1"
        >
          <!-- Círculo del paso -->
          <div class="flex flex-col items-center flex-1">
            <div
              :class="[
                'w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all',
                currentStep > index
                  ? 'bg-green-500 text-white'
                  : currentStep === index
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-300 text-gray-600'
              ]"
            >
              <i v-if="currentStep > index" class="pi pi-check"></i>
              <span v-else>{{ index + 1 }}</span>
            </div>
            <span
              :class="[
                'text-sm mt-2 font-medium',
                currentStep >= index ? 'text-gray-900' : 'text-gray-500'
              ]"
            >
              {{ step.label }}
            </span>
          </div>

          <!-- Línea conectora -->
          <div
            v-if="index < steps.length - 1"
            :class="[
              'h-1 flex-1 mx-4 transition-all',
              currentStep > index ? 'bg-green-500' : 'bg-gray-300'
            ]"
          ></div>
        </div>
      </div>
    </div>

    <!-- Contenedor del formulario -->
    <div class="max-w-2xl mx-auto">
      <Card>
        <template #content>
          <!-- Paso 1: Fecha y hora -->
          <div v-show="currentStep === 0" class="space-y-6">
            <h3 class="text-2xl font-bold text-gray-900 mb-4">
              <i class="pi pi-calendar text-blue-600 mr-2"></i>
              ¿Cuándo deseas reservar?
            </h3>

            <!-- Fecha -->
            <div class="flex flex-col gap-2">
              <label class="font-semibold text-lg">Selecciona la fecha *</label>
              <Calendar
                v-model="formData.date"
                dateFormat="dd/mm/yy"
                :minDate="minDate"
                :showIcon="true"
                placeholder="Selecciona una fecha"
                :class="{ 'p-invalid': errors.date }"
                class="w-full"
                inline
              />
              <small v-if="errors.date" class="text-red-500">{{ errors.date }}</small>
            </div>

            <!-- Hora -->
            <div class="flex flex-col gap-2">
              <label class="font-semibold text-lg">Selecciona la hora *</label>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  v-for="time in availableTimes"
                  :key="time"
                  :label="time"
                  :outlined="formData.time !== time"
                  :severity="formData.time === time ? 'primary' : 'secondary'"
                  @click="formData.time = time"
                  class="text-lg"
                />
              </div>
              <small v-if="errors.time" class="text-red-500">{{ errors.time }}</small>
            </div>

            <!-- Número de comensales -->
            <div class="flex flex-col gap-2">
              <label class="font-semibold text-lg">¿Cuántos comensales? *</label>
              <InputNumber
                v-model="formData.guests"
                :min="1"
                :max="20"
                showButtons
                buttonLayout="horizontal"
                :class="{ 'p-invalid': errors.guests }"
                class="w-full"
              >
                <template #incrementbuttonicon>
                  <i class="pi pi-plus" />
                </template>
                <template #decrementbuttonicon>
                  <i class="pi pi-minus" />
                </template>
              </InputNumber>
              <small v-if="errors.guests" class="text-red-500">{{ errors.guests }}</small>
            </div>
          </div>

          <!-- Paso 2: Selección de mesa -->
          <div v-show="currentStep === 1" class="space-y-6">
            <h3 class="text-2xl font-bold text-gray-900 mb-4">
              <i class="pi pi-table text-blue-600 mr-2"></i>
              Selecciona tu mesa
            </h3>

            <div v-if="loadingTables" class="text-center py-8">
              <i class="pi pi-spin pi-spinner text-4xl text-blue-600"></i>
              <p class="mt-4 text-gray-600">Buscando mesas disponibles...</p>
            </div>

            <div v-else-if="availableTables.length === 0" class="text-center py-8">
              <i class="pi pi-exclamation-triangle text-6xl text-orange-500 mb-4"></i>
              <p class="text-lg text-gray-700 mb-2">
                No hay mesas disponibles para {{ formData.guests }} personas
              </p>
              <p class="text-gray-600">
                en {{ formatDateLong(formData.date) }} a las {{ formData.time }}
              </p>
              <Button
                label="Cambiar fecha/hora"
                icon="pi pi-arrow-left"
                severity="secondary"
                class="mt-4"
                @click="currentStep = 0"
              />
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card
                v-for="table in availableTables"
                :key="table.id"
                :class="[
                  'cursor-pointer transition-all hover:shadow-lg',
                  formData.tableId === table.id
                    ? 'ring-4 ring-blue-600 bg-blue-50'
                    : 'hover:bg-gray-50'
                ]"
                @click="formData.tableId = table.id"
              >
                <template #content>
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <div class="flex items-center mb-2">
                        <i class="pi pi-table text-blue-600 text-2xl mr-3"></i>
                        <span class="text-xl font-bold">Mesa {{ table.tableNumber }}</span>
                      </div>
                      <div class="space-y-1 text-gray-700">
                        <p class="flex items-center">
                          <i class="pi pi-users mr-2"></i>
                          Capacidad: {{ table.capacity }} personas
                        </p>
                        <p class="flex items-center">
                          <i class="pi pi-map-marker mr-2"></i>
                          {{ getLocationLabel(table.location) }}
                        </p>
                        <p v-if="table.description" class="text-sm text-gray-600 mt-2">
                          {{ table.description }}
                        </p>
                      </div>
                    </div>
                    <div v-if="formData.tableId === table.id" class="ml-4">
                      <i class="pi pi-check-circle text-3xl text-blue-600"></i>
                    </div>
                  </div>
                </template>
              </Card>
            </div>

            <small v-if="errors.tableId" class="text-red-500 block text-center">
              {{ errors.tableId }}
            </small>
          </div>

          <!-- Paso 3: Datos personales -->
          <div v-show="currentStep === 2" class="space-y-6">
            <h3 class="text-2xl font-bold text-gray-900 mb-4">
              <i class="pi pi-user text-blue-600 mr-2"></i>
              Tus datos de contacto
            </h3>

            <!-- Nombre completo -->
            <div class="flex flex-col gap-2">
              <label class="font-semibold">Nombre completo *</label>
              <InputText
                v-model="formData.fullName"
                placeholder="Juan Pérez García"
                :class="{ 'p-invalid': errors.fullName }"
              />
              <small v-if="errors.fullName" class="text-red-500">
                {{ errors.fullName }}
              </small>
            </div>

            <!-- Email -->
            <div class="flex flex-col gap-2">
              <label class="font-semibold">Email *</label>
              <InputText
                v-model="formData.email"
                type="email"
                placeholder="correo@ejemplo.com"
                :class="{ 'p-invalid': errors.email }"
              />
              <small v-if="errors.email" class="text-red-500">{{ errors.email }}</small>
            </div>

            <!-- Teléfono -->
            <div class="flex flex-col gap-2">
              <label class="font-semibold">Teléfono *</label>
              <InputText
                v-model="formData.phone"
                placeholder="987654321"
                :class="{ 'p-invalid': errors.phone }"
              />
              <small v-if="errors.phone" class="text-red-500">{{ errors.phone }}</small>
            </div>

            <!-- Peticiones especiales -->
            <div class="flex flex-col gap-2">
              <label class="font-semibold">Peticiones especiales (opcional)</label>
              <Textarea
                v-model="formData.specialRequests"
                rows="4"
                placeholder="Ej: Cumpleaños, necesitamos velas, mesa junto a la ventana, etc."
              />
            </div>
          </div>

          <!-- Paso 4: Confirmación -->
          <div v-show="currentStep === 3" class="space-y-6">
            <h3 class="text-2xl font-bold text-gray-900 mb-4">
              <i class="pi pi-check-circle text-green-600 mr-2"></i>
              Confirma tu reserva
            </h3>

            <div class="bg-gray-50 p-6 rounded-lg space-y-4">
              <!-- Fecha y hora -->
              <div class="flex items-start pb-4 border-b">
                <i class="pi pi-calendar text-blue-600 text-xl mr-3 mt-1"></i>
                <div>
                  <p class="font-semibold text-gray-900 mb-1">Fecha y hora</p>
                  <p class="text-gray-700">
                    {{ formatDateLong(formData.date) }} a las {{ formData.time }}
                  </p>
                </div>
              </div>

              <!-- Mesa -->
              <div class="flex items-start pb-4 border-b">
                <i class="pi pi-table text-blue-600 text-xl mr-3 mt-1"></i>
                <div>
                  <p class="font-semibold text-gray-900 mb-1">Mesa</p>
                  <p class="text-gray-700">
                    Mesa {{ getSelectedTableNumber() }} - {{ formData.guests }} personas
                  </p>
                  <p class="text-sm text-gray-600">{{ getSelectedTableLocation() }}</p>
                </div>
              </div>

              <!-- Datos personales -->
              <div class="flex items-start pb-4 border-b">
                <i class="pi pi-user text-blue-600 text-xl mr-3 mt-1"></i>
                <div>
                  <p class="font-semibold text-gray-900 mb-1">Datos de contacto</p>
                  <p class="text-gray-700">{{ formData.fullName }}</p>
                  <p class="text-gray-600">{{ formData.email }}</p>
                  <p class="text-gray-600">{{ formData.phone }}</p>
                </div>
              </div>

              <!-- Peticiones especiales -->
              <div v-if="formData.specialRequests" class="flex items-start">
                <i class="pi pi-comment text-orange-600 text-xl mr-3 mt-1"></i>
                <div>
                  <p class="font-semibold text-gray-900 mb-1">Peticiones especiales</p>
                  <p class="text-gray-700">{{ formData.specialRequests }}</p>
                </div>
              </div>
            </div>

            <div class="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <p class="text-blue-900 flex items-start">
                <i class="pi pi-info-circle mr-2 mt-1"></i>
                <span>
                  Tu reserva quedará en estado <strong>PENDIENTE</strong> hasta que el
                  restaurante la confirme. Recibirás una notificación por email.
                </span>
              </p>
            </div>
          </div>

          <!-- Botones de navegación -->
          <div class="flex justify-between mt-8 pt-6 border-t">
            <Button
              v-if="currentStep > 0"
              label="Anterior"
              icon="pi pi-arrow-left"
              severity="secondary"
              @click="previousStep"
            />
            <div v-else></div>

            <Button
              v-if="currentStep < 3"
              label="Siguiente"
              icon="pi pi-arrow-right"
              iconPos="right"
              @click="nextStep"
            />
            <Button
              v-else
              label="Confirmar Reserva"
              icon="pi pi-check"
              severity="success"
              @click="submitReservation"
              :loading="submitting"
            />
          </div>
        </template>
      </Card>
    </div>

    <!-- Dialog de éxito -->
    <Dialog
      :visible="showSuccessDialog"
      @update:visible="showSuccessDialog = $event"
      header="¡Reserva Creada!"
      :modal="true"
      :closable="false"
      :style="{ width: '450px' }"
    >
      <div class="text-center py-6">
        <i class="pi pi-check-circle text-8xl text-green-500 mb-4"></i>
        <h3 class="text-2xl font-bold text-gray-900 mb-2">¡Reserva exitosa!</h3>
        <p class="text-gray-700 mb-4">
          Tu reserva ha sido creada correctamente y está pendiente de confirmación.
        </p>
        <div class="bg-gray-50 p-4 rounded-lg mb-4">
          <p class="text-sm text-gray-600">
            Recibirás un email de confirmación en:
          </p>
          <p class="text-lg font-semibold text-gray-900">{{ formData.email }}</p>
        </div>
      </div>

      <template #footer>
        <Button
          label="Ver mis reservas"
          icon="pi pi-list"
          severity="secondary"
          @click="goToReservations"
        />
        <Button
          label="Nueva reserva"
          icon="pi pi-plus"
          @click="resetForm"
        />
      </template>
    </Dialog>
  </AppLayout>
  <Toast/>
  <ConfirmDialog/>
</template>

<script setup>
import { ref,watch } from 'vue'
import { useRouter } from 'vue-router'
import { useReservationStore } from '@/stores/reservationStore'
import { useUserStore } from '@/stores/userStore'
import { reservationService } from '@/services/reservationService'
import { tableService } from '@/services/tableService'
import { useToast } from 'primevue/usetoast'
import AppLayout from '@/components/AppLayout.vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import Calendar from 'primevue/calendar'
import Dialog from 'primevue/dialog'
import Toast from 'primevue/toast'

const router = useRouter()
const reservationStore = useReservationStore()
const userStore = useUserStore()
const toast = useToast()

// Pasos del wizard
const steps = [
  { label: 'Fecha y hora' },
  { label: 'Mesa' },
  { label: 'Tus datos' },
  { label: 'Confirmar' }
]

const currentStep = ref(0)
const submitting = ref(false)
const loadingTables = ref(false)
const showSuccessDialog = ref(false)
const availableTables = ref([])

// Fecha mínima (hoy)
const minDate = ref(new Date())

// Horas disponibles
const availableTimes = [
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'
]

// Datos del formulario
const formData = ref({
  date: null,
  time: null,
  guests: 2,
  tableId: null,
  fullName: '',
  email: '',
  phone: '',
  specialRequests: ''
})

// Errores
const errors = ref({
  date: '',
  time: '',
  guests: '',
  tableId: '',
  fullName: '',
  email: '',
  phone: ''
})

// Opciones de ubicación
const locationOptions = [
  { label: 'Interior', value: 'INDOOR' },
  { label: 'Terraza', value: 'OUTDOOR' },
  { label: 'Junto a ventana', value: 'WINDOW' },
  { label: 'VIP', value: 'VIP' }
]

// Watch para cargar mesas cuando cambian fecha, hora o comensales
watch([() => formData.value.date, () => formData.value.time, () => formData.value.guests],
  async ([newDate, newTime, newGuests]) => {
    if (newDate && newTime && newGuests && currentStep.value === 1) {
      await loadAvailableTables()
    }
  }
)

// Cargar mesas disponibles
async function loadAvailableTables() {
  if (!formData.value.date || !formData.value.time || !formData.value.guests) return

  loadingTables.value = true
  formData.value.tableId = null

  try {
    // Obtener mesas con capacidad suficiente
    const tablesWithCapacity = await tableService.getAvailableTablesByCapacity(
      formData.value.guests
    )

    // Filtrar solo las que están disponibles en la fecha/hora seleccionada
    const dateString = formData.value.date.toISOString().split('T')[0]
    const timeString = formData.value.time + ':00'

    const availablePromises = tablesWithCapacity.map(async (table) => {
      const isAvailable = await reservationService.checkAvailability(
        table.id,
        dateString,
        timeString
      )
      return isAvailable ? table : null
    })

    const results = await Promise.all(availablePromises)
    availableTables.value = results.filter(table => table !== null)

  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'No se pudieron cargar las mesas',
      life: 3000
    })
    availableTables.value = []
  } finally {
    loadingTables.value = false
  }
}

// Funciones de formato
function getLocationLabel(location) {
  const option = locationOptions.find(opt => opt.value === location)
  return option?.label || location
}

function formatDateLong(date) {
  if (!date) return ''
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

function getSelectedTableNumber() {
  const table = availableTables.value.find(t => t.id === formData.value.tableId)
  return table?.tableNumber || ''
}

function getSelectedTableLocation() {
  const table = availableTables.value.find(t => t.id === formData.value.tableId)
  return table ? getLocationLabel(table.location) : ''
}

// Validaciones por paso
function validateStep0() {
  errors.value.date = ''
  errors.value.time = ''
  errors.value.guests = ''

  let isValid = true

  if (!formData.value.date) {
    errors.value.date = 'Selecciona una fecha'
    isValid = false
  }

  if (!formData.value.time) {
    errors.value.time = 'Selecciona una hora'
    isValid = false
  }

  if (!formData.value.guests || formData.value.guests < 1) {
    errors.value.guests = 'Indica el número de comensales'
    isValid = false
  }

  return isValid
}

function validateStep1() {
  errors.value.tableId = ''

  if (!formData.value.tableId) {
    errors.value.tableId = 'Selecciona una mesa'
    return false
  }

  return true
}

function validateStep2() {
  errors.value.fullName = ''
  errors.value.email = ''
  errors.value.phone = ''

  let isValid = true

  if (!formData.value.fullName || formData.value.fullName.trim() === '') {
    errors.value.fullName = 'El nombre es obligatorio'
    isValid = false
  }

  if (!formData.value.email || formData.value.email.trim() === '') {
    errors.value.email = 'El email es obligatorio'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
    errors.value.email = 'El email no es válido'
    isValid = false
  }

  if (!formData.value.phone || formData.value.phone.trim() === '') {
    errors.value.phone = 'El teléfono es obligatorio'
    isValid = false
  } else if (!/^[0-9]{9,15}$/.test(formData.value.phone)) {
    errors.value.phone = 'El teléfono debe tener entre 9 y 15 dígitos'
    isValid = false
  }

  return isValid
}

// Navegación entre pasos
async function nextStep() {
  let isValid = false

  switch (currentStep.value) {
    case 0:
      isValid = validateStep0()
      if (isValid) {
        await loadAvailableTables()
      }
      break
    case 1:
      isValid = validateStep1()
      break
    case 2:
      isValid = validateStep2()
      break
  }

  if (isValid) {
    currentStep.value++
  }
}

function previousStep() {
  currentStep.value--
}

// Enviar reserva
async function submitReservation() {
  submitting.value = true

  try {
    // Primero crear o buscar usuario
    let userId = null

    // Buscar si el usuario existe por email
    try {
      const existingUser = await userStore.findByEmail(formData.value.email)
      userId = existingUser.id
    } catch {
      // Si no existe, crear nuevo usuario
      const newUser = await userStore.createUser({
        username: formData.value.email.split('@')[0],
        email: formData.value.email,
        fullName: formData.value.fullName,
        phone: formData.value.phone,
        password: 'temp123',  // Password temporal
        role: 'CUSTOMER'
      })
      userId = newUser.id
    }

    // Crear la reserva
    const dateString = formData.value.date.toISOString().split('T')[0]
    const timeString = formData.value.time + ':00'

    await reservationStore.createReservation({
      userId: userId,
      tableId: formData.value.tableId,
      reservationDate: dateString,
      reservationTime: timeString,
      guests: formData.value.guests,
      specialRequests: formData.value.specialRequests
    })

    showSuccessDialog.value = true

  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'No se pudo crear la reserva',
      life: 3000
    })
  } finally {
    submitting.value = false
  }
}

// Resetear formulario
function resetForm() {
  formData.value = {
    date: null,
    time: null,
    guests: 2,
    tableId: null,
    fullName: '',
    email: '',
    phone: '',
    specialRequests: ''
  }
  currentStep.value = 0
  showSuccessDialog.value = false
  availableTables.value = []
}

// Ir a reservas
function goToReservations() {
  router.push('/reservations')
}
</script>
