import { api } from './api'

export const userService = {
  async getAllUsers() {
    return api.get('/users')
  },

  async getUserById(id) {
    return api.get(`/users/${id}`)
  },

  async getUserByEmail(email) {
    return api.get(`/users/email/${email}`)
  },

  async createUser(user) {
    return api.post('/users', user)
  },

  async updateUser(id, user) {
    return api.put(`/users/${id}`, user)
  },

  async deleteUser(id) {
    return api.delete(`/users/${id}`)
  }
}
