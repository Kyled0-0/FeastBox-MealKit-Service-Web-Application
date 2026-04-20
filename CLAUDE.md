# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Project:** FeastBox — production-ready Marley Spoon replica. Portfolio piece demonstrating fullstack engineering. No real customers.

---

## Quick Commands

```bash
# Frontend
npm run dev              # Vite dev server at localhost:5173
npm run build            # Build to dist/
npm run preview          # Preview production build locally
vercel --prod            # Deploy frontend to Vercel

# Backend (from server/)
node index.js            # Start Express API at localhost:3000
npx prisma migrate dev   # Run migrations (dev)
npx prisma migrate deploy  # Run migrations (production)
npx prisma studio        # GUI database browser

# Full local stack
docker compose up --build  # Start API + PostgreSQL together
```

No frontend test runner is configured. Backend tests use Vitest (to be added in Phase 2).

---

## Documentation Index

| File | Contents |
|------|----------|
| `docs_foundation/FULLPLAN.md` | Full implementation plan — Phase 0 through Phase 3 with task steps |
| `docs_foundation/ARCHITECTURE.md` | System design, component hierarchy, auth flow, data models, deployment |
| `docs_foundation/CODE_STYLE.md` | Vue 3, Pinia, Express, CSS conventions + anti-patterns reference |
| `docs_foundation/TESTING.md` | Testing strategy, test examples, definition of done |
| `docs_foundation/WORKFLOWS.md` | Step-by-step playbooks for common dev tasks |
| `docs_foundation/CODE_REVIEW_CHECKLIST.md` | Pre-PR checklist — Vue, Pinia, security, performance, bug patterns |
| `Plan_ORG/PLAN.md` | Original plan (reference only — superseded by FULLPLAN.md) |

---

## Architecture

FeastBox is a fullstack meal-kit delivery SPA. Vue 3 frontend (Vercel) communicates via REST with an Express + PostgreSQL backend (Railway).

```
Vercel                          Railway
└── Vue 3 SPA (frontend)        └── Express API (server/)
    Vite + Pinia + Vue Router       Prisma + PostgreSQL
    Bootstrap 5                     JWT auth + Stripe
```

### Source Layout

```
src/
  components/       # One component per file, one folder per feature
  composables/      # useSearch.js, usePagination.js — reusable stateful logic
  stores/           # Pinia stores — form.js (checkout), meals.js (API data)
  services/         # api.js — all fetch calls go through here, never from components
  router/           # index.js — all routes lazy-loaded
  assets/
    resources/
      css/style.css # Global styles
      img/          # Meal images, organised by meal folder

server/
  index.js          # Express entry point
  routes/           # auth.js, meals.js, orders.js, payments.js — one file per domain
  middleware/       # authenticate.js, errorHandler.js
  services/         # authService.js, stripeService.js — business logic only
  prisma/
    schema.prisma   # Single source of truth for all data shapes
```

### Routing (`src/router/index.js`)

All routes are lazy-loaded via `() => import(...)`.

- `/` → `HomePage`
- `/menu` → `MenuPage` — meal grid with search + pagination
- `/meal-page/:mealID` → `MealPage` — dynamic meal detail
- `/how` → `Howitworks`
- `/login` → `LoginPage`
- `/contact` → `ContactPage`
- `/meal-plan` → `MealPlan` (layout shell, hides navbar) with nested children:
  - `/planform` → `PlanForm` (step 1)
  - `/deliveryform` → `DeliveryForm` (step 2)
  - `/paymentform` → `PaymentForm` (step 3)

`App.vue` shows/hides the navbar via `route.meta.showNavbar`.

### State (`src/stores/`)

**`useMealForm` (`form.js`)** — checkout flow state:
- `planData` — preference, serving count, meals per week
- `deliveryData` — address/delivery fields
- `paymentData` — card fields, voucher, terms
- `successPayment` — flag set after payment completes
- Getters: `totalServings`, `totalPrice`, `totalPriceVoucher` (20% off with `FEAST20`)

**`useMeals` (`meals.js`)** — API-backed meal data:
- `meals`, `currentMeal`, `loading`, `error`
- Actions: `fetchMeals()`, `fetchMeal(id)`

### API Service (`src/services/api.js`)

All `fetch` calls go through `api.get(path)` / `api.post(path, body)`. Components and composables never call `fetch` directly — only Pinia store actions do.

### Meal data

Phase 0: meal metadata defined inline as `ref` arrays in `MenuPage.vue` and `MealPage.vue`. Phase 2+: moved to `useMeals` Pinia store backed by `GET /meals` API.

### Styling

Global styles in `src/assets/resources/css/style.css`. Bootstrap 5 imported globally in `main.js`. Components use `<style scoped>` for overrides. Brand colours: `#ff603d` (orange), `#70d4ea` (blue).

---

## Vue 3 Standards

These rules apply to all components and composables in this project.

