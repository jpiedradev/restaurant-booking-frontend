import { api } from './api'

export const tableService = {
  async getAllTables() {
    return api.get('/tables')
  },

  async getTableById(id) {
    return api.get(`/tables/${id}`)
  },

  async getAvailableTables() {
    return api.get('/tables/available')
  },

  async getAvailableTablesByCapacity(guests) {
    return api.get(`/tables/available/${guests}`)
  },

  async createTable(table) {
    return api.post('/tables', table)
  },

  async updateTable(id, table) {
    return api.put(`/tables/${id}`, table)
  },

  async updateTableStatus(id, status) {
    return api.patch(`/tables/${id}/status?status=${status}`)
  },

  async deleteTable(id) {
    return api.delete(`/tables/${id}`)
  }
}
