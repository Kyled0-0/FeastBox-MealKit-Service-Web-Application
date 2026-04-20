# FeastBox Fullstack Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade FeastBox from a Vue 3 SPA with mock data into a production-ready fullstack meal-kit platform (Marley Spoon replica) suitable as a portfolio piece for Melbourne IT internship applications.

**Architecture:** Vue 3 frontend (Vercel) communicates via REST with an Express + PostgreSQL backend (Railway). All meal data, auth, and orders move from hardcoded refs to real API calls backed by a relational database. Three deployment phases: frontend cleanup → backend + database → containerisation + CI/CD.

**Tech Stack:** Vue 3 + Vite + Pinia + Vue Router + Bootstrap 5 (frontend) · Node.js + Express + Prisma + PostgreSQL + JWT + Stripe (backend) · Docker + GitHub Actions (infrastructure) · Vercel (frontend hosting) · Railway (backend + DB hosting)

---

## Cross-Check Standard

Every change in this plan has been validated against its tool's official standards:

| Layer | Authority |
|---|---|
| Vue 3 composables | Composition API docs — `watch`/`watchEffect`, `onCleanup`, `<script setup>` |
| Pinia | Pinia docs — Setup Store, `storeToRefs`, actions-only mutations |
| Vue Router 4 | Lazy loading, route meta, navigation guards |
| Vite | `base` path config, plugin setup |
| Express | Router separation, middleware order, error handler placement |
| Prisma | Schema syntax, migration commands, parameterised queries |
| JWT / Auth | OWASP — short-lived access tokens, httpOnly refresh cookies |
| Stripe | Webhook signature verification, idempotency keys |
| Docker | Layer caching, non-root user |
| GitHub Actions | Job dependencies, secrets handling, caching |

---

## File Map

### Phase 0 — New files
```
src/
  composables/
    useSearch.js       — debounced multi-field search composable
    usePagination.js   — page-slicing composable
  components/
    MealCard.vue       — extracted meal card (DRY from MenuPage)
```

### Phase 0 — Modified files
```
src/
  components/
    MenuPage.vue       — replace imperative Search() with useSearch + usePagination
  router/index.js      — lazy-load all route components
  stores/form.js       — remove pass-through getters
  vite.config.js       — change base from '/FeastBox_vue/' to '/'
```

### Phase 2 — New files
```
src/
  services/
    api.js             — fetch wrapper, base URL, auth header injection
  stores/
    meals.js           — meals data + loading/error state, replaces inline refs
server/
  index.js             — Express entry point
  routes/
    auth.js            — POST /auth/register, POST /auth/login, POST /auth/refresh
    meals.js           — GET /meals, GET /meals/:id
    orders.js          — POST /orders, GET /orders/:id
    payments.js        — POST /payments/checkout, POST /payments/webhook
  middleware/
    authenticate.js    — JWT access token verification
    errorHandler.js    — centralised error response
  services/
    authService.js     — bcrypt hash/compare, JWT sign/verify
    stripeService.js   — Stripe session creation, webhook verification
  prisma/
    schema.prisma      — User, Meal, Order, OrderItem models
```

### Phase 3 — New files
```
Dockerfile             — Express API image
docker-compose.yml     — api + db + (redis optional future)
.github/
  workflows/
    ci.yml             — install → migrate → test → deploy
```

---

## Phase 0 — Frontend Optimisation

> **Current branch:** `frontend_improvement`

---

### Task 1: Fix Vite base path for Vercel

**Files:**
- Modify: `vite.config.js`

- [ ] **Step 1: Update base path**

```js
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/'
})
```

- [ ] **Step 2: Verify dev server still starts**

Run: `npm run dev`
Expected: Server starts at `http://localhost:5173/`, no 404s on asset load.

- [ ] **Step 3: Commit**

```bash
git add vite.config.js
git commit -m "fix: set Vite base path to / for Vercel deployment"
```

---

### Task 2: Create `useSearch` composable

**Files:**
- Create: `src/composables/useSearch.js`

**Vue 3 contract:** `items` must be passed as a `ref` or `computed` — plain arrays will not be reactive. Uses `watch` (not `watchEffect`) so the debounce only fires on actual user input, not on mount.

- [ ] **Step 1: Create the file**

