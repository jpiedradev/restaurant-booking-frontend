import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { reservationService } from '@/services/reservationService'

export const useReservationStore = defineStore('reservation', () => {
  const reservations = ref([])
  const loading = ref(false)
  const error = ref(null)

  const pendingReservations = computed(() =>
    reservations.value.filter(r => r.status === 'PENDING')
  )

  const confirmedReservations = computed(() =>
    reservations.value.filter(r => r.status === 'CONFIRMED')
  )

  const todayReservations = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return reservations.value.filter(r => r.reservationDate === today)
  })

  async function fetchReservations() {
    loading.value = true
    error.value = null
    try {
      reservations.value = await reservationService.getAllReservations()
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchReservationsByDate(date) {
    loading.value = true
    error.value = null
    try {
      reservations.value = await reservationService.getReservationsByDate(date)
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchReservationsBetweenDates(startDate, endDate) {
    loading.value = true
    error.value = null
    try {
      reservations.value = await reservationService.getReservationsBetweenDates(startDate, endDate)
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function createReservation(reservation) {
    loading.value = true
    error.value = null
    try {
      const newReservation = await reservationService.createReservation(reservation)
      reservations.value.unshift(newReservation)
      return newReservation
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateReservationStatus(id, status) {
    try {
      const updatedReservation = await reservationService.updateReservationStatus(id, status)
      const index = reservations.value.findIndex(r => r.id === id)
      if (index !== -1) {
        reservations.value[index] = updatedReservation
      }
      return updatedReservation
    } catch (e) {
      error.value = e.message
      throw e
    }
  }

  async function cancelReservation(id) {
    try {
      const cancelledReservation = await reservationService.cancelReservation(id)
      const index = reservations.value.findIndex(r => r.id === id)
      if (index !== -1) {
        reservations.value[index] = cancelledReservation
      }
      return cancelledReservation
    } catch (e) {
      error.value = e.message
      throw e
    }
  }

  async function deleteReservation(id) {
    loading.value = true
    error.value = null
    try {
      await reservationService.deleteReservation(id)
      reservations.value = reservations.value.filter(r => r.id !== id)
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    reservations,
    loading,
    error,
    pendingReservations,
    confirmedReservations,
    todayReservations,
    fetchReservations,
    fetchReservationsByDate,
    fetchReservationsBetweenDates,
    createReservation,
    updateReservationStatus,
    cancelReservation,
    deleteReservation
  }
})
