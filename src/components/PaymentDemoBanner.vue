<template>
  <div class="demo-banner d-flex align-items-start gap-2 mb-4" role="note" aria-label="Demo notice">
    <i class="bi bi-info-circle-fill demo-banner__icon mt-1" aria-hidden="true"></i>
    <p class="mb-0">
      <strong>Demo only</strong> — Phase 2 will replace this form with Stripe Checkout.
      No real card data is collected or stored.
    </p>
  </div>
</template>

<script setup>
</script>

<style scoped>
.demo-banner {
  border: 2px solid var(--color-brand-orange);
  border-radius: 6px;
  padding: 12px 16px;
  background-color: var(--color-brand-orange-tint);
  font-size: 0.9rem;
}

.demo-banner__icon {
  color: var(--color-brand-orange);
  font-size: 1.1rem;
  flex-shrink: 0;
}
</style>
