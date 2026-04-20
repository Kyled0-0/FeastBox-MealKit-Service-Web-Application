# FeastBox — Code Style

These rules apply to every file in this project. They exist to prevent the specific bugs and anti-patterns found during the initial plan review.

---

## File & Folder Naming

| Type | Convention | Example |
|------|-----------|---------|
| Vue components | PascalCase | `MealCard.vue`, `MenuPage.vue` |
| Composables | camelCase, `use` prefix | `useSearch.js`, `usePagination.js` |
| Pinia stores | camelCase, `use` prefix | `form.js` (exported as `useMealForm`) |
| Services | camelCase | `api.js`, `authService.js` |
| Folders | camelCase | `composables/`, `stores/`, `services/` |

One component per file. One folder per feature group. Do not co-locate unrelated components because they are small.

---

## JavaScript Conventions

```js
// ✅ const/let only
const meals = ref([])
let timer = null

// ✅ Optional chaining and nullish coalescing
const title = item?.title ?? 'Untitled'

// ✅ async/await over .then()
async function fetchMeals() {
  const data = await api.get('/meals')
  return data
}

// ✅ Destructuring
const { query, results } = useSearch(meals, ['title'])
const { meals, loading } = storeToRefs(useMeals())

// ❌ No var
var x = 1

// ❌ No .then() chains
api.get('/meals').then(d => { meals.value = d }).catch(...)
```

---

## Vue 3 Standards

### Always use `<script setup>`

```vue
<!-- ✅ Correct -->
<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>

<!-- ❌ Never use Options API or setup() function for new components -->
<script>
export default {
  data() { return { count: 0 } }
}
</script>
```

### Define props with validation

```vue
<script setup>
// ✅ Always declare type and required
defineProps({
  meal: {
    type: Object,
    required: true
  },
  pageSize: {
    type: Number,
    default: 9
  }
})
</script>
```

### Emit events explicitly

```vue
<script setup>
// ✅ Declare all emitted events
const emit = defineEmits(['update:modelValue', 'submit'])
</script>
```

### `watch` vs `watchEffect`

Use **`watch`** when you know exactly which ref to observe. Use **`watchEffect`** only for side effects that depend on multiple reactive sources and you want implicit dependency tracking.

```js
// ✅ watch — explicit dependency, doesn't run on mount
watch(query, (val, _, onCleanup) => {
  const t = setTimeout(() => { debouncedQuery.value = val }, 300)
  onCleanup(() => clearTimeout(t))
})

// ✅ watchEffect — use only when dependencies are multiple and implicit
watchEffect((onCleanup) => {
  const t = doSomethingWith(a.value, b.value, c.value)
  onCleanup(() => t.cancel())
})

// ❌ Never use React-style return for cleanup — Vue ignores the return value
watchEffect(() => {
  const t = setTimeout(...)
  return () => clearTimeout(t)  // DOES NOTHING in Vue
})
```

### Explicit imports — no auto-imports configured

```js
// ✅ Always import from 'vue'
import { ref, computed, watch, onMounted } from 'vue'

// ✅ Always import from 'pinia'
import { defineStore } from 'pinia'
import { storeToRefs } from 'pinia'
```

### `v-memo` for stable list items

```vue
<!-- ✅ Use v-memo on list items where data rarely changes -->
<MealCard v-memo="[meal.id]" :meal="meal" />

<!-- Only re-renders if meal.id changes — skips diffing on every parent update -->
```

### Composable argument contract

Composables expect `ref` or `computed` inputs — never plain values. Document this at the top:

```js
// src/composables/useSearch.js
// Contract: `items` must be a ref<Array> or computed<Array>
export function useSearch(items, fields) { ... }
```

---

## Pinia Patterns

### Use Setup Store for new stores

```js
// ✅ Setup Store — matches Composition API style
export const useMeals = defineStore('meals', () => {
  const meals = ref([])
  const loading = ref(false)

  async function fetchMeals() { ... }

  return { meals, loading, fetchMeals }
})

// Existing Options Store (form.js) — valid, no migration needed unless reworking
```

### `storeToRefs` is required for reactive state destructuring

