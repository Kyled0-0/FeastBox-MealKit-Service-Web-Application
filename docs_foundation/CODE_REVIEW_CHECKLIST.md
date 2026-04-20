# FeastBox — Code Review Checklist

Run this checklist before marking any task complete or creating a PR. Items marked ⚠️ are security-critical — they must pass, no exceptions.

---

## Vue 3 Checklist

- [ ] All components use `<script setup>` — no Options API, no `setup()` function
- [ ] All `ref`, `computed`, `watch`, `onMounted` etc. are explicitly imported from `'vue'`
- [ ] `watch` cleanup uses `onCleanup` parameter — not `return fn` (React pattern)
- [ ] No `watchEffect` where a single known dependency exists — use `watch` instead
- [ ] `v-for` lists have a `:key` that is a stable unique id (not array index)
- [ ] No `v-if` and `v-for` on the same element — use a wrapping element or `computed` filter
- [ ] Props are declared with `type` and `required` (or `default`)
- [ ] Emitted events are declared with `defineEmits`
- [ ] No component receives more than 5 props — use provide/inject or Pinia instead
- [ ] `v-memo` is applied to stable list items (MealCard)

---

## Pinia Checklist

- [ ] Store state is destructured using `storeToRefs` in every component that uses it
- [ ] Actions are destructured directly (without `storeToRefs`)
- [ ] All API calls happen inside store actions — not in components
- [ ] No getter that only returns `state.x` with no transformation
- [ ] New stores use Setup Store syntax (`defineStore('id', () => { ... })`)
- [ ] `loading` and `error` state is reset before each async action

---

## Composable Checklist

- [ ] Composable name starts with `use`
- [ ] Argument contract is documented — inputs that must be `ref`/`computed` are noted
- [ ] Returns only what callers need — internal refs are not exposed
- [ ] Unit tests exist and pass for new composables

---

## Backend / Express Checklist

- [ ] Each route file handles one domain only (auth, meals, orders, payments)
- [ ] Business logic is in `services/` — not inline in route handlers
- [ ] `errorHandler` is the last middleware registered in `server/index.js`
- [ ] All async route handlers have a `try/catch` that calls `next(err)`
- [ ] `PrismaClient` is instantiated once at module level — not inside a request handler

---

## ⚠️ Security Checklist

- [ ] No secrets, API keys, or tokens committed to the repository
- [ ] No `.env` file tracked by git — confirm with `git status`
- [ ] JWT access tokens have a short expiry (`15m`) — not `1d` or longer
- [ ] Refresh tokens are set as `httpOnly: true, secure: true` cookies — not in a JSON response body
- [ ] Protected routes apply `authenticate` middleware — new routes requiring auth are not accidentally public
- [ ] Stripe webhook route uses `express.raw()` — NOT `express.json()` — for signature verification
- [ ] Stripe webhook verifies `stripe-signature` with `stripe.webhooks.constructEvent` before processing any state change
- [ ] Prisma queries use parameterised values — no string interpolation into queries
- [ ] `cors` origin is set to `process.env.CLIENT_URL` — not `*`
- [ ] Password is hashed with bcrypt before storage — never stored or logged as plaintext

---

## Performance Checklist

- [ ] All route-level components in `src/router/index.js` use `() => import(...)` lazy loading
- [ ] `v-memo` applied to `MealCard` in list renders
- [ ] No unnecessary `watch` with `{ deep: true }` on large objects — use targeted watchers
- [ ] Pinia store does not hold large datasets that are never cleared (e.g. paginated API data should not accumulate infinitely)

---

## General Code Quality

- [ ] No `var` — only `const`/`let`
- [ ] No `.then()` chains — `async`/`await` throughout
- [ ] No inline `style=""` attributes — Bootstrap utilities or `<style scoped>`
- [ ] No dead code or commented-out blocks left behind
- [ ] File follows the import order from `docs_foundation/CODE_STYLE.md`
- [ ] Commit message follows `type: description` format (feat, fix, perf, chore, refactor)

---

## Bug Patterns to Watch (from project history)

These are known bugs caught during plan review — check specifically for these:

| Pattern | Where to look | What to check |
|---------|--------------|---------------|
| React-style `watchEffect` cleanup | Any new composable using `watchEffect` | Cleanup must use `onCleanup(fn)`, not `return fn` |
| Missing `storeToRefs` | Components that destructure store state | All state refs must go through `storeToRefs` |
| `api.js` called from component | Any `<script setup>` block | Only store actions should import and call `api` |
| Stripe webhook parsed before raw body check | `payments.js` route ordering | `express.raw()` must be on webhook route, before any `express.json()` applies |
| `PrismaClient` instantiated per request | Route handlers | One instance per module |
| Wrong Vite base path | `vite.config.js` | Must be `'/'` not `'/FeastBox_vue/'` |
