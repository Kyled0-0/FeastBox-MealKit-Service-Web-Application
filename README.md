# FeastBox

A fullstack meal-kit delivery web application. Browse curated meal plans, manage subscriptions, and checkout — built with Vue 3 on the frontend and Node.js + Express on the backend.

> **Status:** In active development. Core frontend complete. Fullstack upgrade in progress.

---

## Live Demo

[feast-box-vue.vercel.app](https://feast-box-vue.vercel.app)

---

## Tech Stack

**Frontend**
- Vue 3 (Composition API) + Vite
- Pinia, Vue Router
- Bootstrap 5

**Backend**
- Node.js + Express
- PostgreSQL + Prisma ORM
- JWT authentication
- Stripe payments

**Infrastructure**
- Docker + docker-compose
- Vercel (frontend)

---

## Getting Started

### Prerequisites

- Node.js v18+
- Docker + docker-compose

### Run locally

```bash
# Clone
git clone https://github.com/Kyled0-0/FeastBox_vue.git
cd FeastBox_vue

# Install dependencies
npm install

# Copy environment variables
cp server/.env.example server/.env
# Fill in: DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, STRIPE_SECRET_KEY

# Start all services (API + database + frontend)
docker compose up
```

Frontend: http://localhost:5173
API: http://localhost:3000

### Without Docker

```bash
# Start frontend
cd client && npm run dev

# Start API (requires local PostgreSQL running)
cd server && npm run dev
```

---

## Project Structure

```
FeastBox_vue/
├── client/               # Vue 3 frontend
│   ├── src/
│   │   ├── components/
│   │   ├── views/
│   │   ├── stores/       # Pinia
│   │   └── router/
│   └── vite.config.js
├── server/               # Express API
│   ├── src/
│   │   ├── routes/       # auth, meals, orders, payments
│   │   ├── middleware/   # authenticate, validate, errors
│   │   ├── services/     # business logic
│   │   └── lib/          # prisma client, stripe client
│   └── prisma/
│       └── schema.prisma
├── docker-compose.yml
└── package.json
```

---

## API Endpoints

### Auth

```
POST /auth/register
POST /auth/login
POST /auth/refresh
POST /auth/logout
```

### Meals

```
GET  /meals           # list all meal plans
GET  /meals/:id       # single meal
```

### Orders

```
POST /orders          # create order (protected)
GET  /orders          # user's orders (protected)
GET  /orders/:id      # single order (protected)
```

### Payments

```
POST /payments/checkout    # create Stripe checkout session
POST /payments/webhook     # Stripe webhook handler
```

---

## Environment Variables

```env
# Server
DATABASE_URL=postgresql://user:password@localhost:5432/feastbox
JWT_SECRET=
JWT_REFRESH_SECRET=
CLIENT_URL=http://localhost:5173

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Redis (Week 2)
REDIS_URL=redis://localhost:6379
```

---

## Deployment

| Service | Platform |
|---------|----------|
| Frontend | Vercel |
| API + DB | Railway |
| Local dev | docker-compose |

See [PLAN.md](./PLAN.md) for the full phased deployment breakdown.

---

## Design Principles

This project applies named software engineering principles to every tool and architectural decision:

- **KISS** — Express over Fastify; REST over GraphQL
- **YAGNI** — Redis and Zod added when the need is demonstrated, not upfront
- **DRY** — Prisma schema generates TypeScript types used across the entire backend
- **Separation of Concerns** — frontend, API, and database are distinct layers with defined contracts
- **Defense in Depth** — JWT in httpOnly cookies, bcrypt hashing, Prisma parameterised queries, Stripe webhook signature verification
- **Least Privilege** — no raw passwords stored, database credentials in environment variables only

---

## Roadmap

**Phase 0 — Frontend optimisation**
- [x] Vue 3 frontend — meal browsing, cart, UI
- [x] Debounced multi-field search composable (`useSearch`)
- [x] Client-side pagination composable (`usePagination`)
- [x] Route-level lazy loading
- [x] `v-memo` on static meal cards
- [x] Pinia store audit — flatten state, remove no-op getters

**Phase 1 — Frontend deploy**
- [x] Vercel deployment

**Phase 2 — Backend + database**
- [x] Monorepo structure (`/client`, `/server`)
- [x] Express API + PostgreSQL schema
- [x] JWT authentication (register, login, refresh)
- [x] Meals + orders endpoints
- [ ] Stripe checkout + webhook

**Phase 3 — Containerisation + CI/CD**
- [x] Docker + docker-compose

**Future Enhancements**
- [ ] GitHub Actions CI/CD
- [ ] AI recipe chatbot (Anthropic API)
- [ ] OAuth login (Google)
- [ ] Stripe subscription billing

---

## Author

[Kyled0-0](https://github.com/Kyled0-0)
