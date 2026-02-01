const API_BASE_URL = 'http://localhost:8081/api'

/**
 * Obtiene el token JWT del localStorage
 */
function getAuthToken() {
  return localStorage.getItem('token')
}

/**
 * Crea los headers con el token de autenticación
 */
function getAuthHeaders() {
  const token = getAuthToken()
  const headers = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return headers
}

export const api = {
  async get(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      // Si es 401, el token expiró o es inválido
      if (response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
        throw new Error('Sesión expirada')
      }
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    return response.json()
  },

  async post(endpoint, data) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
        throw new Error('Sesión expirada')
      }
      const error = await response.text()
      throw new Error(error || `Error ${response.status}`)
    }

    return response.json()
  },

  async put(endpoint, data) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
        throw new Error('Sesión expirada')
      }
      const error = await response.text()
      throw new Error(error || `Error ${response.status}`)
    }

    return response.json()
  },

  async patch(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
        throw new Error('Sesión expirada')
      }
      throw new Error(`Error ${response.status}`)
    }

    return response.json()
  },

  async delete(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
        throw new Error('Sesión expirada')
      }
      throw new Error(`Error ${response.status}`)
    }
  }
}
