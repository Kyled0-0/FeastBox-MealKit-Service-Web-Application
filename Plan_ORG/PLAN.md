# FeastBox — Project Plan

## Overview

FeastBox is a fullstack meal-kit delivery web application. The frontend is already built as a Vue 3 SPA. This plan covers the fullstack upgrade: adding a REST API, relational database, authentication, payments, and a phased production deployment.

The project serves two purposes: a functional meal-kit platform, and a portfolio piece demonstrating fullstack engineering capability for Melbourne IT internship applications.

---

## Timeline

### Week 0 — Frontend optimisation (before backend work begins)

| Day | Focus | Est. hours |
|-----|-------|-----------|
| 1 | Audit components — extract repeated markup into reusable components, remove dead code | 3–4 |
| 2 | Replace naive search with debounced computed + trie-indexed lookup | 3–4 |
| 3 | Implement client-side pagination with a reusable `usePagination` composable | 3–4 |
| 4 | Lazy-load route-level components, add `v-memo` to static meal cards | 2–3 |
| 5 | Pinia store audit — flatten nested state, remove redundant getters | 2–3 |

### Week 1 — Core fullstack

| Day | Focus | Est. hours |
|-----|-------|-----------|
| 1 | Monorepo setup, Express skeleton, CORS, env config | 4–5 |
| 2 | PostgreSQL + Prisma schema, migrations | 4–5 |
| 3 | JWT auth — register, login, refresh, middleware | 5–6 |
| 4 | Meals + orders API endpoints, replace frontend mock data | 4–5 |
| 5 | Stripe checkout + webhook handler | 5–6 |
| 6 | Docker + docker-compose, Railway deploy | 4–5 |
| 7 | Buffer — Redis cache, bug fixes, README, manual testing | 4–5 |

### Week 2 — Enhancements (optional, post-core)

- AI meal recommender or recipe chatbot via Anthropic API
- OAuth login (Google)
- Stripe subscription billing
- GitHub Actions CI/CD pipeline
- Order status tracking via WebSocket

---

## Technology Stack

### Frontend (existing)

| Tool | Role | Principle |
|------|------|-----------|
| Vue 3 + Composition API | UI framework | No migration needed — already built |
| Vite | Build tool + dev server | KISS — zero-config, fastest HMR available |
| Pinia | Global state | Single Responsibility — one store per domain |
| Vue Router | Client-side routing | Separation of Concerns — routing separate from components |
| Bootstrap 5 | UI components + grid | Convention over Configuration — sensible defaults |

### Backend (new)

| Tool | Role | Principle |
|------|------|-----------|
| Node.js + Express | API server | KISS — minimal, well-documented, industry standard |
| Prisma ORM | Database query layer | DRY — schema defined once, types auto-generated |
| PostgreSQL | Relational database | SOLID — handles relations, constraints, transactions correctly |
| JWT (jsonwebtoken) | Authentication tokens | Defense in Depth — short-lived access + httpOnly refresh cookie |
| bcrypt | Password hashing | Least Privilege — plaintext passwords never stored or transmitted |
| Stripe | Payments | Defense in Depth — PCI compliance handled by Stripe, not by us |
| Redis | Caching (Week 2) | YAGNI — add after core is working, not before |

### Infrastructure

| Tool | Role |
|------|------|
| Docker + docker-compose | Environment parity between local dev and production |
| Railway | Backend + PostgreSQL hosting |
| Vercel | Frontend hosting (already deployed) |
| GitHub Actions | CI/CD (Week 2) |

---

## Design Principles

Every tool and architectural decision in this project is justified by a named software design principle. The principles applied, and where they appear:

**KISS (Keep It Simple, Stupid)**
Express over Fastify or Hono. The performance difference is immaterial at this project's scale. Express has the largest ecosystem and the most documentation — cognitive overhead is lower, and that matters for a solo developer.

