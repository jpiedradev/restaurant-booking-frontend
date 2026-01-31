<template>
  <AppLayout>
    <!-- Encabezado -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-3xl font-bold text-gray-900">Gestión de Mesas</h2>
        <p class="text-gray-600 mt-1">Administra las mesas del restaurante</p>
      </div>
      <Button
        label="Nueva Mesa"
        icon="pi pi-plus"
        @click="openCreateDialog"
      />
    </div>

    <!-- Tarjeta con la tabla -->
    <Card>
      <template #content>
        <!-- Toolbar con filtros -->
        <Toolbar class="mb-4">
          <template #start>
            <span class="p-input-icon-left">
              <i class="pi pi-search" />
              <InputText
                v-model="searchQuery"
                placeholder="Buscar mesa..."
                class="w-80 ml-2"
              />
            </span>
          </template>
          <template #end>
            <Dropdown
              v-model="ubicationFilter"
              :options="locationOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Filtrar por ubicacíon"
              class="w-60 mr-2"
            />

            <Dropdown
              v-model="statusFilter"
              :options="statusOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Filtrar por estado"
              class="w-48"
            />
          </template>
        </Toolbar>

        <!-- DataTable -->
        <DataTable
          :value="filteredTables"
          :loading="tableStore.loading"
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

          <!-- Columna: Número de Mesa -->
          <Column field="tableNumber" header="Número" sortable style="min-width: 100px">
            <template #body="{ data }">
              <div class="flex items-center">
                <i class="pi pi-table text-blue-600 mr-2"></i>
                <span class="font-semibold">Mesa {{ data.tableNumber }}</span>
              </div>
            </template>
          </Column>

          <!-- Columna: Capacidad -->
          <Column field="capacity" header="Capacidad" sortable style="min-width: 120px">
            <template #body="{ data }">
              <div class="flex items-center">
                <i class="pi pi-users text-gray-600 mr-2"></i>
                {{ data.capacity }} personas
              </div>
            </template>
          </Column>

          <!-- Columna: Ubicación -->
          <Column field="location" header="Ubicación" sortable style="min-width: 140px">
            <template #body="{ data }">
              <Tag
                :value="getLocationLabel(data.location)"
                :severity="getLocationSeverity(data.location)"
              />
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

          <!-- Columna: Descripción -->
          <Column field="description" header="Descripción" style="min-width: 200px">
            <template #body="{ data }">
              <span class="text-gray-600">{{ data.description || 'Sin descripción' }}</span>
            </template>
          </Column>

          <!-- Columna: Acciones -->
          <Column header="Acciones" :exportable="false" style="min-width: 180px">
            <template #body="{ data }">
              <div class="flex gap-2">
                <Button
                  icon="pi pi-pencil"
                  severity="info"
                  size="small"
                  rounded
                  @click="openEditDialog(data)"
                  v-tooltip.top="'Editar'"
                />
                <Button
                  icon="pi pi-refresh"
                  severity="warning"
                  size="small"
                  rounded
                  @click="openStatusDialog(data)"
                  v-tooltip.top="'Cambiar estado'"
                />
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
              <i class="pi pi-inbox text-6xl text-gray-300 mb-4"></i>
              <p class="text-gray-500">No se encontraron mesas</p>
            </div>
          </template>
        </DataTable>
      </template>
    </Card>

    <!-- Dialog: Crear/Editar Mesa -->
    <Dialog
      :visible="showDialog"
      @update:visible="showDialog = $event"
      :header="isEdit ? 'Editar Mesa' : 'Nueva Mesa'"
      :modal="true"
      :style="{ width: '450px' }"
    >
      <div class="flex flex-col gap-4 py-4">
        <!-- Número de Mesa -->
        <div class="flex flex-col gap-2">
          <label for="tableNumber" class="font-semibold">Número de Mesa *</label>
          <InputNumber
            id="tableNumber"
            v-model="formData.tableNumber"
            :min="1"
            placeholder="Ej: 5"
            :class="{ 'p-invalid': errors.tableNumber }"
          />
          <small v-if="errors.tableNumber" class="text-red-500">
            {{ errors.tableNumber }}
          </small>
        </div>

        <!-- Capacidad -->
        <div class="flex flex-col gap-2">
          <label for="capacity" class="font-semibold">Capacidad *</label>
          <InputNumber
            id="capacity"
            v-model="formData.capacity"
            :min="1"
            :max="20"
            placeholder="Número de personas"
            :class="{ 'p-invalid': errors.capacity }"
          />
          <small v-if="errors.capacity" class="text-red-500">
            {{ errors.capacity }}
          </small>
        </div>

        <!-- Ubicación -->
        <div class="flex flex-col gap-2">
          <label for="location" class="font-semibold">Ubicación *</label>
          <Dropdown
            id="location"
            v-model="formData.location"
            :options="locationOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Seleccionar ubicación"
            :class="{ 'p-invalid': errors.location }"
          />
          <small v-if="errors.location" class="text-red-500">
            {{ errors.location }}
          </small>
        </div>

        <!-- Estado (solo al editar) -->
        <div v-if="isEdit" class="flex flex-col gap-2">
          <label for="status" class="font-semibold">Estado</label>
          <Dropdown
            id="status"
            v-model="formData.status"
            :options="statusOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Seleccionar estado"
          />
        </div>

        <!-- Descripción -->
        <div class="flex flex-col gap-2">
          <label for="description" class="font-semibold">Descripción</label>
          <Textarea
            id="description"
            v-model="formData.description"
            rows="3"
            placeholder="Descripción opcional de la mesa"
          />
        </div>
      </div>

      <template #footer>
        <Button
          label="Cancelar"
          severity="secondary"
          @click="closeDialog"
        />
        <Button
          :label="isEdit ? 'Actualizar' : 'Crear'"
          @click="handleSubmit"
          :loading="tableStore.loading"
        />
      </template>
    </Dialog>

    <!-- Dialog: Cambiar Estado -->
    <Dialog
      :visible="showStatusDialog"
      @update:visible="showStatusDialog = $event"
      header="Cambiar Estado de Mesa"
      :modal="true"
      :style="{ width: '400px' }"
    >
      <div class="py-4">
        <p class="text-gray-700 mb-4">
          Selecciona el nuevo estado para la <strong>Mesa {{ selectedTable?.tableNumber }}</strong>
        </p>
        <Dropdown
          v-model="newStatus"
          :options="statusOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Seleccionar estado"
          class="w-full"
        />
      </div>

      <template #footer>
        <Button
          label="Cancelar"
          severity="secondary"
          @click="showStatusDialog = false"
        />
        <Button
          label="Cambiar"
          @click="handleStatusChange"
        />
      </template>
    </Dialog>
    <Toast/>
    <ConfirmDialog/>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTableStore } from '@/stores/tableStore'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import AppLayout from '@/components/AppLayout.vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import Dropdown from 'primevue/dropdown'