```js
// ✅ Correct — reactive state preserved
const { meals, loading } = storeToRefs(useMeals())
const { fetchMeals } = useMeals()  // actions don't need storeToRefs

// ❌ Wrong — meals and loading become non-reactive plain values
const { meals, loading, fetchMeals } = useMeals()
```

### API calls belong in store actions only

```js
// ✅ Store action calls api.js
async function fetchMeals() {
  loading.value = true
  try {
    meals.value = await api.get('/meals')
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

// ❌ Never call fetch/api.js directly from a component
onMounted(async () => {
  const data = await fetch('/meals')  // wrong place
})
```

### Getters must compute — no pass-throughs

```js
// ✅ Getter performs transformation
totalPrice: (state) => state.totalServings * 6.99

// ❌ Pass-through getter adds no value — access state directly instead
planPreference: (state) => state.planData.preference
```

---

## Express / Backend Conventions

### One router per domain

```
routes/auth.js      — /auth/*
routes/meals.js     — /meals/*
routes/orders.js    — /orders/*
routes/payments.js  — /payments/*
```

### Business logic stays in services, not routes

```js
// ✅ Route handler: parse → call service/Prisma → respond
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    res.json({ accessToken: signAccessToken(user.id) })
  } catch (err) {
    next(err)  // always forward to errorHandler
  }
})

// ❌ Never embed bcrypt/JWT logic inline in a route handler
```

### Error handler is always last middleware

```js
// server/index.js — errorHandler must be registered after all routes
app.use('/auth', authRouter)
app.use('/meals', mealsRouter)
app.use(errorHandler)  // last
```

### One PrismaClient per module

```js
// ✅ One instance at module level, reused per request
const prisma = new PrismaClient()

// ❌ Never instantiate per-request — exhausts connection pool
router.get('/', async (req, res) => {
  const prisma = new PrismaClient()  // wrong
})
```

---

## CSS Conventions

- Use Bootstrap 5 utilities first — add custom CSS only when utilities cannot achieve the layout
- Custom CSS goes in `src/assets/resources/css/style.css` (global) or `<style scoped>` (component-local)
- Never use inline `style=""` attributes
- Brand colours via CSS custom properties or direct hex values:
  - Primary: `#ff603d` (orange)
  - Accent: `#70d4ea` (blue)

```vue
<!-- ✅ Bootstrap utilities + scoped override -->
<div class="card h-100 meal-card">...</div>

<style scoped>
.meal-card { border-radius: 12px; }
</style>

<!-- ❌ Inline styles -->
<div style="border-radius: 12px;">...</div>
```

---

## Import Order

Within any file, order imports as:

1. Vue core (`vue`, `vue-router`, `pinia`)
2. Third-party libraries
3. Internal stores (`@/stores/...`)
4. Internal services (`@/services/...`)
5. Internal composables (`@/composables/...`)
6. Internal components (`@/components/...`)
7. Assets

```js
// ✅ Correct import order
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useMeals } from '@/stores/meals'
import { useSearch } from '@/composables/useSearch'
import MealCard from '@/components/MealCard.vue'
import beefWraps from '@/assets/resources/img/beefwraps/beef-wraps.jpeg'
```

---

## Anti-Patterns Reference

| Anti-pattern | Why it breaks | Correct alternative |
|---|---|---|
| `watchEffect(() => { return cleanup })` | Vue ignores the return value — cleanup never runs | `watchEffect((onCleanup) => { onCleanup(cleanup) })` |
| `const { state } = useStore()` | Destructured value loses reactivity | `const { state } = storeToRefs(useStore())` |
| Calling `api.js` inside a component | Bypasses store, duplicates error/loading logic | Call only from Pinia store actions |
| `new PrismaClient()` inside a route handler | Creates a new DB connection per request | One `PrismaClient` instance at module level |
| `express.json()` before Stripe webhook route | Strips raw body, breaks signature verification | Use `express.raw()` on webhook route specifically |
| `base: '/FeastBox_vue/'` in `vite.config.js` | Wrong path for Vercel, breaks asset URLs | `base: '/'` |
