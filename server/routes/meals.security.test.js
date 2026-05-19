import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from '../index.js'
import {
  sanitiseStepText,
  sanitiseMealSteps
} from '../services/sanitiseMealContent.js'
import {
  mealParamsSchema,
  mealsQuerySchema,
  MEALS_PAGE_SIZE_MAX
} from '../schemas/meals.schema.js'

// TODO (Task 11 follow-up): TESTING.md §2 forbids mocking Prisma queries.
// Interim workaround matching auth.security.test.js until server/test-utils/db.js
// (per-worker DATABASE_URL, truncateAll, seedMeals) lands with Task 11.
// See EXECUTION_LOG.md 2026-05-18 entry "Prisma mocking, deferred".
vi.mock('../prisma/client.js', () => ({
  prisma: {
    meal: {
      findMany: vi.fn(),
      findUnique: vi.fn()
    }
  }
}))

import { prisma } from '../prisma/client.js'

// ─── stepText sanitisation (XSS gate) ───────────────────────────────────────

describe('sanitiseStepText', () => {
  it('strips <script> tags entirely', () => {
    const dirty = '<script>window.__xss__=true</script><strong>safe</strong>'
    const clean = sanitiseStepText(dirty)
    expect(clean).not.toMatch(/<script/i)
    expect(clean).not.toMatch(/__xss__/)
    expect(clean).toContain('<strong>safe</strong>')
  })

  it('strips event handler attributes', () => {
    const dirty = '<span onclick="alert(1)">click</span>'
    const clean = sanitiseStepText(dirty)
    expect(clean).not.toMatch(/onclick/i)
    expect(clean).toContain('<span>click</span>')
  })

  it('strips disallowed tags like <img> and <iframe>', () => {
    const dirty = '<img src=x onerror=alert(1)><iframe src="evil"></iframe>'
    const clean = sanitiseStepText(dirty)
    expect(clean).not.toMatch(/<img/i)
    expect(clean).not.toMatch(/<iframe/i)
    expect(clean).not.toMatch(/onerror/i)
  })

  it('preserves allowed <span> and <strong>', () => {
    const input = 'Add <span>onion</span> and <strong>2 tsp salt</strong>.'
    expect(sanitiseStepText(input)).toBe(input)
  })
})

describe('sanitiseMealSteps', () => {
  it('sanitises stepText for every step and preserves other fields', () => {
    const input = [
      { title: '1. Prep', image: '/img/a.jpg', stepText: '<script>x</script><span>onion</span>' },
      { title: '2. Cook', image: '/img/b.jpg', stepText: '<iframe></iframe><strong>hot</strong>' }
    ]
    const out = sanitiseMealSteps(input)
    expect(out).toHaveLength(2)
    expect(out[0].stepText).not.toMatch(/<script/i)
    expect(out[0].stepText).toContain('<span>onion</span>')
    expect(out[1].stepText).not.toMatch(/<iframe/i)
    expect(out[1].stepText).toContain('<strong>hot</strong>')
    expect(out[0].title).toBe('1. Prep')
    expect(out[0].image).toBe('/img/a.jpg')
  })
})

// ─── mealParamsSchema (Zod strict mode, §6.7) ───────────────────────────────

describe('mealParamsSchema', () => {
  it('accepts a valid cuid', () => {
    const result = mealParamsSchema.safeParse({ id: 'clxabc1234567890abcdefghi' })
    expect(result.success).toBe(true)
  })

  // Defence in depth. Express only populates req.params with keys declared in
  // the route pattern, so an attacker cannot actually inject unknown keys via
  // URL params; .strict() here keeps the schema's contract consistent across
  // call sites. The §6.7 mass-assignment surface lives on body schemas (Task 11).
  it('rejects unknown keys (strict mode, schema-level contract)', () => {
    const result = mealParamsSchema.safeParse({
      id: 'clxabc1234567890abcdefghi',
      isAdmin: true
    })
    expect(result.success).toBe(false)
  })

  it('rejects non-cuid id', () => {
    expect(mealParamsSchema.safeParse({ id: 'not-a-cuid' }).success).toBe(false)
    expect(mealParamsSchema.safeParse({ id: '' }).success).toBe(false)
  })
})

// ─── mealsQuerySchema (pagination bounds, §6.10) ────────────────────────────

describe('mealsQuerySchema', () => {
  it('defaults page=1 and pageSize=25 when query is empty', () => {
    const result = mealsQuerySchema.safeParse({})
    expect(result.success).toBe(true)
    expect(result.data).toEqual({ page: 1, pageSize: 25 })
  })

  it('rejects pageSize over the max', () => {
    const result = mealsQuerySchema.safeParse({ pageSize: String(MEALS_PAGE_SIZE_MAX + 1) })
    expect(result.success).toBe(false)
  })

  it('rejects negative or zero pageSize', () => {
    expect(mealsQuerySchema.safeParse({ pageSize: '0' }).success).toBe(false)
    expect(mealsQuerySchema.safeParse({ pageSize: '-5' }).success).toBe(false)
  })

  it('rejects unknown query keys (strict mode)', () => {
    expect(mealsQuerySchema.safeParse({ orderBy: 'price' }).success).toBe(false)
  })
})

// ─── routes ─────────────────────────────────────────────────────────────────

describe('GET /meals', () => {
  let app
  beforeEach(() => {
    app = createApp()
    vi.clearAllMocks()
  })

  it('returns 200 with an array of meals', async () => {
    prisma.meal.findMany.mockResolvedValue([
      { id: 'clxabc1234567890abcdefghi', title: 'Beef Wraps' }
    ])
    const res = await request(app).get('/meals')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body).toHaveLength(1)
  })

  it('rejects pageSize over the bound (DoS guard, §6.10)', async () => {
    const res = await request(app).get(`/meals?pageSize=${MEALS_PAGE_SIZE_MAX + 1}`)
    expect(res.status).toBe(400)
    expect(prisma.meal.findMany).not.toHaveBeenCalled()
  })

  it('uses skip/take derived from page+pageSize', async () => {
    prisma.meal.findMany.mockResolvedValue([])
    await request(app).get('/meals?page=3&pageSize=10')
    const args = prisma.meal.findMany.mock.calls[0][0]
    expect(args.skip).toBe(20)
    expect(args.take).toBe(10)
  })
})

describe('GET /meals/:id', () => {
  let app
  beforeEach(() => {
    app = createApp()
    vi.clearAllMocks()
  })

  it('returns 200 with one meal when found', async () => {
    const id = 'clxabc1234567890abcdefghi'
    prisma.meal.findUnique.mockResolvedValue({ id, title: 'Beef Wraps' })
    const res = await request(app).get(`/meals/${id}`)
    expect(res.status).toBe(200)
    expect(res.body.id).toBe(id)
  })

  it('returns 404 when id is not a valid cuid (no internal format leak)', async () => {
    const res = await request(app).get('/meals/not-a-cuid')
    expect(res.status).toBe(404)
    expect(prisma.meal.findUnique).not.toHaveBeenCalled()
  })

  it('returns 404 when meal does not exist', async () => {
    prisma.meal.findUnique.mockResolvedValue(null)
    const res = await request(app).get('/meals/clxabc1234567890abcdefghi')
    expect(res.status).toBe(404)
  })
})
