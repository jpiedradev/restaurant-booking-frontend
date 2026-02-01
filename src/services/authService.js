import { api } from './api'

export const authService = {
  /**
   * Registra un nuevo usuario
   */
  async register(userData) {
    const response = await fetch('http://localhost:8081/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Error al registrar usuario')
    }

    return response.json()
  },

  /**
   * Inicia sesión
   */
  async login(credentials) {
    const response = await fetch('http://localhost:8081/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Error al iniciar sesión')
    }

    return response.json()
  },

  /**
   * Verifica si un username está disponible
   */
  async checkUsername(username) {
    const response = await fetch(
      `http://localhost:8081/api/auth/check-username?username=${username}`
    )
    const data = await response.json()
    return data.available
  },

  /**
   * Verifica si un email está disponible
   */
  async checkEmail(email) {
    const response = await fetch(
      `http://localhost:8081/api/auth/check-email?email=${email}`
    )
    const data = await response.json()
    return data.available
  }
}
