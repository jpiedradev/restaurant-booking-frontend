<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-blue-300 px-4 py-8">
    <Card class="w-full max-w-2xl">
      <template #header>
        <div class="text-center pt-6 pb-2">
          <i class="pi pi-user-plus text-5xl text-green-600 mb-4"></i>
          <h2 class="text-3xl font-bold text-gray-900">Crear Cuenta</h2>
          <p class="text-gray-600 mt-2">Regístrate para hacer reservas</p>
        </div>
      </template>

      <template #content>
        <form @submit.prevent="handleRegister" class="space-y-4">
          <!-- Grid de 2 columnas -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Username -->
            <div class="flex flex-col gap-2">
              <label for="username" class="font-semibold">Usuario *</label>
              <InputText
                id="username"
                v-model="formData.username"
                placeholder="usuario.ejemplo"
                :class="{ 'p-invalid': errors.username }"
                @blur="validateUsername"
              />
              <small v-if="errors.username" class="text-red-500">
                {{ errors.username }}
              </small>
              <small v-else-if="usernameChecking" class="text-blue-500">
                <i class="pi pi-spin pi-spinner"></i> Verificando...
              </small>
              <small v-else-if="usernameAvailable === true" class="text-green-500">
                <i class="pi pi-check"></i> Disponible
              </small>
              <small v-else-if="usernameAvailable === false" class="text-red-500">
                <i class="pi pi-times"></i> No disponible
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
                @blur="validateEmail"
              />
              <small v-if="errors.email" class="text-red-500">
                {{ errors.email }}
              </small>
              <small v-else-if="emailChecking" class="text-blue-500">
                <i class="pi pi-spin pi-spinner"></i> Verificando...
              </small>
              <small v-else-if="emailAvailable === true" class="text-green-500">
                <i class="pi pi-check"></i> Disponible
              </small>
              <small v-else-if="emailAvailable === false" class="text-red-500">
                <i class="pi pi-times"></i> Ya registrado
              </small>
            </div>
          </div>

          <!-- Nombre completo -->
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

          <!-- Grid de 2 columnas -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <!-- Password -->
            <div class="flex flex-col gap-2">
              <label for="password" class="font-semibold">Contraseña *</label>
              <InputText
                id="password"
                v-model="formData.password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                :class="{ 'p-invalid': errors.password }"
              />
              <small v-if="errors.password" class="text-red-500">
                {{ errors.password }}
              </small>
            </div>
          </div>

          <!-- Error general -->
          <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-lg p-3">
            <p class="text-red-700 text-sm flex items-center">
              <i class="pi pi-exclamation-circle mr-2"></i>
              {{ errorMessage }}
            </p>
          </div>

          <!-- Mensaje de éxito -->
          <div v-if="successMessage" class="bg-green-50 border border-green-200 rounded-lg p-3">
            <p class="text-green-700 text-sm flex items-center">
              <i class="pi pi-check-circle mr-2"></i>
              {{ successMessage }}
            </p>
          </div>

          <!-- Botón de registro -->
          <Button
            type="submit"
            label="Crear Cuenta"
            icon="pi pi-user-plus"
            :loading="loading"
            :disabled="!canSubmit"
            class="w-full"
          />

          <!-- Link a login -->
          <div class="text-center pt-4 border-t">
            <p class="text-gray-600">
              ¿Ya tienes cuenta?
              <router-link to="/login" class="text-green-600 hover:text-green-700 font-semibold">
                Inicia sesión aquí
              </router-link>
            </p>
          </div>
        </form>
      </template>
    </Card>
  </div>
  <Toast/>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from 'primevue/usetoast'
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Toast from 'primevue/toast'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const formData = ref({
  username: '',
  email: '',
  fullName: '',
  phone: '',
  password: ''
})

const errors = ref({
  username: '',
  email: '',
  fullName: '',
  phone: '',
  password: ''
})

const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Validación de disponibilidad
const usernameChecking = ref(false)
const usernameAvailable = ref(null)
const emailChecking = ref(false)
const emailAvailable = ref(null)

// Computed: Puede enviar el formulario
const canSubmit = computed(() => {
  return usernameAvailable.value === true &&
    emailAvailable.value === true &&
    !loading.value
})

// Validar username en tiempo real
async function validateUsername() {
  const username = formData.value.username.trim()

  if (!username) {
    usernameAvailable.value = null
    return
  }

  if (username.length < 3) {
    errors.value.username = 'Mínimo 3 caracteres'
    usernameAvailable.value = null
    return
  }

  usernameChecking.value = true
  errors.value.username = ''

  try {
    const available = await authStore.checkUsername(username)
    usernameAvailable.value = available

    if (!available) {
      errors.value.username = 'Username, ya está en uso'
    }
  } catch (error) {
    console.error('Error al verificar username:', error)
  } finally {
    usernameChecking.value = false
  }
}

// Validar email en tiempo real
async function validateEmail() {
  const email = formData.value.email.trim()

  if (!email) {
    emailAvailable.value = null
    return
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    errors.value.email = 'Email no válido'
    emailAvailable.value = null
    return
  }

  emailChecking.value = true
  errors.value.email = ''

  try {
    const available = await authStore.checkEmail(email)
    emailAvailable.value = available

    if (!available) {
      errors.value.email = 'Email ya registrado'
    }
  } catch (error) {
    console.error('Error al verificar email:', error)
  } finally {
    emailChecking.value = false
  }
}

// Validar formulario completo
function validateForm() {
  errors.value = {
    username: '',
    email: '',
    fullName: '',
    phone: '',
    password: ''
  }
  errorMessage.value = ''
  let isValid = true

  // Username
  if (!formData.value.username || formData.value.username.trim() === '') {
    errors.value.username = 'El usuario es obligatorio'
    isValid = false
  } else if (formData.value.username.length < 3) {
    errors.value.username = 'Mínimo 3 caracteres'
    isValid = false
  }

  // Email
  if (!formData.value.email || formData.value.email.trim() === '') {
    errors.value.email = 'El email es obligatorio'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
    errors.value.email = 'Email no válido'
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
    errors.value.phone = 'Debe tener entre 9 y 15 dígitos'
    isValid = false
  }

  // Password
  if (!formData.value.password || formData.value.password.trim() === '') {
    errors.value.password = 'La contraseña es obligatoria'
    isValid = false
  } else if (formData.value.password.length < 6) {
    errors.value.password = 'Mínimo 6 caracteres'
    isValid = false
  }

  return isValid
}

// Manejar registro
async function handleRegister() {
  if (!validateForm()) return

  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await authStore.register({
      username: formData.value.username,
      email: formData.value.email,
      fullName: formData.value.fullName,
      phone: formData.value.phone,
      password: formData.value.password
    })

    toast.add({
      severity: 'success',
      summary: 'Registro exitoso',
      detail: 'Cuenta creada correctamente. Redirigiendo al login...',
      life: 3000
    })

    setTimeout(() => {
      router.push('/login')
    }, 2000)

  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error en el registro',
      detail: error.message || 'No se pudo crear la cuenta',
      life: 4000
    })
  } finally {
    loading.value = false
  }
}
</script>