```js
// src/composables/useSearch.js
import { ref, computed, watch } from 'vue'

export function useSearch(items, fields) {
  const query = ref('')
  const debouncedQuery = ref('')

  watch(query, (val, _, onCleanup) => {
    const t = setTimeout(() => {
      debouncedQuery.value = val.trim().toLowerCase()
    }, 300)
    onCleanup(() => clearTimeout(t))
  })

  const results = computed(() => {
    if (!debouncedQuery.value) return items.value
    return items.value.filter(item =>
      fields.some(f => item[f]?.toLowerCase().includes(debouncedQuery.value))
    )
  })

  return { query, results }
}
```

- [ ] **Step 2: Verify no import errors**

Run: `npm run dev`
Expected: Dev server starts with no console errors.

- [ ] **Step 3: Commit**

```bash
git add src/composables/useSearch.js
git commit -m "feat: add useSearch composable with debounced multi-field filter"
```

---

### Task 3: Create `usePagination` composable

**Files:**
- Create: `src/composables/usePagination.js`

**Vue 3 contract:** `items` must be a `ref` or `computed`. Typically used by passing `results` from `useSearch` directly as the items source.

- [ ] **Step 1: Create the file**

```js
// src/composables/usePagination.js
import { ref, computed, watch } from 'vue'

export function usePagination(items, pageSize = 9) {
  const page = ref(1)

  const totalPages = computed(() =>
    Math.ceil(items.value.length / pageSize)
  )

  const paginated = computed(() => {
    const start = (page.value - 1) * pageSize
    return items.value.slice(start, start + pageSize)
  })

  function next() { if (page.value < totalPages.value) page.value++ }
  function prev() { if (page.value > 1) page.value-- }
  function goTo(n) { page.value = Math.max(1, Math.min(n, totalPages.value)) }

  watch(items, () => { page.value = 1 })

  return { page, totalPages, paginated, next, prev, goTo }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/composables/usePagination.js
git commit -m "feat: add usePagination composable"
```

---

### Task 4: Extract `MealCard.vue` component

**Files:**
- Create: `src/components/MealCard.vue`
- Modify: `src/components/MenuPage.vue`

- [ ] **Step 1: Create MealCard component**

```vue
<!-- src/components/MealCard.vue -->
<template>
  <router-link :to="{ name: 'meal-page', params: { mealID: meal.id } }">
    <div class="card h-100">
      <img :src="meal.image" class="card-img-top" :alt="meal.title">
      <div class="card-body text-center">
        <p class="card-title fw-bold mb-0">{{ meal.title }}</p>
        <p class="card-text">{{ meal.description }}</p>
      </div>
    </div>
  </router-link>
</template>

<script setup>
defineProps({
  meal: {
    type: Object,
    required: true
  }
})
</script>
```

- [ ] **Step 2: Update MenuPage to use useSearch, usePagination, and MealCard**

Replace the entire `<script setup>` block and relevant template markup in `src/components/MenuPage.vue`:

```vue
<!-- Template section — replace the #menu section -->
<section id="menu">
  <h2>What are you craving</h2>
  <div class="row g-5">
    <div class="col-md-3" v-for="meal in paginated" :key="meal.id">
      <MealCard v-memo="[meal.id]" :meal="meal" />
    </div>
    <p v-if="paginated.length === 0" class="text-center">No meals found.</p>
  </div>

  <div class="d-flex justify-content-center gap-2 mt-4" v-if="totalPages > 1">
    <button class="btn btn-outline-secondary" @click="prev" :disabled="page === 1">Prev</button>
    <span class="align-self-center">{{ page }} / {{ totalPages }}</span>
    <button class="btn btn-outline-secondary" @click="next" :disabled="page === totalPages">Next</button>
  </div>
</section>

<!-- Search input — replace v-model and remove @click handler -->
<input type="text" class="form-control" v-model="query" placeholder="Search">
```

```js
// Script setup — replace existing script block
import { ref } from 'vue'
import { useSearch } from '@/composables/useSearch'
import { usePagination } from '@/composables/usePagination'
import MealCard from '@/components/MealCard.vue'
// ... existing image imports unchanged ...

const meals = ref([ /* existing meal array unchanged */ ])

const { query, results } = useSearch(meals, ['title', 'description'])
const { page, totalPages, paginated, next, prev } = usePagination(results)
```

- [ ] **Step 3: Run dev server and verify search + pagination work**

Run: `npm run dev`
Expected: Typing in search field filters cards after 300ms pause. Pagination buttons appear when meals exceed 9. Navigating pages works. Empty state shows "No meals found."

- [ ] **Step 4: Commit**

