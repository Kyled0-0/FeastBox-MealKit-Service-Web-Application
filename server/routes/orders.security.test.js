import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from '../index.js'
import { signTestToken } from '../test-utils/auth.js'
import {
  createOrderBodySchema,
  orderParamsSchema,
  MAX_SERVINGS_PER_ORDER
} from '../schemas/orders.schema.js'

// TODO (Task 11 follow-up): TESTING.md §2 forbids mocking Prisma queries.
// Interim workaround mirroring auth.security.test.js and meals.security.test.js
// until server/test-utils/db.js (per-worker DATABASE_URL, truncateAll,
// createTestUser, seedMeals) lands as its own task. See EXECUTION_LOG.md
// 2026-05-18 entry "Prisma mocking, deferred" and the Task 11 EXECUTION_LOG
// entry which carries the TODO forward explicitly.
vi.mock('../prisma/client.js', () => ({
  prisma: {
    meal: {
      findUnique: vi.fn(),
      findFirst: vi.fn()
    },
    order: {
      create: vi.fn(),
      findUnique: vi.fn()
    }
  }
}))

import { prisma } from '../prisma/client.js'

const BOX_MEAL = { id: 'clxbox1234567890abcdefghi', pricePerServingCents: 699 }

// ─── createOrderBodySchema (Zod strict, §6.7 mass-assignment guard) ────────────

describe('createOrderBodySchema', () => {
  it('accepts a minimal valid body', () => {
    const result = createOrderBodySchema.safeParse({ servings: 4 })
    expect(result.success).toBe(true)
    expect(result.data).toEqual({ servings: 4 })
  })

  it('accepts a valid voucher', () => {
    const result = createOrderBodySchema.safeParse({ servings: 2, voucher: 'FEAST20' })
    expect(result.success).toBe(true)
  })

  it('rejects unknown keys (mass-assignment guard) — total, userId, status', () => {
    // Defence in depth, §6.7: even if a future refactor accidentally spreads
    // parsed.data into Prisma's create, .strict() ensures these never arrive.
    expect(createOrderBodySchema.safeParse({ servings: 1, total: 0 }).success).toBe(false)
    expect(createOrderBodySchema.safeParse({ servings: 1, userId: 'someone-else' }).success).toBe(false)
    expect(createOrderBodySchema.safeParse({ servings: 1, status: 'paid' }).success).toBe(false)
  })

  it('rejects unknown voucher codes (whitelist enforcement)', () => {
    expect(createOrderBodySchema.safeParse({ servings: 1, voucher: 'BOGUS' }).success).toBe(false)
  })

  it('rejects servings out of range (DoS guard, §6.10)', () => {
    expect(createOrderBodySchema.safeParse({ servings: 0 }).success).toBe(false)
    expect(createOrderBodySchema.safeParse({ servings: -1 }).success).toBe(false)
    expect(createOrderBodySchema.safeParse({ servings: MAX_SERVINGS_PER_ORDER + 1 }).success).toBe(false)
    expect(createOrderBodySchema.safeParse({ servings: 1.5 }).success).toBe(false)
  })

  it('rejects missing servings', () => {
    expect(createOrderBodySchema.safeParse({}).success).toBe(false)
  })
})

describe('orderParamsSchema', () => {
  it('accepts a valid cuid', () => {
    expect(orderParamsSchema.safeParse({ id: 'clxabc1234567890abcdefghi' }).success).toBe(true)
  })

  it('rejects non-cuid id (consistent 404 surface)', () => {
    expect(orderParamsSchema.safeParse({ id: 'not-a-cuid' }).success).toBe(false)
  })
})

// ─── authentication gate (the orders router uses authenticate middleware) ──

describe('authentication on /orders', () => {
  let app
  beforeEach(() => {
    app = createApp()
    vi.clearAllMocks()
  })

  it('POST /orders without a token returns 401', async () => {
    const res = await request(app).post('/orders').send({ servings: 2 })
    expect(res.status).toBe(401)
    // No DB call made: the auth middleware short-circuits before route handlers.
    expect(prisma.order.create).not.toHaveBeenCalled()
  })

  it('GET /orders/:id without a token returns 401', async () => {
    const res = await request(app).get('/orders/clxabc1234567890abcdefghi')
    expect(res.status).toBe(401)
    expect(prisma.order.findUnique).not.toHaveBeenCalled()
  })

  // The full set of auth-middleware failure modes (wrong secret, alg:none,
  // expired, missing Bearer prefix) is covered by auth.security.test.js
  // against the same /orders endpoint, so duplicating them here would be
  // pure churn — the middleware is shared, not per-route.
})

// ─── POST /orders behaviour ────────────────────────────────────────────────

