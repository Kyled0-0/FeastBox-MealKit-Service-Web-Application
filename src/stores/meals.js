import { ref } from 'vue'
import { defineStore } from 'pinia'
import { api } from '@/services/api'

// Setup Store per CODE_STYLE.md §5.1. Components consume state via
// `storeToRefs(useMeals())` and call actions via direct destructure.
// `loading`/`error` follow the §5.5 reset contract: each async action sets
// loading=true, error=null, wraps in try/catch/finally.
//
// `error.value` shape on failure: { message, status }. Status is preserved
// (not just the message string) so components can distinguish 404 (show
// empty state) from 5xx (show retry banner) without string-matching.

function toErrorShape(e) {
  return { message: e?.message ?? 'Unknown error', status: e?.status ?? null }
}

export const useMeals = defineStore('meals', () => {
  const meals = ref([])
  const currentMeal = ref(null)
  // Single loading/error refs shared across fetchMeals + fetchMeal. Safe in
  // the Phase 2 consumer pattern (MenuPage and MealPage mount on disjoint
  // routes, so the two actions never overlap). Revisit and split into
  // loadingList/loadingDetail (or a pending-counter pattern) the first time
  // a search-filter or hover-prefetch starts firing both concurrently.
  const loading = ref(false)
  const error = ref(null)

  async function fetchMeals() {
    loading.value = true
    error.value = null
    try {
      meals.value = await api.get('/meals')
    } catch (e) {
      error.value = toErrorShape(e)
      meals.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchMeal(id) {
    loading.value = true
    error.value = null
    // Clear synchronously: when the URL changes to a different meal, showing
    // the previous meal's data during the round-trip is actively misleading.
    // Components should rely on `loading` for the spinner overlay rather than
    // on stale `currentMeal` data.
    currentMeal.value = null
    try {
      currentMeal.value = await api.get(`/meals/${id}`)
    } catch (e) {
      error.value = toErrorShape(e)
    } finally {
      loading.value = false
    }
  }

  return { meals, currentMeal, loading, error, fetchMeals, fetchMeal }
})
