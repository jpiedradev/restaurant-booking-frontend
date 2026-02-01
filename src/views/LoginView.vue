<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-blue-300 px-4">
    <Card class="w-full max-w-md">
      <template #header>
        <div class="text-center pt-6 pb-2">
          <i class="pi pi-sign-in text-5xl text-blue-600 mb-4"></i>
          <h2 class="text-3xl font-bold text-gray-900">Iniciar Sesión</h2>
          <p class="text-gray-600 mt-2">Bienvenido de vuelta</p>
        </div>
      </template>

      <template #content>
        <form @submit.prevent="handleLogin" class="space-y-4">
          <!-- Username -->
          <div class="flex flex-col gap-2">
            <label for="username" class="font-semibold">Usuario</label>
            <InputText
              id="username"
              v-model="formData.username"
              placeholder="Ingresa tu usuario"
              :class="{ 'p-invalid': errors.username }"
            />
            <small v-if="errors.username" class="text-red-500">
              {{ errors.username }}
            </small>
          </div>

          <!-- Password -->
          <div class="flex flex-col gap-2">
            <label for="password" class="font-semibold">Contraseña</label>
            <InputText
              id="password"
              v-model="formData.password"
              type="password"
              placeholder="Ingresa tu contraseña"
              :class="{ 'p-invalid': errors.password }"
            />
            <small v-if="errors.password" class="text-red-500">
              {{ errors.password }}
            </small>
          </div>

          <!-- Error general -->
          <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-lg p-3">
            <p class="text-red-700 text-sm flex items-center">
              <i class="pi pi-exclamation-circle mr-2"></i>
              {{ errorMessage }}
            </p>
          </div>

          <!-- Botón de login -->
          <Button
            type="submit"
            label="Iniciar Sesión"
            icon="pi pi-sign-in"
            :loading="authStore.loading"
            class="w-full"
          />

          <!-- Link a registro -->
          <div class="text-center pt-4 border-t">
            <p class="text-gray-600">
              ¿No tienes cuenta?
              <router-link to="/register" class="text-blue-600 hover:text-blue-700 font-semibold">
                Regístrate aquí
              </router-link>
            </p>
          </div>
        </form>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from 'primevue/usetoast'
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const formData = ref({
  username: '',
  password: ''
})

const errors = ref({
  username: '',
  password: ''
})

const errorMessage = ref('')

// Validar formulario
function validateForm() {
  errors.value = { username: '', password: '' }
  errorMessage.value = ''
  let isValid = true

  if (!formData.value.username || formData.value.username.trim() === '') {
    errors.value.username = 'El usuario es obligatorio'
    isValid = false
  }

  if (!formData.value.password || formData.value.password.trim() === '') {
    errors.value.password = 'La contraseña es obligatoria'
    isValid = false
  }

  return isValid
}

// Manejar login
async function handleLogin() {
  if (!validateForm())
    return

  try {
    await authStore.login({
      username: formData.value.username,
      password: formData.value.password
    })

    toast.add({
      severity: 'success',
      summary: 'Bienvenido',
      detail: `Hola ${authStore.user.fullName}`,
      life: 3000
    })

    // Redirigir al dashboard
    router.push('/')

  } catch (error) {
    errorMessage.value = error.message || 'Error al iniciar sesión'
  }
}
</script>
