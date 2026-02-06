import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userService } from '@/services/userService'

export const useUserStore = defineStore('user', () => {
  const users = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchUsers() {
    loading.value = true
    error.value = null
    try {
      users.value = await userService.getAllUsers()
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function createUser(user) {
    loading.value = true
    error.value = null
    try {
      const newUser = await userService.createUser(user)
      users.value.push(newUser)
      return newUser
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateUser(id, user) {
    loading.value = true
    error.value = null
    try {
      const updatedUser = await userService.updateUser(id, user)
      const index = users.value.findIndex(u => u.id === id)
      if (index !== -1) {
        users.value[index] = updatedUser
      }
      return updatedUser
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function deleteUser(id) {
    loading.value = true
    error.value = null
    try {
      await userService.deleteUser(id)
      users.value = users.value.filter(u => u.id !== id)
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Busca un usuario por email
   */
  async function findByEmail(email) {
    const response = await fetch(`http://localhost:8080/api/users/email/${email}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })

    if (!response.ok) {
      throw new Error('Usuario no encontrado')
    }

    return response.json()
  }

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    findByEmail
  }
})
