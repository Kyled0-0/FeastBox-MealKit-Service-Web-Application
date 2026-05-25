// Shared backend constants. Lives outside `routes/` because both Zod schemas
// (z.enum needs the literal tuple at parse time) and route handlers (the
// discount math) reference VOUCHER_CODES — keeping the source of truth in
// one place avoids the drift-between-files class of bug.
//
// HD-scope note (see EXECUTION_LOG 2026-05-25): the 2026-05-24 design spec
// pinned the box product via a `Meal.isBoxProduct` boolean column with a
// stable seed ID `box-product-001`. The HD-scope build pins it via the
// `BOX_MEAL_ID` env var (with a `findFirst` fallback for dev/test ergonomics)
// to avoid a schema migration the K8s demo does not need. Re-introduce the
// boolean + seed row post-HD if the catalog grows multiple box products.
export const BOX_MEAL_ID = process.env.BOX_MEAL_ID ?? null

// VOUCHER_CODES is a literal tuple so Zod's z.enum() infers a narrow
// string-literal union (relevant if this ever migrates to TypeScript).
// MUST stay in sync with DISCOUNT_VOUCHERS keys; one-line drift risk
// accepted because there is exactly one voucher today.
export const VOUCHER_CODES = ['FEAST20']

export const DISCOUNT_VOUCHERS = Object.freeze({
  // Multiplier applied to subtotal (NOT a percentage off). FEAST20 = 20% off
  // means multiply by 0.8 — matches the 2026-05-24 spec §5.4 step 6.
  FEAST20: 0.8
})
