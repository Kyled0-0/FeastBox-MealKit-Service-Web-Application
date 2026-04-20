# FeastBox — Architecture

## System Overview

FeastBox is a fullstack meal-kit delivery SPA. There are no real customers — it is a production-ready portfolio replica of Marley Spoon.

```
Browser
  │
  ├── Vercel (CDN)
  │     └── Vue 3 SPA (Vite build)
  │           ├── src/services/api.js  ──── REST/JSON ───▶  Railway
  │           ├── src/stores/          ◀── responses ────    └── Express API (Node.js)
  │           ├── src/composables/                               ├── JWT middleware
  │           └── src/components/                               ├── Prisma ORM
  │                                                             └── PostgreSQL 16
  └── Stripe Checkout (redirect)
        └── stripe.com/pay  ──── webhook ──▶  POST /payments/webhook
```

**Three clean layers:**
1. **Presentation** — Vue 3 SPA, runs entirely in the browser
2. **Business logic** — Express API, runs on Railway
3. **Persistence** — PostgreSQL, provisioned by Railway

Each layer communicates through defined contracts. The frontend never touches the database directly.

---

## Frontend Architecture

### Component Hierarchy

```
App.vue
  ├── Navbar (shown via route.meta.showNavbar)
  └── <RouterView>
        ├── HomePage.vue
        ├── MenuPage.vue
        │     └── MealCard.vue (v-for with v-memo)
        ├── MealPage.vue
        ├── Howitworks.vue
        ├── LoginPage.vue
        ├── ContactPage.vue
        └── MealPlan.vue (hides main navbar, owns breadcrumb stepper)
              ├── PlanForm.vue      (step 1)
              ├── DeliveryForm.vue  (step 2)
              └── PaymentForm.vue   (step 3)
```

### State Management

Two Pinia stores with distinct responsibilities:

| Store | File | Responsibility |
|-------|------|---------------|
| `useMealForm` | `src/stores/form.js` | Checkout wizard state — plan, delivery, payment, success flag |
| `useMeals` | `src/stores/meals.js` | API-backed meal list and single meal, with loading/error state |

**Rule:** Components bind to store state via `storeToRefs`. They call store actions. They never call `api.js` directly.

### Composables

| Composable | File | Purpose |
|-----------|------|---------|
| `useSearch` | `src/composables/useSearch.js` | Debounced multi-field search over a reactive list |
| `usePagination` | `src/composables/usePagination.js` | Page-slices a reactive list, resets on list change |

**Composition pattern:** `useSearch` output feeds directly into `usePagination` input. Neither composable knows about the other — they compose at the component level.

```js
const { query, results } = useSearch(meals, ['title', 'description'])
const { page, totalPages, paginated, next, prev } = usePagination(results)
```

### API Communication

All HTTP calls go through `src/services/api.js`. This module:
- Reads `VITE_API_URL` from environment (falls back to `localhost:3000` in dev)
- Injects the `Authorization: Bearer <token>` header from `localStorage` on every request
- Throws on non-2xx responses so store actions can catch and set `error.value`

```
Component → store action → api.js → Express API
                ↑
         storeToRefs binds
         loading/error/data
         back to template
```

### Router

All routes are lazy-loaded via `() => import(...)`. Route meta `showNavbar` controls whether `App.vue` renders the main navbar. The `/meal-plan` route sets `showNavbar: false` — `MealPlan.vue` renders its own breadcrumb stepper instead.

---

## Backend Architecture

### Express Layers

```
Request
  │
  ├── CORS middleware (origin: CLIENT_URL)
  ├── express.json() body parser
  │
  ├── /auth      → routes/auth.js
  ├── /meals     → routes/meals.js
  ├── /orders    → routes/orders.js   (requires authenticate middleware)
  ├── /payments  → routes/payments.js (checkout requires authenticate; webhook uses raw body)
  │
  └── errorHandler middleware (always last)
```

**Single Responsibility per file:**
- `routes/` — HTTP shape only (parse req, call service or Prisma, send res)
- `middleware/` — cross-cutting concerns (auth verification, error formatting)
- `services/` — business logic (JWT signing, bcrypt, Stripe session creation)
- `prisma/` — data shape only (schema defines all models once)

### Authentication Flow

```
POST /auth/register
  → hash password (bcrypt, 12 rounds)
  → prisma.user.create
  → return { id, email }

POST /auth/login
  → prisma.user.findUnique
  → bcrypt.compare
  → sign accessToken (JWT, 15m expiry, JWT_SECRET)
  → sign refreshToken (JWT, 7d expiry, JWT_REFRESH_SECRET)
  → set refreshToken as httpOnly cookie
  → return { accessToken }

Protected routes
  → authenticate middleware reads Authorization: Bearer <token>
  → jwt.verify with JWT_SECRET
  → attaches decoded payload to req.user
```

Access tokens are short-lived (15m) and stored in `localStorage` by the frontend. Refresh tokens are httpOnly cookies — inaccessible to JavaScript, not vulnerable to XSS.

### Payment Flow

```
POST /payments/checkout  (authenticated)
  → fetch order from DB with meal line items
  → createCheckoutSession (Stripe)
  → return { url: stripe_checkout_url }
  → frontend redirects browser to stripe URL

Stripe processes payment
  → POST /payments/webhook  (Stripe server → our server)
  → constructWebhookEvent verifies stripe-signature header
  → on checkout.session.completed: update order.status = 'paid'
```

The webhook uses `express.raw()` — NOT `express.json()`. Stripe computes its signature against the raw bytes. Parsing the body first breaks verification.

---

## Data Models

Defined in `server/prisma/schema.prisma`. Prisma generates the TypeScript/JS client from this single source of truth.

```
User
  id           cuid (PK)
  email        unique
  passwordHash string
  createdAt    datetime
  orders       Order[]

Meal
  id              cuid (PK)
  title           string
  description     string
  cuisine         string
  dietary         string[]
  imageUrl        string
  pricePerServing float
  orderItems      OrderItem[]

Order
  id        cuid (PK)
  userId    FK → User
  status    string ("pending" | "paid")
  total     float
  createdAt datetime
  items     OrderItem[]

OrderItem
  id       cuid (PK)
  orderId  FK → Order
  mealId   FK → Meal
  servings int
```

---

## Deployment Architecture

```
Development (local)
  npm run dev           → Vite dev server (port 5173)
  node server/index.js  → Express API (port 3000)
  docker compose up     → API + PostgreSQL (environment parity with production)

Staging / Production
  Vercel    → Vue 3 SPA (auto-deploy on push to main)
  Railway   → Express API + PostgreSQL (auto-deploy via GitHub Actions)

Environment variables
  Frontend (Vercel):  VITE_API_URL
  Backend (Railway):  DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET,
                      STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, CLIENT_URL, PORT
```

---

## Key Design Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Frontend hosting | Vercel | Zero-config Vue deploy, auto-build on push |
| Backend hosting | Railway | Free-tier PostgreSQL plugin, auto `DATABASE_URL` injection |
| ORM | Prisma | Schema-first, single source of truth for data shapes |
| Auth | JWT | Stateless, suitable for SPA + REST API pairing |
| Payments | Stripe Checkout | PCI compliance handled by Stripe, not by us |
| Containerisation | Docker + docker-compose | Local dev matches production exactly |
| State | Pinia | Official Vue 3 state library, Setup Store syntax matches Composition API style |

For full rationale see `docs_foundation/DECISIONS.md`.