import Tag from 'primevue/tag'
import Badge from 'primevue/badge'
import Toolbar from 'primevue/toolbar'
import ConfirmDialog from 'primevue/confirmdialog'
import Toast from 'primevue/toast'

const tableStore = useTableStore()
const toast = useToast()
const confirm = useConfirm()

// Estado del formulario
const showDialog = ref(false)
const showStatusDialog = ref(false)
const isEdit = ref(false)
const selectedTable = ref(null)
const newStatus = ref(null)
const searchQuery = ref('')
const statusFilter = ref(null)
const ubicationFilter = ref(null)

const formData = ref({
  tableNumber: null,
  capacity: null,
  location: null,
  status: 'AVAILABLE',
  description: ''
})

const errors = ref({
  tableNumber: '',
  capacity: '',
  location: ''
})

// Opciones de ubicación
const locationOptions = [
  { label: 'Todos', value: null },
  { label: 'Interior', value: 'INDOOR' },
  { label: 'Terraza', value: 'OUTDOOR' },
  { label: 'Junto a ventana', value: 'WINDOW' },
  { label: 'VIP', value: 'VIP' }
]

// Opciones de estado
const statusOptions = [
  { label: 'Todos', value: null },
  { label: 'Disponible', value: 'AVAILABLE' },
  { label: 'Ocupada', value: 'OCCUPIED' },
  { label: 'Reservada', value: 'RESERVED' },
  { label: 'Mantenimiento', value: 'MAINTENANCE' }
]

// Computed: Mesas filtradas
const filteredTables = computed(() => {
  let filtered = tableStore.tables

  // Filtrar por búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(table =>
      table.tableNumber.toString().includes(query) ||
      table.description?.toLowerCase().includes(query) ||
      table.location.toLowerCase().includes(query)
    )
  }

  // Filtrar por estado
  if (statusFilter.value) {
    filtered = filtered.filter(table => table.status === statusFilter.value)
  }

  // Filtrar por ubicacion
  if (ubicationFilter.value){
    filtered = filtered.filter(table => table.location === ubicationFilter.value)
  }

  return filtered
})