- **Always use `<script setup>`** — no Options API, no `setup()` function
- **Composables** for any logic reused across two or more components — prefix with `use`
- **`watch` over `watchEffect`** when the reactive dependency is a single known ref — `watchEffect` is for side effects with multiple implicit dependencies
- **`watchEffect` cleanup** uses the `onCleanup` parameter, not `return fn` (that is the React pattern and is silently ignored by Vue):
  ```js
  watchEffect((onCleanup) => {
    const t = setTimeout(...)
    onCleanup(() => clearTimeout(t))
  })
  ```
- **`storeToRefs`** is required when destructuring reactive state from a Pinia store. Actions do not need it:
  ```js
  const { meals, loading } = storeToRefs(useMeals())  // reactive state
  const { fetchMeals } = useMeals()                    // actions — no storeToRefs
  ```
- **`v-memo`** on list items where the data is stable — skip re-renders when meal data hasn't changed
- **Explicit imports** — `ref`, `computed`, `watch`, etc. must be imported from `'vue'`. No auto-import plugin is configured.
- **Composable contract** — composable arguments must be `ref` or `computed`, never plain values. Document this at the top of each composable.

---

## Pinia Patterns

- Use **Setup Store syntax** (`defineStore('id', () => { ... })`) for new stores
- Store actions are the **only place** that call `api.js` — components bind to store state
- Domain grouping in state is intentional (`planData`, `deliveryData`, `paymentData` map to checkout steps) — do not flatten top-level groups
- Getters must perform a computation — pure pass-throughs (`return state.x`) should be direct state access instead

---

## Code Style Rules

- `const`/`let` only — no `var`
- Optional chaining (`?.`) and nullish coalescing (`??`) over manual null checks
- `async`/`await` over `.then()` chains
- One component per file, one folder per feature
- No component receives more than 5 props — use provide/inject or Pinia instead
- Shared types in `src/shared/` (Phase 2+)
- No inline styles — use scoped CSS or Bootstrap utilities

---

## Cross-Check Standard

Every planned change must be validated against the official standards of the tool it touches before implementation:

| Layer | Validate against |
|-------|-----------------|
| Vue 3 composables | Composition API docs — `watch`/`watchEffect`, `onCleanup`, `<script setup>` |
| Pinia | Pinia docs — Setup Store, `storeToRefs`, actions-only mutations |
| Vue Router 4 | Lazy loading, route meta, navigation guards |
| Vite | `base` path, plugin config, build options |
| Express | Router separation, middleware order, error handler last |
| Prisma | Schema syntax, migration commands, parameterised queries |
| JWT / Auth | OWASP — short-lived access tokens, httpOnly refresh cookies |
| Stripe | Webhook signature verification before any state change |
| Docker | Layer caching, non-root user, multi-stage builds |
| GitHub Actions | Job dependencies, secrets, caching strategy |

---

## Environment Variables

| Variable | Where used | Description |
|----------|-----------|-------------|
| `VITE_API_URL` | Frontend (Vercel) | Base URL of the Express API, e.g. `https://feastbox-api.railway.app` |
| `DATABASE_URL` | Server (Railway) | PostgreSQL connection string — injected automatically by Railway |
| `JWT_SECRET` | Server | Access token signing secret (generate with `crypto.randomBytes(64)`) |
| `JWT_REFRESH_SECRET` | Server | Refresh token signing secret |
| `STRIPE_SECRET_KEY` | Server | Stripe secret key (`sk_test_...` in dev) |
| `STRIPE_WEBHOOK_SECRET` | Server | Stripe webhook endpoint secret (`whsec_...`) |
| `CLIENT_URL` | Server | Frontend origin for CORS, e.g. `https://feastbox.vercel.app` |
| `PORT` | Server | Express listen port (Railway injects this automatically) |

Never commit `.env` files. All secrets go into Vercel / Railway environment variable settings.

---

## Common Gotchas

1. **`watchEffect` cleanup is `onCleanup(fn)`, not `return fn`** — the return value is silently discarded by Vue. Using the React pattern means debounce timers never clear.
2. **`storeToRefs` required for store state destructuring** — omitting it produces non-reactive variables that never update in the template.
3. **Stripe webhook route needs raw body** — use `express.raw({ type: 'application/json' })` on the webhook route only. `express.json()` applied globally will break signature verification.
4. **Prisma client should not be instantiated per-request** — create one `PrismaClient` instance per module and reuse it.
5. **Vite base path is `/`** — it was previously `/FeastBox_vue/` for GitHub Pages. Using the old value breaks asset paths on Vercel.
6. **`usePagination` resets to page 1 on items change** — this is intentional. After a search, the paginator resets so the user sees results from the first page.

---

## Definition of Done

A task is complete when all of the following pass:

1. `npm run build` exits with no errors
2. `npm run dev` — the changed feature works correctly in the browser (golden path + empty/error states)
3. Vue: no `[Vue warn]` in the browser console
4. Backend: `node server/index.js` starts without errors; changed routes return expected responses
5. No hardcoded secrets, no committed `.env` files
6. Code review: no critical findings outstanding
