import { defineStore } from 'pinia'
import { ref } from 'vue'
import { tableService } from '@/services/tableService'

export const useTableStore = defineStore('table', () => {
  const tables = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchTables() {
    loading.value = true
    error.value = null
    try {
      tables.value = await tableService.getAllTables()
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchAvailableTables() {
    loading.value = true
    error.value = null
    try {
      tables.value = await tableService.getAvailableTables()
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function createTable(table) {
    loading.value = true
    error.value = null
    try {
      const newTable = await tableService.createTable(table)
      tables.value.push(newTable)
      return newTable
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateTable(id, table) {
    loading.value = true
    error.value = null
    try {
      const updatedTable = await tableService.updateTable(id, table)
      const index = tables.value.findIndex(t => t.id === id)
      if (index !== -1) {
        tables.value[index] = updatedTable
      }
      return updatedTable
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateTableStatus(id, status) {
    try {
      const updatedTable = await tableService.updateTableStatus(id, status)
      const index = tables.value.findIndex(t => t.id === id)
      if (index !== -1) {
        tables.value[index] = updatedTable
      }
      return updatedTable
    } catch (e) {
      error.value = e.message
      throw e
    }
  }

  async function deleteTable(id) {
    loading.value = true
    error.value = null
    try {
      await tableService.deleteTable(id)
      tables.value = tables.value.filter(t => t.id !== id)
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    tables,
    loading,
    error,
    fetchTables,
    fetchAvailableTables,
    createTable,
    updateTable,
    updateTableStatus,
    deleteTable
  }
})