// Funciones para labels y severities
function getLocationLabel(location) {
  const option = locationOptions.find(opt => opt.value === location)
  return option?.label || location
}

function getLocationSeverity(location) {
  const severities = {
    'INDOOR': 'info',
    'OUTDOOR': 'success',
    'WINDOW': 'warning',
    'VIP': 'danger'
  }
  return severities[location] || 'info'
}

function getStatusLabel(status) {
  const option = statusOptions.find(opt => opt.value === status)
  return option?.label || status
}

function getStatusSeverity(status) {
  const severities = {
    'AVAILABLE': 'success',
    'OCCUPIED': 'danger',
    'RESERVED': 'warning',
    'MAINTENANCE': 'secondary'
  }
  return severities[status] || 'info'
}

// Abrir dialog de crear
function openCreateDialog() {
  isEdit.value = false
  selectedTable.value = null
  resetForm()
  showDialog.value = true
}

// Abrir dialog de editar
function openEditDialog(table) {
  isEdit.value = true
  selectedTable.value = table
  formData.value = { ...table }
  errors.value = { tableNumber: '', capacity: '', location: '' }
  showDialog.value = true
}

// Abrir dialog de cambiar estado
function openStatusDialog(table) {
  selectedTable.value = table
  newStatus.value = table.status
  showStatusDialog.value = true
}

// Cerrar dialog
function closeDialog() {
  showDialog.value = false
  resetForm()
}

// Resetear formulario
function resetForm() {
  formData.value = {
    tableNumber: null,
    capacity: null,
    location: null,
    status: 'AVAILABLE',
    description: ''
  }
  errors.value = { tableNumber: '', capacity: '', location: '' }
}

// Validar formulario
function validateForm() {
  errors.value = { tableNumber: '', capacity: '', location: '' }
  let isValid = true

  if (!formData.value.tableNumber) {
    errors.value.tableNumber = 'El número de mesa es obligatorio'
    isValid = false
  }

  if (!formData.value.capacity) {
    errors.value.capacity = 'La capacidad es obligatoria'
    isValid = false
  }

  if (!formData.value.location) {
    errors.value.location = 'La ubicación es obligatoria'
    isValid = false
  }

  return isValid
}

// Submit formulario
async function handleSubmit() {
  if (!validateForm()) return

  try {
    if (isEdit.value && selectedTable.value) {
      await tableStore.updateTable(selectedTable.value.id, formData.value)
      toast.add({
        severity: 'success',
        summary: 'Mesa actualizada',
        detail: 'La mesa se actualizó correctamente',
        life: 3000
      })
    } else {
      await tableStore.createTable(formData.value)
      toast.add({
        severity: 'success',
        summary: 'Mesa creada',
        detail: 'La mesa se creó correctamente',
        life: 3000
      })
    }
    closeDialog()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Ocurrió un error',
      life: 3000
    })
  }
}

// Cambiar estado
async function handleStatusChange() {
  if (!selectedTable.value || !newStatus.value) return

  try {
    await tableStore.updateTableStatus(selectedTable.value.id, newStatus.value)
    toast.add({
      severity: 'success',
      summary: 'Estado actualizado',
      detail: 'El estado de la mesa se actualizó correctamente',
      life: 3000
    })
    showStatusDialog.value = false
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'No se pudo actualizar el estado',
      life: 3000
    })
  }
}

// Confirmar eliminación
function confirmDelete(table) {
  confirm.require({
    message: `¿Estás seguro de eliminar la Mesa ${table.tableNumber}?`,
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Sí, eliminar',
    rejectLabel: 'Cancelar',
    acceptClass: 'p-button-danger',
    accept: () => handleDelete(table.id)
  })
}

// Eliminar mesa
async function handleDelete(id) {
  try {
    await tableStore.deleteTable(id)
    toast.add({
      severity: 'success',
      summary: 'Mesa eliminada',
      detail: 'La mesa se eliminó correctamente',
      life: 3000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'No se pudo eliminar la mesa',
      life: 3000
    })
  }
}

// Cargar mesas al montar
onMounted(async () => {
  try {
    await tableStore.fetchTables()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'No se pudieron cargar las mesas',
      life: 3000
    })
  }
})
</script>
