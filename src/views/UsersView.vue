<template>
  <AppLayout>
    <!-- Encabezado -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-3xl font-bold text-gray-900">Gestión de Usuarios</h2>
        <p class="text-gray-600 mt-1">Administra los usuarios del sistema</p>
      </div>
      <Button
        label="Nuevo Usuario"
        icon="pi pi-user-plus"
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
                placeholder="Buscar usuario..."
                class="w-80 ml-2"
              />
            </span>
          </template>
          <template #end>
            <Dropdown
              v-model="roleFilter"
              :options="roleFilterOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Filtrar por rol"
              class="w-48"
            />
          </template>
        </Toolbar>

        <!-- DataTable -->
        <DataTable
          :value="filteredUsers"
          :loading="userStore.loading"
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

          <!-- Columna: Username -->
          <Column field="username" header="Username" sortable style="min-width: 150px">
            <template #body="{ data }">
              <div class="flex items-center">
                <i class="pi pi-user text-blue-600 mr-2"></i>
                <span class="font-semibold">{{ data.username }}</span>
              </div>
            </template>
          </Column>

          <!-- Columna: Nombre Completo -->
          <Column field="fullName" header="Nombre Completo" sortable style="min-width: 200px">
            <template #body="{ data }">
              <span class="text-gray-900">{{ data.fullName }}</span>
            </template>
          </Column>

          <!-- Columna: Email -->
          <Column field="email" header="Email" sortable style="min-width: 220px">
            <template #body="{ data }">
              <div class="flex items-center">
                <i class="pi pi-envelope text-gray-600 mr-2"></i>
                <span class="text-gray-700">{{ data.email }}</span>
              </div>
            </template>
          </Column>

          <!-- Columna: Teléfono -->
          <Column field="phone" header="Teléfono" style="min-width: 140px">
            <template #body="{ data }">
              <div class="flex items-center">
                <i class="pi pi-phone text-gray-600 mr-2"></i>
                <span class="text-gray-700">{{ data.phone }}</span>
              </div>
            </template>
          </Column>

          <!-- Columna: Rol -->
          <Column field="role" header="Rol" sortable style="min-width: 120px">
            <template #body="{ data }">
              <Tag
                :value="getRoleLabel(data.role)"
                :severity="getRoleSeverity(data.role)"
              />
            </template>
          </Column>

          <!-- Columna: Fecha de Registro -->
          <Column field="createdAt" header="Registrado" sortable style="min-width: 140px">
            <template #body="{ data }">
              <div class="flex items-center">
                <i class="pi pi-calendar text-gray-600 mr-2"></i>
                <span class="text-sm text-gray-600">{{ formatDate(data.createdAt) }}</span>
              </div>
            </template>
          </Column>

          <!-- Columna: Acciones -->
          <Column header="Acciones" :exportable="false" style="min-width: 120px">
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
              <i class="pi pi-users text-6xl text-gray-300 mb-4"></i>
              <p class="text-gray-500">No se encontraron usuarios</p>
            </div>
          </template>
        </DataTable>
      </template>
    </Card>

    <!-- Dialog: Crear/Editar Usuario -->
    <Dialog
      :visible="showDialog"
      @update:visible="showDialog = $event"
      :header="isEdit ? 'Editar Usuario' : 'Nuevo Usuario'"
      :modal="true"
      :style="{ width: '500px' }"
    >
      <div class="flex flex-col gap-4 py-4">
        <!-- Username -->
        <div class="flex flex-col gap-2">
          <label for="username" class="font-semibold">Username *</label>
          <InputText
            id="username"
            v-model="formData.username"
            placeholder="nombre.apellido"
            :class="{ 'p-invalid': errors.username }"
          />
          <small v-if="errors.username" class="text-red-500">
            {{ errors.username }}
          </small>
        </div>

        <!-- Email -->
        <div class="flex flex-col gap-2">
          <label for="email" class="font-semibold">Email *</label>
          <InputText
            id="email"
            v-model="formData.email"
            type="email"
            placeholder="correo@ejemplo.com"
            :class="{ 'p-invalid': errors.email }"
          />
          <small v-if="errors.email" class="text-red-500">
            {{ errors.email }}
          </small>
        </div>

        <!-- Nombre Completo -->
        <div class="flex flex-col gap-2">
          <label for="fullName" class="font-semibold">Nombre Completo *</label>
          <InputText
            id="fullName"
            v-model="formData.fullName"
            placeholder="Juan Pérez García"
            :class="{ 'p-invalid': errors.fullName }"
          />
          <small v-if="errors.fullName" class="text-red-500">
            {{ errors.fullName }}
          </small>
        </div>

        <!-- Teléfono -->
        <div class="flex flex-col gap-2">
          <label for="phone" class="font-semibold">Teléfono *</label>
          <InputText
            id="phone"
            v-model="formData.phone"
            placeholder="987654321"
            :class="{ 'p-invalid': errors.phone }"
          />
          <small v-if="errors.phone" class="text-red-500">
            {{ errors.phone }}
          </small>
        </div>

        <!-- Password (solo al crear) -->
        <div v-if="!isEdit" class="flex flex-col gap-2">
          <label for="password" class="font-semibold">Contraseña *</label>
          <InputText
            id="password"
            v-model="formData.password"
            type="password"
            placeholder="Contraseña segura"
            :class="{ 'p-invalid': errors.password }"
          />
          <small v-if="errors.password" class="text-red-500">
            {{ errors.password }}
          </small>
        </div>

        <!-- Rol -->
        <div class="flex flex-col gap-2">
          <label for="role" class="font-semibold">Rol *</label>
          <Dropdown
            id="role"
            v-model="formData.role"
            :options="roleOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Seleccionar rol"
            :class="{ 'p-invalid': errors.role }"
          />
          <small v-if="errors.role" class="text-red-500">
            {{ errors.role }}
          </small>
          <small class="text-gray-500">
            <strong>CUSTOMER:</strong> Cliente del restaurante<br>
            <strong>STAFF:</strong> Personal del restaurante<br>
            <strong>ADMIN:</strong> Administrador del sistema
          </small>
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
          :loading="userStore.loading"
        />
      </template>
    </Dialog>
    <Toast/>
    <ConfirmDialog/>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import AppLayout from '@/components/AppLayout.vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Tag from 'primevue/tag'
