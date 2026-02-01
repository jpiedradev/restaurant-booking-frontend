import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/authService'
import { useRouter } from 'vue-router'

export const useAuthStore = defineStore('auth', () => {
  // Estado
  const user = ref(null)
  const token = ref(null)
  const loading = ref(false)

  // Computed
  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'ADMIN')
  const isStaff = computed(() => user.value?.role === 'STAFF')
  const isCustomer = computed(() => user.value?.role === 'CUSTOMER')

  /**
   * Inicializa el store cargando datos del localStorage
   */
  function initialize() {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')

    if (savedToken && savedUser) {
      token.value = savedToken
      user.value = JSON.parse(savedUser)
    }
  }

  /**
   * Registra un nuevo usuario
   */
  async function register(userData) {
    loading.value = true
    try {
      const response = await authService.register(userData)
      return response
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * Inicia sesión
   */
  async function login(credentials) {
    loading.value = true
    try {
      const response = await authService.login(credentials)

      // Guardar token y usuario
      token.value = response.token
      user.value = {
        id: response.id,
        username: response.username,
        email: response.email,
        fullName: response.fullName,
        role: response.role
      }

      // Persistir en localStorage
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(user.value))

      return response
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * Cierra sesión
   */
  function logout() {
    // Limpiar estado
    user.value = null
    token.value = null

    // Limpiar localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  /**
   * Verifica si un username está disponible
   */
  async function checkUsername(username) {
    return authService.checkUsername(username)
  }

  /**
   * Verifica si un email está disponible
   */
  async function checkEmail(email) {
    return authService.checkEmail(email)
  }

  return {
    // Estado
    user,
    token,
    loading,

    // Computed
    isAuthenticated,
    isAdmin,
    isStaff,
    isCustomer,

    // Acciones
    initialize,
    register,
    login,
    logout,
    checkUsername,
    checkEmail
  }
})
