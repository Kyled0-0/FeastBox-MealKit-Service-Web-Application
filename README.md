# FeastBox

A fullstack meal-kit delivery web application. Browse curated meal plans, manage subscriptions, and checkout — built with Vue 3 on the frontend and Node.js + Express on the backend, deployable to Kubernetes via a single script.

> **Status:** Backend + database + Docker + Kubernetes deploy complete. Authenticated order placement runs end-to-end. Stripe checkout and public cloud hosting are next.

---

## Live Demo

[feast-box-vue.vercel.app](https://feast-box-vue.vercel.app) (frontend only, pre-backend snapshot)

For the current fullstack version, see [Run locally](#run-locally) or [Deploy to Kubernetes](#deployment) below.

---

## Tech Stack

**Frontend**
- Vue 3 (Composition API) + Vite
- Pinia, Vue Router 4
- Bootstrap 5

**Backend**
- Node.js 22 + Express 5
- PostgreSQL 16 + Prisma ORM
- JWT authentication (HS256, algorithm pinning, httpOnly refresh cookie)
- bcrypt + Zod + helmet + Pino + DOMPurify

**Infrastructure**
<<<<<<< Updated upstream
- Docker + docker-compose
- Vercel (frontend)
=======
- Docker (multi-stage, non-root, tini PID 1) + docker-compose
- Kubernetes (StatefulSet, Deployment, HPA, Migration Job, in-cluster Registry)
- Vercel (frontend, planned)
>>>>>>> Stashed changes

---

## Getting Started

### Prerequisites

- Node.js **22+**
- Docker Desktop (with Kubernetes enabled if you want to run the K8s deploy)
- Git Bash or WSL on Windows

### Run locally

```bash
# Clone
git clone https://github.com/Kyled0-0/FeastBox_vue.git
cd FeastBox_vue

# Install dependencies (root + server)
npm install
npm --prefix server install

# Copy environment template, generate JWT secrets
cp server/.env.example server/.env
# Generate two distinct secrets and paste into server/.env:
#   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Seed the database (one-time, first run)
docker compose up -d --wait db
npm --prefix server run db:migrate
npm --prefix server run db:seed

# Start everything (Postgres + API + frontend) in one terminal
npm run dev:all
```

Frontend: http://localhost:5173
API: http://localhost:3000

`npm run dev:all` chains `docker compose up -d --wait db` → `prisma migrate deploy` → `concurrently vite + express`. Ctrl-C kills both processes cleanly.

### Without the orchestrator

```bash
# Database only
docker compose up -d db

# Backend (hot reload)
npm --prefix server run dev

# Frontend (separate terminal)
npm run dev
```

### Run tests

```bash
npm --prefix server run test   # 76 backend tests (auth, meals, orders security)
npx vitest run                 # 49 frontend tests (composables, stores, components)
```

---

## Project Structure

```
FeastBox_vue/
├── src/                       # Vue 3 SPA
│   ├── components/            # Page + feature components
│   ├── composables/           # useSearch, usePagination, useFormValidation, useDragScroll
│   ├── stores/                # Pinia: meals, orders, form
│   ├── services/api.js        # Single fetch boundary
│   ├── router/index.js        # Lazy-loaded routes
│   ├── utils/validators.js    # Shared form validators
│   └── styles/tokens.css      # Brand CSS custom properties
├── server/                    # Express API
│   ├── server.js              # Boot + required-env check
│   ├── index.js               # App factory (CORS, helmet, /health, routers)
│   ├── routes/                # auth, meals, orders, payments
│   ├── middleware/            # authenticate (JWT), errorHandler
│   ├── services/              # authService, sanitiseMealContent
│   ├── schemas/               # Zod request validators
│   └── prisma/                # schema.prisma, migrations/, seed.js
├── k8s/                       # Kubernetes manifests + apply.sh
├── Dockerfile                 # Multi-stage API image
├── docker-compose.yml         # Local dev: api + db
└── package.json               # Frontend deps + dev:all orchestrator
```

---

## API Endpoints

### Auth

```
POST /auth/register
POST /auth/login
POST /auth/refresh
```

### Meals

```
GET  /meals                 # paginated meal list
GET  /meals/:id             # single meal detail
```

### Orders

```
POST /orders                # create order (protected, server-side total)
GET  /orders/:id            # single order (protected, IDOR-safe)
```

### Payments

```
POST /payments/checkout     # Stripe checkout session (planned)
POST /payments/webhook      # Stripe webhook handler (planned)
```

### Health

```
GET  /health                # liveness/readiness probe target
```

---

## Environment Variables

```env
# Server
DATABASE_URL=postgresql://feastbox:feastbox_dev@localhost:5433/feastbox
JWT_SECRET=                  # node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_REFRESH_SECRET=          # generate a second, distinct secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development
PORT=3000

# Stripe (planned)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Frontend (.env.local in repo root)
VITE_API_URL=http://localhost:3000
```

---

## Deployment

| Service | Platform | Status |
|---------|----------|--------|
| Local dev | docker-compose + `npm run dev:all` | Working |
| Kubernetes | Docker Desktop K8s, single `bash k8s/apply.sh` | Working |
| Frontend public | Vercel | Planned |
| Backend public | Render + Neon Postgres | Planned |

For the Kubernetes deploy walkthrough — manifests, ordering rationale, autoscaling demo, and ULO mapping — see [HD_README.md](./HD_README.md).

---

## Design Principles

This project applies named software engineering principles to every tool and architectural decision:

- **KISS** — Express over Fastify; REST over GraphQL; flat `server/` layout over `src/` nesting.
- **YAGNI** — Redis, OAuth, and CI/CD added when the need is demonstrated, not upfront.
- **DRY** — Prisma schema generates the client used across every route; `useFormValidation` composable centralises form rules.
- **Separation of Concerns** — frontend, API, and database are distinct layers; components never call `fetch` directly, only Pinia stores do.
- **Defence in Depth** — JWT in httpOnly refresh cookie, algorithm pinning (`HS256` only), bcrypt(12) hashing, Prisma parameterised queries, Zod `.strict()` on every body, DOMPurify on user-submittable HTML, non-root container + dropped Linux capabilities.
- **Least Privilege** — Postgres exposed via ClusterIP only (never NodePort), API runs as UID 1000, no raw passwords in code, secrets sourced from `.env` / K8s Secret.
- **Server-Authoritative Pricing** — clients send `{ servings, voucher? }`; the server computes `totalCents` from the database price. No client-submitted total is ever trusted.
- **IDOR Safety** — `GET /orders/:id` returns 404 (not 403) when a user requests an order they don't own. No existence oracle.

---

## Roadmap

**Phase 0 — Frontend optimisation**
<<<<<<< Updated upstream
- [x] Vue 3 frontend — meal browsing, cart, UI
- [x] Debounced multi-field search composable (`useSearch`)
- [x] Client-side pagination composable (`usePagination`)
- [x] Route-level lazy loading
- [x] `v-memo` on static meal cards
- [x] Pinia store audit — flatten state, remove no-op getters
=======
- [x] Vue 3 SPA — meal browsing, checkout wizard, UI
- [x] Debounced multi-field search composable (`useSearch`)
- [x] Client-side pagination composable (`usePagination`)
- [x] Schema-driven form validation composable (`useFormValidation`)
- [x] Route-level lazy loading
- [x] `v-memo` on static meal cards
- [x] Pinia store audit — flatten state, remove no-op getters
- [x] CSS tokens, accessibility pass (aria-hidden, inputmode)
>>>>>>> Stashed changes

**Phase 1 — Frontend deploy**
- [x] Vercel deployment (pre-backend snapshot)
- [ ] Re-deploy against the live backend

**Phase 2 — Backend + database**
<<<<<<< Updated upstream
- [x] Monorepo structure (`/client`, `/server`)
- [x] Express API + PostgreSQL schema
- [x] JWT authentication (register, login, refresh)
- [x] Meals + orders endpoints
- [ ] Stripe checkout + webhook

**Phase 3 — Containerisation + CI/CD**
- [x] Docker + docker-compose

**Future Enhancements**
- [ ] GitHub Actions CI/CD
=======
- [x] Express API + PostgreSQL schema (Prisma)
- [x] JWT authentication (register, login, refresh, algorithm pinning)
- [x] Meals endpoints with server-side XSS sanitisation
- [x] Orders endpoints (authenticated, server-side total, IDOR-safe)
- [x] 76 backend tests including IDOR, mass-assignment, alg-pinning
- [ ] Stripe checkout + webhook
- [ ] Frontend `useAuth` store + `LoginPage` wiring
- [ ] Render + Neon public backend deploy

**Phase 3 — Containerisation**
- [x] Multi-stage Dockerfile (non-root, tini)
- [x] docker-compose with api + db
- [x] `npm run dev:all` one-command startup
- [ ] GitHub Actions CI/CD
- [ ] Redis caching

**Phase 4 — Kubernetes**
- [x] Secret + ConfigMap + PersistentVolumeClaim
- [x] Postgres StatefulSet + ClusterIP Service
- [x] Run-once Migration Job
- [x] API Deployment (2 replicas, probes, resource limits, runAsNonRoot)
- [x] LoadBalancer Service on localhost:3000
- [x] HorizontalPodAutoscaler (2-5 replicas, 60% CPU)
- [x] In-cluster Container Registry + image-loader workaround for Docker Desktop kind
- [x] `apply.sh` orchestrated deploy script
- [ ] NetworkPolicy + RBAC + Ingress for multi-tenant clusters
- [ ] PVC snapshot/backup policy
- [ ] Pod Disruption Budget

**Future enhancements**
>>>>>>> Stashed changes
- [ ] AI recipe chatbot (Anthropic API)
- [ ] OAuth login (Google)
- [ ] Stripe subscription billing
- [ ] Real-DB integration test harness (`server/test-utils/db.js`)
- [ ] Component-level Vue tests
- [ ] Pinia store concurrency hardening
- [ ] Refresh-cookie cross-origin support (`SameSite=None; Secure; Partitioned`)

---

## Author

[Kyled0-0](https://github.com/Kyled0-0)