**YAGNI (You Aren't Gonna Need It)**
Redis is deferred to Week 2. Zod validation is deferred until route handlers exist and the repetition becomes painful. No GraphQL, no microservices, no message queues.

**DRY (Don't Repeat Yourself)**
Prisma generates TypeScript types directly from the schema. Data shapes are defined once in `schema.prisma` and flow through to the API layer automatically. No manually maintained interface files.

**SOLID — Single Responsibility**
Each Express router handles one domain (auth, meals, orders, payments). Middleware functions do one thing (authenticate, validate, handle errors). Prisma handles data access only — business logic lives in service files, not route handlers.

**Separation of Concerns**
Three distinct layers: Vue 3 frontend (presentation), Express API (business logic), PostgreSQL (persistence). Each layer communicates through defined contracts (REST + JSON). The frontend never touches the database directly.

**Defense in Depth**
JWT access tokens expire in 15 minutes. Refresh tokens are stored in httpOnly cookies (inaccessible to JavaScript) and hashed in the database. Prisma's parameterised queries eliminate SQL injection by default. Stripe webhook signatures are verified before any order state changes.

**Principle of Least Privilege**
Passwords are hashed with bcrypt before storage — raw passwords never persist. Database credentials are environment variables, never committed to the repository. API routes are protected by middleware so authenticated state must be explicitly granted.

**Environment Parity**
docker-compose runs the same PostgreSQL version locally as Railway runs in production. Prisma migrations are committed and run as part of deployment. No manual steps, no "works on my machine" gaps.

---

## Deployment

Deployment is split into four distinct phases. Each phase is independently functional before moving to the next.

---

### Phase 0 — Frontend optimisation

**Status:** To do before backend work begins.

The existing Vue 3 frontend was written as an early project. Before layering in a backend, the frontend needs to be cleaned up so that connecting it to real API data is straightforward and the codebase is defensible in a portfolio review.

**Search algorithm**

The current pattern in a Vue 3 project of this vintage is typically a plain `.filter()` inside a `computed` property, re-running on every keystroke against the full dataset with no debounce. This is fine for 10 items but breaks down visually and computationally as the meal list grows.

Replace with:

1. A debounced `ref` using `watchEffect` or a lightweight `useDebounceFn` pattern — delays the filter until the user stops typing (300ms), eliminating unnecessary re-renders mid-keystroke.
2. A normalised search that lowercases both the query and the target fields once, not on every comparison.
3. Multi-field search across name, cuisine, dietary tags, and description in a single pass — a single `.filter()` with an `||` chain across fields, not four separate filters composed together.

For the meal dataset size FeastBox will realistically have, this is sufficient. A trie or inverted index would be YAGNI here.

```js
// composables/useSearch.js
export function useSearch(items, fields) {
  const query = ref('')
  const debouncedQuery = ref('')

  watchEffect(() => {
    const t = setTimeout(() => { debouncedQuery.value = query.value.trim().toLowerCase() }, 300)
    return () => clearTimeout(t)
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

**Pagination**

The current approach most likely renders all meal cards in a `v-for` loop with no slicing — fine for mock data, broken as soon as real data arrives. Replace with a `usePagination` composable that keeps the logic out of the component entirely (Single Responsibility).

```js
// composables/usePagination.js
export function usePagination(items, pageSize = 9) {
  const page = ref(1)
  const totalPages = computed(() => Math.ceil(items.value.length / pageSize))

  const paginated = computed(() => {
    const start = (page.value - 1) * pageSize
    return items.value.slice(start, start + pageSize)
  })

  function next() { if (page.value < totalPages.value) page.value++ }
  function prev() { if (page.value > 1) page.value-- }
  function goTo(n) { page.value = Math.max(1, Math.min(n, totalPages.value)) }

  // Reset to page 1 whenever the source list changes (e.g. after a search)
  watch(items, () => { page.value = 1 })

  return { page, totalPages, paginated, next, prev, goTo }
}
```

Both composables compose together cleanly — pass `results` from `useSearch` into `usePagination` as the items source. The component itself only binds the refs and calls the functions.

**Component audit**

- Extract any repeated meal card markup into a single `MealCard.vue` component if not already done. DRY.
- Add `v-memo` to `MealCard` to skip re-rendering cards whose data has not changed when the parent list updates.
- Lazy-load route-level components in `router/index.js` using `() => import(...)` so only the current route's JS is parsed on initial load.
- Audit Pinia stores — flatten any nested reactive state, remove getters that are just `return state.x` with no transformation (those belong as direct state access).

**Outcome**

After Phase 0, the frontend is clean, the search and pagination logic lives in composables (not components), and the codebase is ready to swap mock data for real API calls in Week 1 without structural rewrites.

---

### Phase 1 — Frontend (current)

**Status:** Complete.

The Vue 3 frontend is deployed to Vercel from the `main` branch. Vercel handles builds automatically on push. The frontend currently runs against hardcoded mock data.

```
Vercel
└── feast-box-vue.vercel.app  (Vue 3 SPA)
```

No changes needed in this phase. Vercel config will be updated in Phase 2 to point the API base URL at the live backend.

---

### Phase 2 — Backend + Database

**Target:** Railway

Deploy the Express API and PostgreSQL database to Railway. This is the first phase where the app becomes genuinely fullstack.

**Steps:**

1. Create a Railway project
2. Add a PostgreSQL plugin — Railway provisions the database and injects `DATABASE_URL` automatically
3. Deploy the `/server` directory from the monorepo
4. Set environment variables: `JWT_SECRET`, `JWT_REFRESH_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `CLIENT_URL`
5. Run `prisma migrate deploy` as part of the Railway start command
6. Update `VITE_API_URL` in Vercel to point at the Railway backend URL

```
Vercel                        Railway
└── feast-box-vue.vercel.app  └── feastbox-api (Express)
    (Vue 3 SPA)                   └── feastbox-db (PostgreSQL)
```

The app is now fully functional end-to-end. Auth, meals, orders, and payments all work against a real database.

---

### Phase 3 — Containerisation + CI/CD

**Target:** Docker + GitHub Actions

Wrap the backend in Docker to enforce environment parity, and add a GitHub Actions pipeline so every push to `main` runs tests and deploys automatically.

**Docker:**

A `docker-compose.yml` at the monorepo root spins up three services with one command:

```yaml
services:
  api:       # Express server
  db:        # PostgreSQL (same version as Railway)
  redis:     # Redis cache (introduced here)
```

`docker compose up` locally is now identical to the production environment.

**GitHub Actions:**

On push to `main`:
1. Install dependencies
2. Run Prisma migrations against a test database
3. Run unit tests (Vitest)
4. Deploy to Railway via the Railway CLI

```
GitHub Actions
└── on push to main
    ├── npm ci
    ├── prisma migrate deploy (test DB)
    ├── vitest run
    └── railway up
```

```
Local (docker compose up)
├── api     (Express — same image as prod)
├── db      (PostgreSQL 16)
└── redis   (Redis 7)

Railway (production)
├── feastbox-api
├── feastbox-db
└── feastbox-redis
```

This phase completes the portfolio signal: the project is not just built, it is reproducibly deployable from code with automated testing and zero manual steps.