```bash
git add src/components/MealCard.vue src/components/MenuPage.vue
git commit -m "feat: extract MealCard, wire useSearch and usePagination into MenuPage"
```

---

### Task 5: Lazy-load routes

**Files:**
- Modify: `src/router/index.js`

- [ ] **Step 1: Convert all component imports to dynamic imports**

```js
// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: () => import('@/components/HomePage.vue'), meta: { showNavbar: true } },
    { path: '/menu', component: () => import('@/components/MenuPage.vue'), meta: { showNavbar: true } },
    { path: '/meal-page/:mealID', name: 'meal-page', component: () => import('@/components/MealPage.vue'), props: true, meta: { showNavbar: true } },
    { path: '/how', component: () => import('@/components/Howitworks.vue'), meta: { showNavbar: true } },
    { path: '/login', component: () => import('@/components/LoginPage.vue'), meta: { showNavbar: true } },
    { path: '/contact', component: () => import('@/components/ContactPage.vue'), meta: { showNavbar: true } },
    {
      path: '/meal-plan',
      component: () => import('@/components/MealPlan.vue'),
      meta: { showNavbar: false },
      children: [
        { path: 'planform', component: () => import('@/components/PlanForm.vue') },
        { path: 'deliveryform', component: () => import('@/components/DeliveryForm.vue') },
        { path: 'paymentform', component: () => import('@/components/PaymentForm.vue') }
      ]
    }
  ]
})

export default router
```

- [ ] **Step 2: Verify all routes still navigate correctly**

Run: `npm run dev`
Expected: All routes load. No blank screens. `/meal-plan` hides navbar.

- [ ] **Step 3: Commit**

```bash
git add src/router/index.js
git commit -m "perf: lazy-load all route components"
```

---

### Task 6: Pinia store audit

**Files:**
- Modify: `src/stores/form.js`

**Rule:** Remove getters that only return `state.x` with no transformation — those are direct state access, not getters. The existing `totalServings`, `totalPrice`, `totalPriceVoucher` getters all perform computation and are correct to keep. The nested `planData`/`deliveryData`/`paymentData` grouping maps to the three checkout steps — do not flatten the top-level grouping.

- [ ] **Step 1: Audit getters — confirm all perform transformation**

Open `src/stores/form.js`. Verify:
- `totalServings` → `serving * mealPerWeek` ✅ computation, keep
- `totalPrice` → `totalServings * 6.99` ✅ computation, keep
- `totalPriceVoucher` → `totalPrice * 0.8` ✅ computation, keep

No pass-through getters found. No changes needed. ✅

- [ ] **Step 2: Commit (no-op if no changes)**

```bash
git commit --allow-empty -m "chore: confirm Pinia store requires no structural changes"
```

---

## Phase 1 — Current State

**Status:** Complete. Vue 3 SPA running against hardcoded mock data.

> Vercel deployment config will be updated in Phase 2 to point `VITE_API_URL` at the Railway backend.

---

## Phase 2 — Backend + Database

---

### Task 7: Monorepo setup + Express skeleton

**Files:**
- Create: `server/index.js`
- Create: `server/routes/auth.js`, `meals.js`, `orders.js`, `payments.js`
- Create: `server/middleware/authenticate.js`, `errorHandler.js`
- Modify: root `package.json` — add workspaces

- [ ] **Step 1: Initialise server package**

```bash
mkdir server && cd server && npm init -y
npm install express cors dotenv jsonwebtoken bcrypt stripe @prisma/client
npm install -D prisma nodemon
```

- [ ] **Step 2: Create Express entry point**

```js
// server/index.js
import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import authRouter from './routes/auth.js'
import mealsRouter from './routes/meals.js'
import ordersRouter from './routes/orders.js'
import paymentsRouter from './routes/payments.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
app.use(express.json())

app.use('/auth', authRouter)
app.use('/meals', mealsRouter)
app.use('/orders', ordersRouter)
app.use('/payments', paymentsRouter)

app.use(errorHandler)

app.listen(process.env.PORT || 3000, () =>
  console.log(`API running on port ${process.env.PORT || 3000}`)
)
```

- [ ] **Step 3: Create centralised error handler**

```js
// server/middleware/errorHandler.js
export function errorHandler(err, req, res, next) {
  const status = err.status || 500
  res.status(status).json({ error: err.message || 'Internal server error' })
}
```

- [ ] **Step 4: Verify server starts**

Run: `node server/index.js`
Expected: `API running on port 3000` with no errors.

- [ ] **Step 5: Commit**

