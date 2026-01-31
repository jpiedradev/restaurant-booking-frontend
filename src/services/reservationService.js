import { api } from './api'

export const reservationService = {
  async getAllReservations() {
    return api.get('/reservations')
  },

  async getReservationById(id) {
    return api.get(`/reservations/${id}`)
  },

  async getReservationsByUser(userId) {
    return api.get(`/reservations/user/${userId}`)
  },

  async getReservationsByDate(date) {
    return api.get(`/reservations/date/${date}`)
  },

  async getReservationsBetweenDates(startDate, endDate) {
    return api.get(`/reservations/between?startDate=${startDate}&endDate=${endDate}`)
  },

  async getTodayConfirmedReservations() {
    return api.get('/reservations/today/confirmed')
  },

  async checkAvailability(tableId, date, time) {
    return api.get(`/reservations/check-availability?tableId=${tableId}&date=${date}&time=${time}`)
  },

  async createReservation(reservation) {
    return api.post('/reservations', reservation)
  },

  async updateReservationStatus(id, status) {
    return api.patch(`/reservations/${id}/status?status=${status}`)
  },

  async cancelReservation(id) {
    return api.patch(`/reservations/${id}/cancel`)
  },

  async deleteReservation(id) {
    return api.delete(`/reservations/${id}`)
  }
}
