import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createApp } from './index.js'

describe('createApp', () => {
  it('returns a usable Express app', () => {
    const app = createApp()
    expect(typeof app.use).toBe('function')
  })

  it('GET /health returns { status: ok }', async () => {
    const res = await request(createApp()).get('/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: 'ok' })
  })
})