```bash
git add server/
git commit -m "feat: add Express skeleton with router and error handler"
```

---

### Task 8: PostgreSQL + Prisma schema

**Files:**
- Create: `server/prisma/schema.prisma`

- [ ] **Step 1: Initialise Prisma**

```bash
cd server && npx prisma init
```

- [ ] **Step 2: Define schema**

```prisma
// server/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
  orders       Order[]
}

model Meal {
  id              String      @id @default(cuid())
  title           String
  description     String
  cuisine         String
  dietary         String[]
  imageUrl        String
  pricePerServing Float
  orderItems      OrderItem[]
}

model Order {
  id        String      @id @default(cuid())
  userId    String
  user      User        @relation(fields: [userId], references: [id])
  status    String      @default("pending")
  total     Float
  createdAt DateTime    @default(now())
  items     OrderItem[]
}

model OrderItem {
  id       String @id @default(cuid())
  orderId  String
  order    Order  @relation(fields: [orderId], references: [id])
  mealId   String
  meal     Meal   @relation(fields: [mealId], references: [id])
  servings Int
}
```

- [ ] **Step 3: Run migration**

```bash
npx prisma migrate dev --name init
```
Expected: Migration files created in `server/prisma/migrations/`, database tables created.

- [ ] **Step 4: Commit**

```bash
git add server/prisma/
git commit -m "feat: add Prisma schema with User, Meal, Order, OrderItem models"
```

---

### Task 9: JWT authentication routes

**Files:**
- Create: `server/services/authService.js`
- Modify: `server/routes/auth.js`
- Create: `server/middleware/authenticate.js`

**Security (OWASP):** Access tokens expire in 15 minutes. Refresh tokens stored in httpOnly cookies, never in localStorage.

- [ ] **Step 1: Create authService**

```js
// server/services/authService.js
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

export async function hashPassword(plain) {
  return bcrypt.hash(plain, 12)
}

export async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash)
}

export function signAccessToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: '15m' })
}

export function signRefreshToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' })
}

export function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET)
}
```

- [ ] **Step 2: Create auth routes**

```js
// server/routes/auth.js
import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { hashPassword, verifyPassword, signAccessToken, signRefreshToken } from '../services/authService.js'

const router = Router()
const prisma = new PrismaClient()

router.post('/register', async (req, res, next) => {
  try {
    const { email, password } = req.body
    const passwordHash = await hashPassword(password)
    const user = await prisma.user.create({ data: { email, passwordHash } })
    res.status(201).json({ id: user.id, email: user.email })
  } catch (err) {
    next(err)
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    const accessToken = signAccessToken(user.id)
    const refreshToken = signRefreshToken(user.id)
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'strict' })
    res.json({ accessToken })
  } catch (err) {
    next(err)
  }
})

export default router
```

- [ ] **Step 3: Create authenticate middleware**

```js
// server/middleware/authenticate.js
import { verifyAccessToken } from '../services/authService.js'

export function authenticate(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorised' })
  try {
    req.user = verifyAccessToken(header.slice(7))
    next()
  } catch {
    res.status(401).json({ error: 'Token expired or invalid' })
  }
}
```

- [ ] **Step 4: Test register + login manually**

Run server and POST to `http://localhost:3000/auth/register` with `{ "email": "test@test.com", "password": "Password1!" }`.
Expected: `201` with `{ id, email }`.

POST to `/auth/login` with same credentials.
Expected: `200` with `{ accessToken }`, `refreshToken` set as httpOnly cookie.

- [ ] **Step 5: Commit**

```bash
git add server/
git commit -m "feat: add JWT auth — register, login, authenticate middleware"
```

---

### Task 10: Meals API + Pinia meals store

**Files:**
- Create: `server/routes/meals.js`
- Create: `src/services/api.js`
- Create: `src/stores/meals.js`
- Modify: `src/components/MenuPage.vue` — replace inline `meals` ref with store
- Modify: `src/components/MealPage.vue` — replace inline data with store

**Vue 3 / Pinia principle:** API calls belong in store actions, not in components. Components bind to store state only. `storeToRefs` required when destructuring store reactive state.

- [ ] **Step 1: Create meals API route**

```js
// server/routes/meals.js
import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

router.get('/', async (req, res, next) => {
  try {
    const meals = await prisma.meal.findMany()
    res.json(meals)
  } catch (err) { next(err) }
})

router.get('/:id', async (req, res, next) => {
  try {
    const meal = await prisma.meal.findUniqueOrThrow({ where: { id: req.params.id } })
    res.json(meal)
  } catch (err) { next(err) }
})

export default router
```