import Badge from 'primevue/badge'
import Toolbar from 'primevue/toolbar'
import ConfirmDialog from 'primevue/confirmdialog'
import Toast from 'primevue/toast'

const userStore = useUserStore()
const toast = useToast()
const confirm = useConfirm()

// Estado del formulario
const showDialog = ref(false)
const isEdit = ref(false)
const selectedUser = ref(null)
const searchQuery = ref('')
const roleFilter = ref(null)

const formData = ref({
  username: '',
  email: '',
  fullName: '',
  phone: '',
  password: '',
  role: 'CUSTOMER'
})

const errors = ref({
  username: '',
  email: '',
  fullName: '',
  phone: '',
  password: '',
  role: ''
})

// Opciones de rol
const roleOptions = [
  { label: 'Cliente', value: 'CUSTOMER' },
  { label: 'Personal', value: 'STAFF' },
  { label: 'Administrador', value: 'ADMIN' }
]

const roleFilterOptions = [
  { label: 'Todos', value: null },
  { label: 'Clientes', value: 'CUSTOMER' },
  { label: 'Personal', value: 'STAFF' },
  { label: 'Administradores', value: 'ADMIN' }
]

// Computed: Usuarios filtrados
const filteredUsers = computed(() => {
  let filtered = userStore.users

  // Filtrar por búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(user =>
      user.username.toLowerCase().includes(query) ||
      user.fullName.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.phone.includes(query)
    )
  }

  // Filtrar por rol
  if (roleFilter.value) {
    filtered = filtered.filter(user => user.role === roleFilter.value)
  }

  return filtered
})

// Funciones para labels y severities
function getRoleLabel(role) {
  const option = roleOptions.find(opt => opt.value === role)
  return option?.label || role
}

