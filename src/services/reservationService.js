import { api } from './api'

export const reservationService = {
  async getAllReservations() {
    return api.get('/reservations')
  },

  async getReservationById(id) {
    return api.get(`/reservations/${id}`)
  },

  async getMyReservations() {
    return api.get('/reservations/my-reservations')
  },

  async getReservationsByUserId(userId) {
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
    const response = await fetch(
      `http://localhost:8081/api/reservations/check-availability?tableId=${tableId}&date=${date}&time=${time}`
    )
    return response.json()
  },

  async createReservation(reservationData) {
    return api.post('/reservations', reservationData)
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
