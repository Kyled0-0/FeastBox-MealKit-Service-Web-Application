import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { api, ApiError } from './api'

function mockResponse({ ok = true, status = 200, jsonBody = null, contentType = 'application/json' } = {}) {
  return {
    ok,
    status,
    headers: {
      get: (name) => (name.toLowerCase() === 'content-type' ? contentType : null)
    },
    json: () => Promise.resolve(jsonBody)
  }
}

describe('api', () => {
  let fetchSpy
  let storage

  beforeEach(() => {
    fetchSpy = vi.fn()
    // happy-dom 20.9.0 ships a Storage instance whose `clear` and
    // `removeItem` methods throw "not a function" in this Vitest env (env
    // appears to skip happy-dom's normal storage init). Stub a Map-backed
    // shim so tests are deterministic. Re-run all tests in this file with
    // the stub removed when happy-dom is upgraded; delete the stub if the
    // native one starts working.
    storage = new Map()
    vi.stubGlobal('localStorage', {
      getItem: (k) => (storage.has(k) ? storage.get(k) : null),
      setItem: (k, v) => storage.set(k, String(v)),
      removeItem: (k) => storage.delete(k),
      clear: () => storage.clear()
    })
    vi.stubGlobal('fetch', fetchSpy)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it('GET hits VITE_API_URL + path with JSON Accept header', async () => {
    fetchSpy.mockResolvedValue(mockResponse({ jsonBody: [{ id: '1' }] }))
    const result = await api.get('/meals')
    expect(result).toEqual([{ id: '1' }])
    const [url, init] = fetchSpy.mock.calls[0]
    expect(url).toMatch(/\/meals$/)
    expect(init.method).toBe('GET')
    expect(init.headers.Accept).toBe('application/json')
  })

  it('omits Authorization header when no token is stored', async () => {
    fetchSpy.mockResolvedValue(mockResponse({ jsonBody: [] }))
    await api.get('/meals')
    const [, init] = fetchSpy.mock.calls[0]
    expect(init.headers.Authorization).toBeUndefined()
  })

  it('injects Bearer Authorization header when accessToken is stored', async () => {
    localStorage.setItem('accessToken', 'tok_abc')
    fetchSpy.mockResolvedValue(mockResponse({ jsonBody: [] }))
    await api.get('/meals')
    const [, init] = fetchSpy.mock.calls[0]
    expect(init.headers.Authorization).toBe('Bearer tok_abc')
  })

  it('POST sends JSON body and Content-Type', async () => {
    fetchSpy.mockResolvedValue(mockResponse({ status: 201, jsonBody: { id: 'x' } }))
    await api.post('/orders', { servings: 4 })
    const [, init] = fetchSpy.mock.calls[0]
    expect(init.method).toBe('POST')
    expect(init.headers['Content-Type']).toBe('application/json')
    expect(JSON.parse(init.body)).toEqual({ servings: 4 })
  })

  it('POST without a body omits Content-Type and request body (e.g. /auth/refresh)', async () => {
    fetchSpy.mockResolvedValue(mockResponse({ jsonBody: { accessToken: 'x' } }))
    await api.post('/auth/refresh')
    const [, init] = fetchSpy.mock.calls[0]
    expect(init.method).toBe('POST')
    expect(init.body).toBeUndefined()
    expect(init.headers['Content-Type']).toBeUndefined()
  })

  it('throws ApiError with status and parsed body on non-2xx', async () => {
    fetchSpy.mockResolvedValue(
      mockResponse({ ok: false, status: 404, jsonBody: { error: 'Meal not found' } })
    )
    await expect(api.get('/meals/missing')).rejects.toMatchObject({
      name: 'ApiError',
      status: 404,
      message: 'Meal not found',
      body: { error: 'Meal not found' }
    })
  })

  it('throws ApiError with a generic message when server returns no JSON body', async () => {
    fetchSpy.mockResolvedValue(mockResponse({ ok: false, status: 500, contentType: 'text/plain' }))
    await expect(api.get('/meals')).rejects.toMatchObject({
      name: 'ApiError',
      status: 500,
      message: 'Request failed with status 500'
    })
  })

  it('sends credentials: include so the refreshToken cookie is sent', async () => {
    fetchSpy.mockResolvedValue(mockResponse({ jsonBody: [] }))
    await api.get('/meals')
    const [, init] = fetchSpy.mock.calls[0]
    expect(init.credentials).toBe('include')
  })

  it('ApiError instanceof Error', () => {
    const err = new ApiError('x', { status: 400, body: null })
    expect(err).toBeInstanceOf(Error)
    expect(err.status).toBe(400)
  })

  it('prepends VITE_API_URL to the path when set', async () => {
    vi.stubEnv('VITE_API_URL', 'https://api.test.example')
    fetchSpy.mockResolvedValue(mockResponse({ jsonBody: [] }))
    await api.get('/meals')
    expect(fetchSpy.mock.calls[0][0]).toBe('https://api.test.example/meals')
  })

  it('strips a trailing slash from VITE_API_URL so the join produces no double-slash', async () => {
    vi.stubEnv('VITE_API_URL', 'https://api.test.example/')
    fetchSpy.mockResolvedValue(mockResponse({ jsonBody: [] }))
    await api.get('/meals')
    expect(fetchSpy.mock.calls[0][0]).toBe('https://api.test.example/meals')
  })

  it('maps AbortError (from fetch timeout) to ApiError(408 Request timed out)', async () => {
    // We don't exercise the actual setTimeout/AbortController dance; that's
    // platform behaviour. What matters is that when fetch rejects with an
    // AbortError (which is what the controller produces), the wrapper
    // translates that into a 408 ApiError with the right message.
    fetchSpy.mockImplementation(() => {
      const err = new Error('The operation was aborted.')
      err.name = 'AbortError'
      return Promise.reject(err)
    })
    await expect(api.get('/meals')).rejects.toMatchObject({
      name: 'ApiError',
      status: 408,
      message: 'Request timed out'
    })
  })

  it('passes a non-Abort fetch rejection through unchanged', async () => {
    fetchSpy.mockRejectedValue(new TypeError('NetworkError'))
    await expect(api.get('/meals')).rejects.toMatchObject({
      name: 'TypeError',
      message: 'NetworkError'
    })
  })
})