- [ ] **Step 2: Create API service layer**

```js
// src/services/api.js
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function request(path, options = {}) {
  const token = localStorage.getItem('accessToken')
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) })
}
```

- [ ] **Step 3: Create Pinia meals store**

```js
// src/stores/meals.js
import { ref } from 'vue'
import { defineStore } from 'pinia'
import { api } from '@/services/api'

export const useMeals = defineStore('meals', () => {
  const meals = ref([])
  const currentMeal = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchMeals() {
    loading.value = true
    error.value = null
    try {
      meals.value = await api.get('/meals')
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function fetchMeal(id) {
    loading.value = true
    error.value = null
    try {
      currentMeal.value = await api.get(`/meals/${id}`)
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  return { meals, currentMeal, loading, error, fetchMeals, fetchMeal }
})
```

- [ ] **Step 4: Update MenuPage to use meals store**

```js
// In <script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useMeals } from '@/stores/meals'

const mealsStore = useMeals()
const { meals, loading } = storeToRefs(mealsStore)
const { fetchMeals } = mealsStore

onMounted(fetchMeals)

const { query, results } = useSearch(meals, ['title', 'description'])
const { page, totalPages, paginated, next, prev } = usePagination(results)
```

- [ ] **Step 5: Commit**

```bash
git add server/routes/meals.js src/services/api.js src/stores/meals.js src/components/MenuPage.vue src/components/MealPage.vue
git commit -m "feat: meals API route, api service layer, Pinia meals store"
```

---

### Task 11: Orders API route

**Files:**
- Modify: `server/routes/orders.js`

- [ ] **Step 1: Create orders route**

```js
// server/routes/orders.js
import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate } from '../middleware/authenticate.js'

const router = Router()
const prisma = new PrismaClient()

router.post('/', authenticate, async (req, res, next) => {
  try {
    const { items } = req.body
    const meals = await prisma.meal.findMany({ where: { id: { in: items.map(i => i.mealId) } } })
    const total = items.reduce((sum, item) => {
      const meal = meals.find(m => m.id === item.mealId)
      return sum + meal.pricePerServing * item.servings
    }, 0)
    const order = await prisma.order.create({
      data: {
        userId: req.user.sub,
        total,
        items: { create: items.map(i => ({ mealId: i.mealId, servings: i.servings })) }
      },
      include: { items: true }
    })
    res.status(201).json(order)
  } catch (err) { next(err) }
})

export default router
```

- [ ] **Step 2: Commit**

```bash
git add server/routes/orders.js
git commit -m "feat: orders API route with authentication"
```

---

### Task 12: Stripe checkout + webhook

**Files:**
- Create: `server/services/stripeService.js`
- Modify: `server/routes/payments.js`

**Stripe principle:** Webhook signatures must be verified before any order state change.

- [ ] **Step 1: Create stripeService**

```js
// server/services/stripeService.js
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function createCheckoutSession(order, successUrl, cancelUrl) {
  return stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: order.items.map(item => ({
      price_data: {
        currency: 'aud',
        product_data: { name: item.meal.title },
        unit_amount: Math.round(item.meal.pricePerServing * 100)
      },
      quantity: item.servings
    })),
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { orderId: order.id }
  })
}

export function constructWebhookEvent(payload, sig) {
  return stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET)
}
```

- [ ] **Step 2: Create payments route**

```js
// server/routes/payments.js
import { Router } from 'express'
import express from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate } from '../middleware/authenticate.js'
import { createCheckoutSession, constructWebhookEvent } from '../services/stripeService.js'

const router = Router()
const prisma = new PrismaClient()

router.post('/checkout', authenticate, async (req, res, next) => {
  try {
    const { orderId } = req.body
    const order = await prisma.order.findUniqueOrThrow({
      where: { id: orderId },
      include: { items: { include: { meal: true } } }
    })
    const session = await createCheckoutSession(
      order,
      `${process.env.CLIENT_URL}/success`,
      `${process.env.CLIENT_URL}/cancel`
    )
    res.json({ url: session.url })
  } catch (err) { next(err) }
})

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']
  try {
    const event = constructWebhookEvent(req.body, sig)
    if (event.type === 'checkout.session.completed') {
      const orderId = event.data.object.metadata.orderId
      await prisma.order.update({ where: { id: orderId }, data: { status: 'paid' } })
    }
    res.json({ received: true })
  } catch {
    res.status(400).send('Webhook signature verification failed')
  }
})

export default router
```