function getRoleSeverity(role) {
  const severities = {
    'CUSTOMER': 'success',
    'STAFF': 'info',
    'ADMIN': 'danger'
  }
  return severities[role] || 'info'
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

// Abrir dialog de crear
function openCreateDialog() {
  isEdit.value = false
  selectedUser.value = null
  resetForm()
  showDialog.value = true
}

// Abrir dialog de editar
function openEditDialog(user) {
  isEdit.value = true
  selectedUser.value = user
  formData.value = {
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    phone: user.phone,
    password: '',
    role: user.role
  }
  resetErrors()
  showDialog.value = true
}

// Cerrar dialog
function closeDialog() {
  showDialog.value = false
  resetForm()
}

// Resetear formulario
function resetForm() {
  formData.value = {
    username: '',
    email: '',
    fullName: '',
    phone: '',
    password: '',
    role: 'CUSTOMER'
  }
  resetErrors()
}

// Resetear errores
function resetErrors() {
  errors.value = {
    username: '',
    email: '',
    fullName: '',
    phone: '',
    password: '',
    role: ''
  }
}

// Validar formulario
function validateForm() {
  resetErrors()
  let isValid = true

  // Username
  if (!formData.value.username || formData.value.username.trim() === '') {
    errors.value.username = 'El username es obligatorio'
    isValid = false
  }

  // Email
  if (!formData.value.email || formData.value.email.trim() === '') {
    errors.value.email = 'El email es obligatorio'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
    errors.value.email = 'El email no es válido'
    isValid = false
  }

  // Nombre completo
  if (!formData.value.fullName || formData.value.fullName.trim() === '') {
    errors.value.fullName = 'El nombre completo es obligatorio'
    isValid = false
  }

  // Teléfono
  if (!formData.value.phone || formData.value.phone.trim() === '') {
    errors.value.phone = 'El teléfono es obligatorio'
    isValid = false
  } else if (!/^[0-9]{9,15}$/.test(formData.value.phone)) {
    errors.value.phone = 'El teléfono debe tener entre 9 y 15 dígitos'
    isValid = false
  }

  // Password (solo al crear)
  if (!isEdit.value) {
    if (!formData.value.password || formData.value.password.trim() === '') {
      errors.value.password = 'La contraseña es obligatoria'
      isValid = false
    } else if (formData.value.password.length < 6) {
      errors.value.password = 'La contraseña debe tener al menos 6 caracteres'
      isValid = false
    }
  }

  // Rol
  if (!formData.value.role) {
    errors.value.role = 'El rol es obligatorio'
    isValid = false
  }

  return isValid
}

// Submit formulario
async function handleSubmit() {
  if (!validateForm()) return

  try {
    if (isEdit.value && selectedUser.value) {
      const updateData = {
        username: formData.value.username,
        email: formData.value.email,
        fullName: formData.value.fullName,
        phone: formData.value.phone,
        role: formData.value.role
      }

      await userStore.updateUser(selectedUser.value.id, updateData)
      toast.add({
        severity: 'success',
        summary: 'Usuario actualizado',
        detail: 'El usuario se actualizó correctamente',
        life: 3000
      })
    } else {
      await userStore.createUser(formData.value)
      toast.add({
        severity: 'success',
        summary: 'Usuario creado',
        detail: 'El usuario se creó correctamente',
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

// Confirmar eliminación
function confirmDelete(user) {
  confirm.require({
    message: `¿Estás seguro de eliminar al usuario "${user.username}"?`,
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Sí, eliminar',
    rejectLabel: 'Cancelar',
    acceptClass: 'p-button-danger',
    accept: () => handleDelete(user.id)
  })
}

// Eliminar usuario
async function handleDelete(id) {
  try {
    await userStore.deleteUser(id)
    toast.add({
      severity: 'success',
      summary: 'Usuario eliminado',
      detail: 'El usuario se eliminó correctamente',
      life: 3000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'No se pudo eliminar el usuario',
      life: 3000
    })
  }
}

// Cargar usuarios al montar
onMounted(async () => {
  try {
    await userStore.fetchUsers()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'No se pudieron cargar los usuarios',
      life: 3000
    })
  }
})
</script>
