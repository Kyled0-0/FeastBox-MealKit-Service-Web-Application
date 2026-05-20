import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createPinia, setActivePinia } from 'pinia'

// Mock the HTTP boundary (matches the idiom in stores/meals.test.js). The
// store under test is the real `useMeals`; only the network call is stubbed.
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

import { api } from '@/services/api'
import { useMeals } from '@/stores/meals'
import MenuPage from './MenuPage.vue'

const mountMenu = () =>
  mount(MenuPage, {
    global: {
      // No router is registered in the test env; stub the <router-link>
      // emitted by MealCard so mounting doesn't warn / fail.
      stubs: { 'router-link': { template: '<a><slot /></a>' } }
    }
  })

describe('MenuPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('calls api.get("/meals?pageSize=100") on mount via the store action', async () => {
    // The store requests the server-side max pageSize (see meals.js comment)
    // so the client-side search/pagination operates on the full catalogue.
    api.get.mockResolvedValue([])
    mountMenu()
    await flushPromises()
    expect(api.get).toHaveBeenCalledWith('/meals?pageSize=100')
  })

  it('renders a Bootstrap spinner while the fetch is pending', async () => {
    let resolve
    api.get.mockImplementation(() => new Promise((r) => { resolve = r }))
    const wrapper = mountMenu()
    // onMounted fires fetchMeals → loading=true sync, but the render is
    // batched. Flush one tick so the template reflects the new state.
    await nextTick()
    expect(wrapper.find('.spinner-border').exists()).toBe(true)
    resolve([])
    await flushPromises()
    expect(wrapper.find('.spinner-border').exists()).toBe(false)
  })

  it('renders an error banner with the message when fetch fails with 5xx', async () => {
    const { ApiError } = await import('@/services/api')
    api.get.mockRejectedValue(new ApiError('Database is down', { status: 500 }))
    const wrapper = mountMenu()
    await flushPromises()
    const banner = wrapper.find('[role="alert"]')
    expect(banner.exists()).toBe(true)
    expect(banner.text()).toContain('Database is down')
  })

  it('"Try again" button re-invokes the store action and recovers from a transient error', async () => {
    const { ApiError } = await import('@/services/api')
    api.get.mockRejectedValueOnce(new ApiError('Boom', { status: 500 }))
    const wrapper = mountMenu()
    await flushPromises()
    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
    expect(api.get).toHaveBeenCalledTimes(1)

    api.get.mockResolvedValueOnce([
      { id: 'a', title: 'Beef Wraps', nameExtend: 'with Aioli', imageUrl: '/x.jpg' }
    ])
    await wrapper.find('[role="alert"] button').trigger('click')
    await flushPromises()
    expect(api.get).toHaveBeenCalledTimes(2)
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.findAll('.card-title').map((el) => el.text())).toEqual(['Beef Wraps'])
  })

  it('renders the empty-state message when the API returns no meals', async () => {
    api.get.mockResolvedValue([])
    const wrapper = mountMenu()
    await flushPromises()
    expect(wrapper.text()).toMatch(/no meals/i)
  })

  it('renders one MealCard per meal returned by the API', async () => {
    api.get.mockResolvedValue([
      { id: 'a', title: 'Beef Wraps', nameExtend: 'with Aioli', imageUrl: '/img/meals/beefwraps/beef-wraps.jpeg' },
      { id: 'b', title: 'Salmon', nameExtend: 'with Rice', imageUrl: '/img/meals/sesamesalmon/sesame_salmon.jpeg' }
    ])
    const wrapper = mountMenu()
    await flushPromises()
    const titles = wrapper.findAll('.card-title').map((el) => el.text())
    expect(titles).toEqual(['Beef Wraps', 'Salmon'])
  })

  it('re-renders when store state changes after mount (storeToRefs reactivity)', async () => {
    // Regression test for the CODE_STYLE.md §5.2 silent killer: if a future
    // contributor swaps `storeToRefs(useMeals())` for plain destructuring,
    // the component will not update when the store mutates. This test
    // mounts with an empty list, then mutates the store directly and
    // asserts the DOM picks up the change.
    api.get.mockResolvedValue([])
    const wrapper = mountMenu()
    await flushPromises()
    expect(wrapper.findAll('.card-title')).toHaveLength(0)

    const store = useMeals()
    store.meals = [
      { id: 'a', title: 'Beef Wraps', nameExtend: 'with Aioli', imageUrl: '/x.jpg' }
    ]
    await nextTick()
    const titles = wrapper.findAll('.card-title').map((el) => el.text())
    expect(titles).toEqual(['Beef Wraps'])
  })

  it('search matches only the title (not the invisible nameExtend/description)', async () => {
    // Locks in CODE_STYLE.md "next person in six months" criterion: typing a
    // word visible nowhere on the card and getting results is the UX bug.
    vi.useFakeTimers()
    api.get.mockResolvedValue([
      { id: 'a', title: 'Beef Wraps', nameExtend: 'with Aioli', imageUrl: '/x.jpg' },
      { id: 'b', title: 'Veggie Bowl', nameExtend: 'with Tortillas', imageUrl: '/y.jpg' }
    ])
    const wrapper = mountMenu()
    await vi.advanceTimersByTimeAsync(0)
    await nextTick()
    // 'aioli' lives only in nameExtend; 'tortillas' lives only in nameExtend.
    // Neither should match — the cards do not render those words.
    await wrapper.find('input[type="text"]').setValue('aioli')
    await vi.advanceTimersByTimeAsync(350)
    await nextTick()
    expect(wrapper.findAll('.card-title')).toHaveLength(0)
    expect(wrapper.text()).toMatch(/no meals found/i)
    vi.useRealTimers()
  })

  it('search input filters cards by title (store meals ref wired into useSearch)', async () => {
    vi.useFakeTimers()
    api.get.mockResolvedValue([
      { id: 'a', title: 'Beef Wraps', nameExtend: 'with Aioli', imageUrl: '/x.jpg' },
      { id: 'b', title: 'Sticky Chicken Wings', nameExtend: 'with Rice', imageUrl: '/y.jpg' }
    ])
    const wrapper = mountMenu()
    // flushPromises hangs on fake timers; advance + tick manually.
    await vi.advanceTimersByTimeAsync(0)
    await nextTick()
    await wrapper.find('input[type="text"]').setValue('chicken')
    // useSearch debounces input by 300ms.
    await vi.advanceTimersByTimeAsync(350)
    await nextTick()
    const titles = wrapper.findAll('.card-title').map((el) => el.text())
    expect(titles).toEqual(['Sticky Chicken Wings'])
    vi.useRealTimers()
  })
})
