import { ref } from 'vue'
import { defineStore } from 'pinia'
import { api } from '@/services/api'

// Setup Store per CODE_STYLE §5.1. Components consume via
// `storeToRefs(useOrders())` and call actions via direct destructure.
// loading/error follow the §5.5 reset contract.
//
// error shape on failure: { message, status, body } — same as useMeals so
// callers can branch on status. Today's PaymentForm branches:
//   401 → push to /login with notice
//   5xx/408 → friendly "something went wrong on our end" message
//   anything else → error.message (the server's `error` field for 4xx,
//                   or the generic "Invalid input" string for Zod 400s)
//
// Per-field Zod error display (mapping `error.body.details.fieldErrors`
// onto each input's red-text under the field) is NOT implemented yet —
// see EXECUTION_LOG 2026-05-25. The shape carries `body` for that future
// work, but no template binds to it currently. Documenting here so a
// future contributor wiring up field-level errors knows the infrastructure
// already carries the payload.

function toErrorShape(e) {
  return { message: e?.message ?? 'Unknown error', status: e?.status ?? null, body: e?.body ?? null }
}

export const useOrders = defineStore('orders', () => {
  const currentOrder = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function createOrder({ servings, voucher }) {
    loading.value = true
    error.value = null
    try {
      const body = voucher ? { servings, voucher } : { servings }
      currentOrder.value = await api.post('/orders', body)
      return currentOrder.value
    } catch (e) {
      error.value = toErrorShape(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchOrder(id) {
    loading.value = true
    error.value = null
    currentOrder.value = null
    try {
      currentOrder.value = await api.get(`/orders/${id}`)
    } catch (e) {
      error.value = toErrorShape(e)
    } finally {
      loading.value = false
    }
  }

  return { currentOrder, loading, error, createOrder, fetchOrder }
})