- [ ] **Step 3: Commit**

```bash
git add server/services/stripeService.js server/routes/payments.js
git commit -m "feat: Stripe checkout session and webhook handler"
```

---

### Task 13: Deploy Phase 2 to Railway + Vercel

- [ ] **Step 1: Create Railway project and add PostgreSQL plugin**
- [ ] **Step 2: Set Railway environment variables** — `JWT_SECRET`, `JWT_REFRESH_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `CLIENT_URL`
- [ ] **Step 3: Set Railway start command** — `npx prisma migrate deploy && node server/index.js`
- [ ] **Step 4: Add `VITE_API_URL` to Vercel environment variables**
- [ ] **Step 5: Redeploy Vercel frontend** — `npm run build && vercel --prod`

---

## Phase 3 — Containerisation + CI/CD

---

### Task 14: Docker setup

- [ ] **Step 1: Create Dockerfile**

```dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --omit=dev

FROM base AS production
COPY server/ .
RUN npx prisma generate
EXPOSE 3000
USER node
CMD ["node", "index.js"]
```

- [ ] **Step 2: Create docker-compose.yml**

```yaml
services:
  api:
    build: .
    ports: ["3000:3000"]
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/feastbox
      JWT_SECRET: dev-secret
      JWT_REFRESH_SECRET: dev-refresh-secret
      CLIENT_URL: http://localhost:5173
    depends_on: [db]

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: feastbox
      POSTGRES_PASSWORD: postgres
    volumes: [db_data:/var/lib/postgresql/data]
    ports: ["5432:5432"]

  # redis: optional future
  # redis:
  #   image: redis:7-alpine
  #   ports: ["6379:6379"]

volumes:
  db_data:
```

- [ ] **Step 3: Verify** — `docker compose up --build` — API responds at `http://localhost:3000/meals`
- [ ] **Step 4: Commit**

```bash
git add Dockerfile docker-compose.yml .dockerignore
git commit -m "feat: Docker setup for local environment parity"
```

---

### Task 15: GitHub Actions CI/CD

- [ ] **Step 1: Create `.github/workflows/ci.yml`**

```yaml
name: CI/CD
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: feastbox_test
          POSTGRES_PASSWORD: postgres
        ports: [5432:5432]
        options: --health-cmd pg_isready --health-interval 10s --health-timeout 5s --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
        working-directory: server
      - run: npx prisma migrate deploy
        working-directory: server
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/feastbox_test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: bervProject/railway-deploy@main
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: feastbox-api
```

- [ ] **Step 2: Add `RAILWAY_TOKEN` to GitHub repository secrets**
- [ ] **Step 3: Push to main and confirm pipeline passes**
- [ ] **Step 4: Commit** — `git commit -m "feat: GitHub Actions CI/CD — migrate + deploy on push to main"`

---

## Optional / Future

| Feature | Notes |
|---|---|
| Redis caching | Uncomment in `docker-compose.yml`; use for meal list caching when API response times become a problem |
| OAuth (Google) | `passport-google-oauth20` alongside email/password |
| AI meal recommender | Anthropic API — personalised suggestions from order history |
| Stripe subscription billing | Only if recurring delivery model is added |
| WebSocket order tracking | Only meaningful with a real fulfilment pipeline |

---

## Corrections Applied vs Original Plan

| # | Original issue | Fix applied |
|---|---|---|
| 1 | `watchEffect` cleanup used React `return fn` pattern | Changed to `watch` with `onCleanup` parameter |
| 2 | Missing `import` statements in composables | All composables now import explicitly from `'vue'` |
| 3 | "Flatten nested Pinia state" was ambiguous | Clarified: top-level domain grouping is correct |
| 4 | No `src/services/api.js` or `src/stores/meals.js` for Phase 2 | Both added as explicit tasks with full code |
| 5 | `storeToRefs` not mentioned | Added to Task 10 with explanation |
| 6 | Redis in Week 1 schedule | Removed from schedule, moved to Optional/Future |
| 7 | Week 0 header said "trie-indexed lookup" | Corrected to "debounced computed + multi-field filter" |
| 8 | `vite.config.js` base was `/FeastBox_vue/` | Task 1 changes to `/` for Vercel |
| 9 | GitHub Actions listed as optional | Promoted to core Phase 3 task |
| 10 | Stripe subscriptions + WebSocket in Week 2 | Moved to Optional/Future |
