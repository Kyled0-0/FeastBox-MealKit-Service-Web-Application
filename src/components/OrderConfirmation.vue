<template>
  <div class="container my-5">
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-brand" role="status">
        <span class="visually-hidden">Loading order…</span>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger" role="alert">
      <strong>Could not load order.</strong> {{ error.message }}
      <div class="mt-2 d-flex gap-2">
        <!-- Retry covers the K8s cold-start case: DB pod still becoming
             ready when the confirmation page mounts → 5xx → user has a
             recovery path without re-running the wizard. Hidden for 404
             (genuine miss / IDOR) because retrying that resolves nothing. -->
        <button v-if="error.status !== 404" type="button"
                class="btn btn-outline-danger btn-sm" @click="retry">
          Retry
        </button>
        <router-link to="/menu" class="btn btn-outline-secondary btn-sm">Back to menu</router-link>
      </div>
    </div>

    <div v-else-if="currentOrder" class="confirmation-card mx-auto p-4 p-md-5 text-center">
      <div class="text-success mb-3">
        <i class="bi bi-check-circle-fill display-3" aria-hidden="true"></i>
      </div>
      <h2 class="mb-2">Order placed</h2>
      <p class="text-muted mb-4">Your FeastBox order is in. We'll be in touch when it's on its way.</p>

      <dl class="row text-start mb-4">
        <dt class="col-sm-5">Order reference</dt>
        <dd class="col-sm-7"><code>{{ currentOrder.id }}</code></dd>

        <dt class="col-sm-5">Status</dt>
        <dd class="col-sm-7"><span class="badge bg-secondary text-uppercase">{{ currentOrder.status }}</span></dd>

        <dt class="col-sm-5">Items</dt>
        <dd class="col-sm-7">{{ totalServings }} serving{{ totalServings === 1 ? '' : 's' }}</dd>

        <dt class="col-sm-5">Total charged</dt>
        <dd class="col-sm-7"><strong>${{ totalDollars }}</strong></dd>
      </dl>

      <div class="d-flex gap-2 justify-content-center">
        <router-link to="/menu" class="btn btn-custom2 fw-bold">Browse meals</router-link>
        <router-link to="/" class="btn btn-outline-secondary">Back home</router-link>
      </div>
    </div>

    <!-- Defensive v-else: the watch with immediate:true sets loading=true
         synchronously before first paint, so reaching this branch requires
         a future code path that bypasses fetchOrder. Renders a neutral
         empty state rather than a blank screen. -->
    <div v-else class="text-center text-muted py-5">No order data.</div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useOrders } from '@/stores/orders'

// `:id` arrives as a prop because the route is declared with `props: true`.
// defineProps is preferred over `useRoute().params.id` in same-route param
// navigations: the component instance is reused, so `props.id` is the
// reactive source of truth Vue Router maintains for us. Matches the
// 2026-05-24 design spec §6.6.
const props = defineProps({ id: { type: String, required: true } })

const orders = useOrders()
const { currentOrder, loading, error } = storeToRefs(orders)

// Watch the route param so navigating /order-confirmation/A → .../B
// re-fetches rather than showing A's data under B's URL. Vue Router
// reuses the component on same-route param changes, so `onMounted` only
// fires once per match — `watch` with `immediate: true` covers both the
// initial landing and subsequent navigations in one branch.
//
// If the user landed here via the wizard, currentOrder is already populated
// by createOrder() and we skip the round-trip. On a refresh or shared link,
// fetchOrder hits GET /orders/:id and the IDOR guard rejects with 404 if
// the id is not theirs.
watch(
  () => props.id,
  (id) => {
    if (!id) return
    if (!currentOrder.value || currentOrder.value.id !== id) {
      orders.fetchOrder(id)
    }
  },
  { immediate: true }
)

const totalServings = computed(() =>
  (currentOrder.value?.items ?? []).reduce((sum, i) => sum + i.servings, 0)
)

const totalDollars = computed(() =>
  ((currentOrder.value?.totalCents ?? 0) / 100).toFixed(2)
)

// Used by the Retry button in the error branch. The store's fetchOrder
// already clears `currentOrder` and `error` synchronously, so the click
// → spinner → resolved-order transition is reactive without further wiring.
const retry = () => orders.fetchOrder(props.id)
</script>

<style scoped>
.confirmation-card {
  max-width: 560px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

.btn-custom2 {
  background-color: var(--color-brand-yellow);
  border-radius: 30px;
}

.btn-custom2:hover {
  background-color: var(--color-brand-yellow-light);
}

dt {
  font-weight: 500;
  color: #6c757d;
}
</style>
