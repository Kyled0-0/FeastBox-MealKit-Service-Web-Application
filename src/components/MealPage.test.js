import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createPinia, setActivePinia } from 'pinia'

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
import MealPage from './MealPage.vue'

const seededMeal = {
  id: 'cuid-abc',
  title: 'Fast Peppered Beef Wraps',
  nameExtend: 'with Chimichurri Tomato and Aioli',
  cuisine: 'Latin American',
  tags: ['FAST', 'MEAT'],
  imageUrl: '/img/meals/beefwraps/beef-wraps.jpeg',
  description: 'These wraps are a perfect blend of tender, juicy steak strips.',
  pricePerServingCents: 1200,
  nutriFacts: { caloriesKcal: 820, proteinG: 41.1, carbsG: 44.7, fatG: 52 },
  ingredients: [
    { name: '50g aioli mayonnaise', image: '/img/meals/beefwraps/aioli-mayo.jpg' },
    { name: 'beef stir-fry', image: '/img/meals/beefwraps/beef-stirfry.jpg' }
  ],
  steps: [
    {
      title: '1. Prep ingredients',
      image: '/img/meals/beefwraps/step1.jpeg',
      stepText: 'Finely chop the <span>onion</span> and <span>parsley</span>.'
    }
  ]
}

const mountMealPage = (mealID = 'cuid-abc') =>
  mount(MealPage, {
    props: { mealID },
    global: {
      stubs: { 'router-link': { template: '<a><slot /></a>' } }
    }
  })

describe('MealPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('calls api.get("/meals/:id") on mount with the route param', async () => {
    api.get.mockResolvedValue(seededMeal)
    mountMealPage('cuid-abc')
    await flushPromises()
    expect(api.get).toHaveBeenCalledWith('/meals/cuid-abc')
  })

  it('renders the loading spinner while the detail fetch is pending', async () => {
    let resolve
    api.get.mockImplementation(() => new Promise((r) => { resolve = r }))
    const wrapper = mountMealPage()
    await nextTick()
    expect(wrapper.find('.spinner-border').exists()).toBe(true)
    resolve(seededMeal)
    await flushPromises()
    expect(wrapper.find('.spinner-border').exists()).toBe(false)
  })

  it('renders a "not found" message + a Back to menu link when the API responds 404', async () => {
    const { ApiError } = await import('@/services/api')
    api.get.mockRejectedValue(new ApiError('Meal not found', { status: 404 }))
    const wrapper = mountMealPage('missing')
    await flushPromises()
    expect(wrapper.text()).toMatch(/meal not found/i)
    expect(wrapper.text()).toMatch(/back to menu/i)
    // A 404 should NOT display the generic red error banner.
    expect(wrapper.find('.alert-danger').exists()).toBe(false)
  })

  it('renders the red error banner when the API responds 5xx', async () => {
    const { ApiError } = await import('@/services/api')
    api.get.mockRejectedValue(new ApiError('Boom', { status: 500 }))
    const wrapper = mountMealPage()
    await flushPromises()
    const banner = wrapper.find('.alert-danger')
    expect(banner.exists()).toBe(true)
    expect(banner.text()).toContain('Boom')
  })

  it('"Try again" on the error banner refetches the same mealID', async () => {
    const { ApiError } = await import('@/services/api')
    api.get.mockRejectedValueOnce(new ApiError('Boom', { status: 500 }))
    const wrapper = mountMealPage('cuid-abc')
    await flushPromises()
    expect(wrapper.find('.alert-danger').exists()).toBe(true)
    expect(api.get).toHaveBeenCalledTimes(1)
    expect(api.get).toHaveBeenLastCalledWith('/meals/cuid-abc')

    api.get.mockResolvedValueOnce(seededMeal)
    await wrapper.find('.alert-danger button').trigger('click')
    await flushPromises()
    expect(api.get).toHaveBeenCalledTimes(2)
    expect(api.get).toHaveBeenLastCalledWith('/meals/cuid-abc')
    expect(wrapper.find('.alert-danger').exists()).toBe(false)
    expect(wrapper.find('h2').text()).toBe('Fast Peppered Beef Wraps')
  })

  it('renders meal heading, nameExtend, and tags', async () => {
    api.get.mockResolvedValue(seededMeal)
    const wrapper = mountMealPage()
    await flushPromises()
    expect(wrapper.find('h2').text()).toBe('Fast Peppered Beef Wraps')
    expect(wrapper.text()).toContain('with Chimichurri Tomato and Aioli')
    const tags = wrapper.findAll('#description li').map((el) => el.text())
    expect(tags).toEqual(['FAST', 'MEAT'])
  })

  it('renders nutritional facts as an object (caloriesKcal, proteinG, carbsG, fatG)', async () => {
    api.get.mockResolvedValue(seededMeal)
    const wrapper = mountMealPage()
    await flushPromises()
    const nutri = wrapper.find('#nutri').text()
    expect(nutri).toContain('820')
    expect(nutri).toContain('41.1')
    expect(nutri).toContain('44.7')
    expect(nutri).toContain('52')
  })

  it('renders ingredients with new field shape (name + image)', async () => {
    api.get.mockResolvedValue(seededMeal)
    const wrapper = mountMealPage()
    await flushPromises()
    const items = wrapper.findAll('.ingredient-container')
    expect(items).toHaveLength(2)
    expect(items[0].text()).toContain('50g aioli mayonnaise')
    expect(items[0].find('img').attributes('src')).toBe('/img/meals/beefwraps/aioli-mayo.jpg')
  })

  it('renders steps via v-html so DOMPurify-sanitised <span> highlights render', async () => {
    api.get.mockResolvedValue(seededMeal)
    const wrapper = mountMealPage()
    await flushPromises()
    const stepBody = wrapper.find('.card-text')
    // The seed sanitises stepText through DOMPurify (server-side), so the
    // <span> survives in the API payload. v-html must render it as an actual
    // element, not as escaped text.
    expect(stepBody.html()).toContain('<span>onion</span>')
    expect(stepBody.find('span').exists()).toBe(true)
  })
})