describe('POST /orders', () => {
  let app
  const userId = 'user_a_id'
  const token = signTestToken({ sub: userId })

  beforeEach(() => {
    app = createApp()
    vi.clearAllMocks()
    prisma.meal.findFirst.mockResolvedValue(BOX_MEAL)
    prisma.order.create.mockImplementation(({ data }) => Promise.resolve({
      id: 'clxord1234567890abcdefghi',
      status: 'pending',
      totalCents: data.totalCents,
      createdAt: new Date('2026-05-25T00:00:00Z'),
      items: [{ id: 'clxitm1234567890abcdefghi', mealId: data.items.create[0].mealId, servings: data.items.create[0].servings }]
    }))
  })

  it('creates an order with server-computed total (no client total trusted)', async () => {
    const res = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ servings: 4 })

    expect(res.status).toBe(201)
    // 4 × 699 = 2796 cents. Computed server-side from the DB price, not from
    // any client input. CODE_REVIEW_CHECKLIST §6.4.
    expect(res.body.totalCents).toBe(2796)
    expect(res.body.status).toBe('pending')
    // userId is excluded from the response shape (the route's `select` omits
    // it, and the GET handler strips it explicitly).
    expect(res.body).not.toHaveProperty('userId')
  })

  it('ignores a client-submitted total via .strict() rejection (control test)', async () => {
    // The schema rejects unknown keys outright. If a future refactor relaxed
    // .strict(), this test would still catch the regression because the
    // computed total below would be derived from `servings` alone (2 × 699
    // = 1398), not the attacker-supplied 1.
    const res = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ servings: 2, totalCents: 1, total: 1 })

    expect(res.status).toBe(400)
    expect(prisma.order.create).not.toHaveBeenCalled()
  })

  it('ignores a client-submitted userId (cannot place orders for someone else)', async () => {
    const res = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ servings: 1, userId: 'someone-else' })

    expect(res.status).toBe(400)
    expect(prisma.order.create).not.toHaveBeenCalled()
  })

  it('applies the FEAST20 voucher server-side', async () => {
    const res = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ servings: 5, voucher: 'FEAST20' })

    // Subtotal 5 × 699 = 3495. After 20% discount: round(3495 × 0.8) = 2796.
    expect(res.status).toBe(201)
    expect(res.body.totalCents).toBe(2796)
  })

  it('uses req.user.sub for userId, not anything from the body', async () => {
    await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ servings: 1 })

    expect(prisma.order.create).toHaveBeenCalledTimes(1)
    const call = prisma.order.create.mock.calls[0][0]
    expect(call.data.userId).toBe(userId)
  })

  it('rejects oversized servings (DoS guard)', async () => {
    const res = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ servings: MAX_SERVINGS_PER_ORDER + 1 })

    expect(res.status).toBe(400)
    expect(prisma.order.create).not.toHaveBeenCalled()
  })
})

// ─── GET /orders/:id — IDOR check ─────────────────────────────────────────

describe('GET /orders/:id IDOR guard', () => {
  let app
  const userA = 'user_a_id'
  const userB = 'user_b_id'
  const tokenA = signTestToken({ sub: userA })

  beforeEach(() => {
    app = createApp()
    vi.clearAllMocks()
  })

  it("404s when User A requests User B's order (no existence oracle)", async () => {
    // The order exists in the DB but belongs to userB. User A must NOT be
    // able to distinguish "not yours" from "does not exist" — same 404 in
    // both branches. CODE_REVIEW_CHECKLIST §6.
    prisma.order.findUnique.mockResolvedValue({
      id: 'clxord1234567890abcdefghi',
      userId: userB,
      status: 'pending',
      totalCents: 1000,
      createdAt: new Date('2026-05-25T00:00:00Z'),
      items: []
    })

    const res = await request(app)
      .get('/orders/clxord1234567890abcdefghi')
      .set('Authorization', `Bearer ${tokenA}`)

    expect(res.status).toBe(404)
    expect(res.body.error).toBe('Order not found')
  })

  it('200 with the order when User A requests their own order', async () => {
    prisma.order.findUnique.mockResolvedValue({
      id: 'clxord1234567890abcdefghi',
      userId: userA,
      status: 'pending',
      totalCents: 1000,
      createdAt: new Date('2026-05-25T00:00:00Z'),
      items: []
    })

    const res = await request(app)
      .get('/orders/clxord1234567890abcdefghi')
      .set('Authorization', `Bearer ${tokenA}`)

    expect(res.status).toBe(200)
    expect(res.body.id).toBe('clxord1234567890abcdefghi')
    // userId stripped from the response.
    expect(res.body).not.toHaveProperty('userId')
  })

  it('404s when the order does not exist', async () => {
    prisma.order.findUnique.mockResolvedValue(null)

    const res = await request(app)
      .get('/orders/clxord1234567890abcdefghi')
      .set('Authorization', `Bearer ${tokenA}`)

    expect(res.status).toBe(404)
  })

  it('404s for a non-cuid id without hitting the DB', async () => {
    const res = await request(app)
      .get('/orders/not-a-cuid')
      .set('Authorization', `Bearer ${tokenA}`)

    expect(res.status).toBe(404)
    expect(prisma.order.findUnique).not.toHaveBeenCalled()
  })
})
