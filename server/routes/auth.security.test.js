import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from '../index.js'
import {
  signTestToken,
  signExpiredToken,
  signWrongSecretToken,
  signNoneAlgToken
} from '../test-utils/auth.js'

// Mock Prisma. Security tests do not require a real database.
// vi.mock is hoisted by Vitest and runs before imports.
// NOTE: client.js exports `prisma` as a named export (see EXECUTION_LOG
// 2026-05-14 Task 5 schema correction), so the mock factory mirrors that shape.
// TODO (Task 11 follow-up): TESTING.md §2 forbids mocking Prisma queries.
// This mock is a documented interim workaround until server/test-utils/db.js
// (per-worker DATABASE_URL, truncateAll, createTestUser) lands with Task 11.
// See EXECUTION_LOG.md 2026-05-18 entry, "Prisma mocking, deferred".
vi.mock('../prisma/client.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn()
    }
  }
}))

// Wrap verifyPassword in a spy while keeping all other authService functions real.
vi.mock('../services/authService.js', async (importOriginal) => {
  const mod = await importOriginal()
  return { ...mod, verifyPassword: vi.fn().mockImplementation(mod.verifyPassword) }
})

import { prisma } from '../prisma/client.js'
import * as authService from '../services/authService.js'

// ─── authenticate middleware ────────────────────────────────────────────────

describe('authenticate middleware', () => {
  let app
  beforeEach(() => {
    app = createApp()
    vi.clearAllMocks()
  })

  it('401 when Authorization header is missing', async () => {
    const res = await request(app).get('/orders')
    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Authorization header required')
  })

  it('401 when header does not start with Bearer', async () => {
    const res = await request(app)
      .get('/orders')
      .set('Authorization', 'Basic dXNlcjpwYXNz')
    expect(res.status).toBe(401)
  })

  it('401 when token signed with wrong secret', async () => {
    const res = await request(app)
      .get('/orders')
      .set('Authorization', `Bearer ${signWrongSecretToken()}`)
    expect(res.status).toBe(401)
  })

  it('401 when token uses alg:none, algorithm pinning control test', async () => {
    const res = await request(app)
      .get('/orders')
      .set('Authorization', `Bearer ${signNoneAlgToken()}`)
    expect(res.status).toBe(401)
  })

  it('401 when token is expired', async () => {
    const res = await request(app)
      .get('/orders')
      .set('Authorization', `Bearer ${signExpiredToken()}`)
    expect(res.status).toBe(401)
  })

  it('passes through to the route with a valid token', async () => {
    const res = await request(app)
      .get('/orders')
      .set('Authorization', `Bearer ${signTestToken()}`)
    expect(res.status).not.toBe(401)
  })
})

// ─── rate limiting on /auth/login ──────────────────────────────────────────

describe('rate limiting on /auth/login', () => {
  let app
  beforeEach(() => {
    app = createApp()
    vi.clearAllMocks()
    prisma.user.findUnique.mockResolvedValue(null)
  })

  it('returns 429 after 5 requests in the 15-min window', async () => {
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'password' })
    }
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password' })
    expect(res.status).toBe(429)
  })
})

// ─── rate limiting on /auth/register ───────────────────────────────────────

describe('rate limiting on /auth/register', () => {
  let app
  let count
  beforeEach(() => {
    app = createApp()
    vi.clearAllMocks()
    count = 0
    prisma.user.findUnique.mockResolvedValue(null)
    prisma.user.create.mockImplementation(() =>
      Promise.resolve({ id: `u${++count}`, email: `u${count}@example.com`, createdAt: new Date() })
    )
  })

  it('returns 429 after 5 requests in the 15-min window', async () => {
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/auth/register')
        .send({ email: `user${i}@example.com`, password: 'password123' })
    }
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'extra@example.com', password: 'password123' })
    expect(res.status).toBe(429)
  })
})

// ─── refresh cookie attributes ─────────────────────────────────────────────

describe('refresh cookie attributes on /auth/register', () => {
  let app
  beforeEach(() => {
    app = createApp()
    vi.clearAllMocks()
    prisma.user.findUnique.mockResolvedValue(null)
    prisma.user.create.mockResolvedValue({
      id: 'user_1',
      email: 'cookie@example.com',
      createdAt: new Date()
    })
  })

  it('sets refreshToken cookie with HttpOnly, SameSite=Strict, Path=/auth/refresh', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'cookie@example.com', password: 'password123' })
    expect(res.status).toBe(201)
    const cookie = res.headers['set-cookie']?.[0] ?? ''
    expect(cookie).toContain('HttpOnly')
    expect(cookie).toContain('SameSite=Strict')
    expect(cookie).toContain('Path=/auth/refresh')
  })
})

// ─── timing parity, email enumeration prevention ───────────────────────────

describe('login timing parity', () => {
  let app
  beforeEach(() => {
    app = createApp()
    vi.clearAllMocks()
  })

  it('calls verifyPassword even when findUnique returns null', async () => {
    prisma.user.findUnique.mockResolvedValue(null)

    await request(app)
      .post('/auth/login')
      .send({ email: 'nobody@example.com', password: 'somepassword' })

    expect(authService.verifyPassword).toHaveBeenCalledOnce()
  })
})

// ─── generic auth failure response ─────────────────────────────────────────

describe('auth failure response', () => {
  let app
  beforeEach(() => {
    app = createApp()
    vi.clearAllMocks()
    prisma.user.findUnique.mockResolvedValue(null)
  })

  it('returns { error: "Invalid credentials" } when email not found', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'nobody@example.com', password: 'anypassword' })
    expect(res.status).toBe(401)
    expect(res.body).toEqual({ error: 'Invalid credentials' })
  })

  it('does not leak which field was wrong', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'nobody@example.com', password: 'anypassword' })
    expect(res.body).not.toHaveProperty('email')
    expect(res.body).not.toHaveProperty('field')
    expect(res.body).not.toHaveProperty('userId')
  })
})
