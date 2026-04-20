# FeastBox — Workflows

Playbooks for the most common development tasks. Each workflow is a repeatable sequence — follow it in order.

---

## Workflow 1: Adding a New Vue Component

**When:** Building a new page, extracting repeated markup, or adding a UI element.

1. **Determine placement**
   - Page-level component → `src/components/<PageName>.vue`
   - Reused UI element → `src/components/<ElementName>.vue`
   - If it needs local state shared with children → create a composable first (Workflow 3)

2. **Create the file using `<script setup>`**

   ```vue
   <!-- src/components/ExampleCard.vue -->
   <template>
     <div class="card">{{ item.title }}</div>
   </template>

   <script setup>
   defineProps({
     item: { type: Object, required: true }
   })
   </script>

   <style scoped>
   /* component-local overrides only */
   </style>
   ```

3. **Add the route if it's a page** — edit `src/router/index.js` using lazy import:

   ```js
   { path: '/example', component: () => import('@/components/ExampleCard.vue'), meta: { showNavbar: true } }
   ```

4. **Test in browser** — `npm run dev`, navigate to the route, verify template renders with no `[Vue warn]`.

5. **Commit**

   ```bash
   git add src/components/ExampleCard.vue src/router/index.js
   git commit -m "feat: add ExampleCard component"
   ```

---

## Workflow 2: Adding a New API Route (Backend)

**When:** Adding a new server-side feature (new resource, new action).

1. **Add route file** (or extend existing domain file) in `server/routes/`

   ```js
   // server/routes/example.js
   import { Router } from 'express'
   import { PrismaClient } from '@prisma/client'

   const router = Router()
   const prisma = new PrismaClient()

   router.get('/', async (req, res, next) => {
     try {
       const items = await prisma.example.findMany()
       res.json(items)
     } catch (err) { next(err) }
   })

   export default router
   ```

2. **Register in `server/index.js`** — before `errorHandler`:

   ```js
   import exampleRouter from './routes/example.js'
   app.use('/example', exampleRouter)
   ```

3. **Add Prisma model if needed** — edit `server/prisma/schema.prisma`, then:

   ```bash
   npx prisma migrate dev --name add-example-model
   ```

4. **Test manually with curl or a REST client**

   ```bash
   curl http://localhost:3000/example
   # Expected: 200 with JSON array
   ```

5. **Write an integration test** — follow the pattern in `docs_foundation/TESTING.md`.

6. **Commit**

   ```bash
   git add server/routes/example.js server/index.js server/prisma/
   git commit -m "feat: add /example route"
   ```

---

## Workflow 3: Adding a New Pinia Store

**When:** A new data domain needs shared state (Phase 2+), or a component is managing state that two or more components need.

1. **Create the store file** using Setup Store syntax:

   ```js
   // src/stores/example.js
   import { ref } from 'vue'
   import { defineStore } from 'pinia'
   import { api } from '@/services/api'

   export const useExample = defineStore('example', () => {
     const items = ref([])
     const loading = ref(false)
     const error = ref(null)

     async function fetchItems() {
       loading.value = true
       error.value = null
       try {
         items.value = await api.get('/example')
       } catch (e) {
         error.value = e.message
       } finally {
         loading.value = false
       }
     }

     return { items, loading, error, fetchItems }
   })
   ```

2. **Use in a component with `storeToRefs`**:

   ```js
   import { storeToRefs } from 'pinia'
   import { useExample } from '@/stores/example'

   const store = useExample()
   const { items, loading, error } = storeToRefs(store)
   const { fetchItems } = store
   ```

3. **Write a unit test** — mock `api.js` and test state transitions.

4. **Commit**

   ```bash
   git add src/stores/example.js
   git commit -m "feat: add example Pinia store"
   ```

---

## Workflow 4: Deploying Frontend to Vercel

**When:** Feature is complete, all local tests pass, ready to ship.

1. **Verify build succeeds locally**

   ```bash
   npm run build
   # Expected: dist/ created, no errors
   ```

2. **Preview the production build**

   ```bash
   npm run preview
   # Visit http://localhost:4173 — verify golden path works
   ```

3. **Deploy**

   ```bash
   vercel --prod
   ```

4. **Verify on Vercel URL** — check all routes load, API calls reach Railway.

---

## Workflow 5: Deploying Backend to Railway

Railway deploys automatically when GitHub Actions CI passes on `main`. For manual deploys:

1. **Ensure migrations are committed**

   ```bash
   cd server
   npx prisma migrate dev --name <description>
   git add prisma/migrations/
   git commit -m "chore: add migration <description>"
   ```

2. **Push to main** — GitHub Actions runs migrations then deploys:

   ```bash
   git push origin main
   ```

3. **Monitor Railway logs** — check for `API running on port ...` and no Prisma errors.

4. **Test a live endpoint**

   ```bash
   curl https://<your-railway-app>.railway.app/meals
   ```

---

## Workflow 6: Starting Local Full-Stack Development

**When:** Working on a feature that touches both frontend and backend.

```bash
# Option A — Docker (matches production exactly)
docker compose up --build
# API at localhost:3000, DB at localhost:5432
# Then in a second terminal:
npm run dev
# Frontend at localhost:5173

# Option B — Manual (faster startup)
cd server && node index.js   # terminal 1
npm run dev                  # terminal 2 (project root)
```

Ensure `server/.env` has:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/feastbox
JWT_SECRET=dev-secret
JWT_REFRESH_SECRET=dev-refresh-secret
CLIENT_URL=http://localhost:5173
```

---

## Workflow 7: Debugging a Vue Reactivity Problem

**Symptom:** Template doesn't update when data changes, or a computed/watcher doesn't fire.

1. **Check if store state was destructured without `storeToRefs`**

   ```js
   // Is this in the component?
   const { meals } = useMeals()  // ❌ loses reactivity

   // Fix:
   const { meals } = storeToRefs(useMeals())  // ✅
   ```

2. **Check if a plain value was passed to a composable instead of a ref**

   ```js
   // Is items a plain array here?
   const { results } = useSearch(meals.value, ['title'])  // ❌ .value unwraps to plain array

   // Fix: pass the ref itself
   const { results } = useSearch(meals, ['title'])  // ✅
   ```

3. **Check if `watchEffect` is using React cleanup pattern**

   ```js
   // Does the watcher look like this?
   watchEffect(() => {
     const t = setTimeout(...)
     return () => clearTimeout(t)  // ❌ Vue ignores this
   })

   // Fix:
   watchEffect((onCleanup) => {
     const t = setTimeout(...)
     onCleanup(() => clearTimeout(t))  // ✅
   })
   ```

4. **Open Vue DevTools** — inspect the component's reactive state in the Components tab. Confirm the ref/computed has the expected value.

5. **Add a temporary `watch` with `{ immediate: true }`** to log when a value changes:

   ```js
   watch(meals, (v) => console.log('meals changed:', v), { immediate: true })
   ```

---

## Workflow 8: Adding a New Composable

**When:** Logic is needed in two or more components, or component script is growing beyond ~50 lines of state/watcher logic.

1. **Create `src/composables/use<Name>.js`**
2. **Document the argument contract at the top** — state whether inputs must be `ref`/`computed`
3. **Import all Vue reactivity utilities explicitly** — `ref`, `computed`, `watch` from `'vue'`
4. **Return only what callers need** — don't expose internal implementation refs
5. **Write a unit test** — see `docs_foundation/TESTING.md` for the pattern
6. **Commit**

   ```bash
   git add src/composables/use<Name>.js src/composables/use<Name>.test.js
   git commit -m "feat: add use<Name> composable"
   ```
