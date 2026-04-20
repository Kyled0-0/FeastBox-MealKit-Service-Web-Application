# FeastBox — Testing Strategy

## Philosophy

Test behaviour, not implementation. A test should break when the feature breaks — not when you rename a variable. No coverage thresholds. Happy path + core error cases only.

This is a portfolio project. Tests demonstrate engineering discipline, not exhaustive coverage.

---

## What to Test

| Layer | Test | Why |
|-------|------|-----|
| Composables (`useSearch`, `usePagination`) | Unit tests | Pure logic, no DOM needed, easy to isolate |
| Pinia store actions | Unit tests | API calls + state transitions are the core business logic |
| Express route handlers | Integration tests | Routes are the public contract of the API |
| Auth service (hash, sign, verify) | Unit tests | Security-critical, must be correct |
| Stripe webhook handler | Integration test | Signature verification + state change must work together |

## What NOT to Test

- Bootstrap markup or CSS classes
- Component template structure (brittle, low value)
- Prisma queries directly (test at the route level with a real test DB)
- Vue Router navigation (framework responsibility)
- Pass-through getters in Pinia (they contain no logic)

---

## Test Stack

| Tool | Purpose |
|------|---------|
| Vitest | Test runner — used for both frontend composables and backend routes |
| `@vue/test-utils` | Mount Vue components and composables with reactivity |
| Supertest | HTTP assertions for Express routes |
| Prisma test DB | Real PostgreSQL instance via `DATABASE_URL` in CI |

---

## File Location

Tests live next to the source file they test.

```
src/
  composables/
    useSearch.js
    useSearch.test.js       ← colocated
    usePagination.js
    usePagination.test.js   ← colocated
  stores/
    meals.js
    meals.test.js           ← colocated

server/
  routes/
    auth.js
    auth.test.js            ← colocated
    meals.js
    meals.test.js           ← colocated
  services/
    authService.js
    authService.test.js     ← colocated
```

---

## Frontend Tests

### `useSearch` — unit test

```js
// src/composables/useSearch.test.js
import { describe, it, expect, vi } from 'vitest'
import { ref, nextTick } from 'vue'
import { useSearch } from './useSearch'

describe('useSearch', () => {
  it('returns all items when query is empty', () => {
    const items = ref([{ title: 'Beef Wraps' }, { title: 'Salmon' }])
    const { results } = useSearch(items, ['title'])
    expect(results.value).toHaveLength(2)
  })

  it('filters items by field after debounce', async () => {
    vi.useFakeTimers()
    const items = ref([{ title: 'Beef Wraps' }, { title: 'Salmon' }])
    const { query, results } = useSearch(items, ['title'])

    query.value = 'beef'
    await nextTick()
    vi.advanceTimersByTime(300)
    await nextTick()

    expect(results.value).toHaveLength(1)
    expect(results.value[0].title).toBe('Beef Wraps')
    vi.useRealTimers()
  })

  it('returns empty array when no items match', async () => {
    vi.useFakeTimers()
    const items = ref([{ title: 'Beef Wraps' }])
    const { query, results } = useSearch(items, ['title'])

    query.value = 'pizza'
    await nextTick()
    vi.advanceTimersByTime(300)
    await nextTick()

    expect(results.value).toHaveLength(0)
    vi.useRealTimers()
  })
})
```

### `usePagination` — unit test

```js
// src/composables/usePagination.test.js
import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { usePagination } from './usePagination'

const makeItems = (n) => ref(Array.from({ length: n }, (_, i) => ({ id: i })))

describe('usePagination', () => {
  it('returns first page of items', () => {
    const items = makeItems(20)
    const { paginated } = usePagination(items, 9)
    expect(paginated.value).toHaveLength(9)
    expect(paginated.value[0].id).toBe(0)
  })

  it('advances to next page', () => {
    const items = makeItems(20)
    const { page, paginated, next } = usePagination(items, 9)
    next()
    expect(page.value).toBe(2)
    expect(paginated.value[0].id).toBe(9)
  })

  it('does not advance past last page', () => {
    const items = makeItems(9)
    const { page, next } = usePagination(items, 9)
    next()
    expect(page.value).toBe(1)
  })

  it('resets to page 1 when items change', async () => {
    const items = makeItems(20)
    const { page, next } = usePagination(items, 9)
    next()
    expect(page.value).toBe(2)

    items.value = makeItems(5).value
    await nextTick()
    expect(page.value).toBe(1)
  })
})
```

---

## Backend Tests

### Auth service — unit test

```js
// server/services/authService.test.js
import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword, signAccessToken, verifyAccessToken } from './authService.js'

process.env.JWT_SECRET = 'test-secret'

describe('authService', () => {
  it('hashes and verifies a password', async () => {
    const hash = await hashPassword('Password1!')
    expect(hash).not.toBe('Password1!')
    expect(await verifyPassword('Password1!', hash)).toBe(true)
    expect(await verifyPassword('wrong', hash)).toBe(false)
  })

  it('signs and verifies an access token', () => {
    const token = signAccessToken('user-123')
    const payload = verifyAccessToken(token)
    expect(payload.sub).toBe('user-123')
  })

  it('rejects an invalid token', () => {
    expect(() => verifyAccessToken('bad.token')).toThrow()
  })
})
```

### Meals route — integration test

```js
// server/routes/meals.test.js
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import express from 'express'
import mealsRouter from './meals.js'
import { errorHandler } from '../middleware/errorHandler.js'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const app = express()
app.use(express.json())
app.use('/meals', mealsRouter)
app.use(errorHandler)

let seedMealId

beforeAll(async () => {
  const meal = await prisma.meal.create({
    data: {
      title: 'Test Meal',
      description: 'Test',
      cuisine: 'Test',
      dietary: [],
      imageUrl: 'https://example.com/img.jpg',
      pricePerServing: 6.99
    }
  })
  seedMealId = meal.id
})

afterAll(async () => {
  await prisma.meal.delete({ where: { id: seedMealId } })
  await prisma.$disconnect()
})

describe('GET /meals', () => {
  it('returns an array of meals', async () => {
    const res = await request(app).get('/meals')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })
})

describe('GET /meals/:id', () => {
  it('returns a single meal', async () => {
    const res = await request(app).get(`/meals/${seedMealId}`)
    expect(res.status).toBe(200)
    expect(res.body.id).toBe(seedMealId)
  })

  it('returns 500 for unknown id', async () => {
    const res = await request(app).get('/meals/nonexistent-id')
    expect(res.status).toBe(500)
  })
})
```

---

## Running Tests

```bash
# Backend tests
cd server && npx vitest run

# Frontend tests
npx vitest run

# Watch mode (development)
npx vitest
```

---

## CI Test Environment

Tests in GitHub Actions run against a real PostgreSQL 16 container. The `DATABASE_URL` is injected as an environment variable. No mocking of Prisma queries in integration tests — the goal is to catch real migration or query issues.

See `.github/workflows/ci.yml` for the full CI setup.

---

## Definition of Done

A change is complete when all of the following pass:

1. `npm run build` exits with no errors (frontend)
2. `node server/index.js` starts without errors (backend)
3. New feature works correctly in the browser — golden path tested manually
4. Empty state, loading state, and error state render correctly where applicable
5. No `[Vue warn]` in the browser console
6. No hardcoded secrets or committed `.env` files
7. Tests for new composable or service logic exist and pass (`npx vitest run`)
8. Code review checklist in `docs_foundation/CODE_REVIEW_CHECKLIST.md` passes
