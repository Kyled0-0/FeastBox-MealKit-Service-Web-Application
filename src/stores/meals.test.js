import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// Preserve the real ApiError export (via importOriginal) and only stub the
// `api` object. Matches the vi.mock idiom used in
// server/routes/auth.security.test.js so test assertions see the actual
// class shape — if ApiError gains a field, the mock automatically follows.
vi.mock('@/services/api', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    api: {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn()
    }
  }
})

import { api, ApiError } from '@/services/api'
import { useMeals } from './meals'

describe('useMeals', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('initial state has empty meals, null currentMeal, loading=false, error=null', () => {
    const store = useMeals()
    expect(store.meals).toEqual([])
    expect(store.currentMeal).toBeNull()
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('fetchMeals populates meals on success and clears loading/error', async () => {
    api.get.mockResolvedValue([{ id: 'a', title: 'Beef Wraps' }])
    const store = useMeals()
    await store.fetchMeals()
    // Explicit pageSize=100 (server max) until search moves server-side —
    // see the MENU_PAGE_SIZE comment in meals.js.
    expect(api.get).toHaveBeenCalledWith('/meals?pageSize=100')
    expect(store.meals).toEqual([{ id: 'a', title: 'Beef Wraps' }])
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('fetchMeals sets error {message,status} and resets meals on failure', async () => {
    api.get.mockRejectedValue(new ApiError('Server exploded', { status: 500 }))
    const store = useMeals()
    store.meals = [{ id: 'stale' }]
    await store.fetchMeals()
    expect(store.error).toEqual({ message: 'Server exploded', status: 500 })
    expect(store.meals).toEqual([])
    expect(store.loading).toBe(false)
  })

  it('fetchMeals error preserves status=null for non-ApiError throws', async () => {
    api.get.mockRejectedValue(new Error('Network down'))
    const store = useMeals()
    await store.fetchMeals()
    expect(store.error).toEqual({ message: 'Network down', status: null })
  })

  it('fetchMeals sets loading=true while pending', async () => {
    let resolve
    api.get.mockImplementation(() => new Promise((r) => { resolve = r }))
    const store = useMeals()
    const pending = store.fetchMeals()
    expect(store.loading).toBe(true)
    resolve([])
    await pending
    expect(store.loading).toBe(false)
  })

  it('fetchMeals clears a prior error before re-fetching', async () => {
    api.get.mockRejectedValueOnce(new ApiError('first', { status: 500 }))
    const store = useMeals()
    await store.fetchMeals()
    expect(store.error).toMatchObject({ message: 'first', status: 500 })

    api.get.mockResolvedValueOnce([{ id: 'a' }])
    await store.fetchMeals()
    expect(store.error).toBeNull()
    expect(store.meals).toEqual([{ id: 'a' }])
  })

  it('fetchMeal(id) populates currentMeal on success', async () => {
    api.get.mockResolvedValue({ id: 'b', title: 'Salmon' })
    const store = useMeals()
    await store.fetchMeal('b')
    expect(api.get).toHaveBeenCalledWith('/meals/b')
    expect(store.currentMeal).toEqual({ id: 'b', title: 'Salmon' })
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('fetchMeal clears any prior currentMeal at the start of the call', async () => {
    let resolve
    api.get.mockImplementation(() => new Promise((r) => { resolve = r }))
    const store = useMeals()
    store.currentMeal = { id: 'stale' }
    const pending = store.fetchMeal('b')
    expect(store.currentMeal).toBeNull()
    resolve({ id: 'b' })
    await pending
  })

  it('fetchMeal sets error {message,status:404} on 404 and leaves currentMeal null', async () => {
    api.get.mockRejectedValue(new ApiError('Meal not found', { status: 404 }))
    const store = useMeals()
    await store.fetchMeal('missing')
    expect(store.error).toEqual({ message: 'Meal not found', status: 404 })
    expect(store.currentMeal).toBeNull()
    expect(store.loading).toBe(false)
  })
})
