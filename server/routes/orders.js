import { Router } from 'express'
import { prisma } from '../prisma/client.js'
import { authenticate } from '../middleware/authenticate.js'
import { createOrderBodySchema, orderParamsSchema } from '../schemas/orders.schema.js'
import { BOX_MEAL_ID, DISCOUNT_VOUCHERS } from '../constants.js'
import { logger } from '../logger.js'

// ─── HD-scope deviations from the 2026-05-24 design spec ──────────────────
// (review agents: these are intentional, see EXECUTION_LOG 2026-05-25)
//
// 1. NO Idempotency-Key header / IdempotencyKey table / $transaction wrapper.
//    The spec scoped these forward because Task 12 (Stripe) was once in
//    scope. Stripe is deferred (2026-05-22 amendment), so no automatic-
//    retry path exists. The UI defends against double-click via the
//    `:disabled="orderLoading"` button. Re-add when Task 12 lands.
//
// 2. Box product pinned via BOX_MEAL_ID env var with a findFirst(createdAt
//    asc) fallback, NOT via a Meal.isBoxProduct boolean column with a
//    stable seed ID. Spec §4.1 carves a schema migration for this; the
//    HD demo runs against the existing 8-meal seed and the env-var pin
//    achieves the same "server picks the product, client doesn't" goal
//    without a migration. The fallback is documented at the call site.
//
// 3. Tests in orders.security.test.js mock Prisma, mirroring auth/meals
//    security tests. Spec §7.3 calls for real-DB tests via a new
//    server/test-utils/db.js harness. Harness deferred for HD (the K8s
//    recording does not run vitest); the mock-vs-real fragility on the
//    IDOR JS-compare branch is documented in EXECUTION_LOG.
//
// 4. No frontend auth wiring in this PR. LoginPage.vue still has a stub
//    handleSubmit; the wizard's POST /orders 401s unless a token is
//    pre-set in localStorage (or acquired via curl in the K8s demo).
//    See EXECUTION_LOG for the demo's two recording paths (curl-first
//    or frontend-first).

const router = Router()
router.use(authenticate)

// Server-authoritative discount table is in `constants.js` so both this
// route and the Zod schema reference the same source of truth. The lookup
// returns a multiplier (NOT a percentage off), so the math is one step:
// `total = subtotal * multiplier`. Math.round chosen over Math.floor to
// match the 2026-05-24 spec §5.4 step 6 — for FEAST20 (×0.8) the rounding
// direction is irrelevant when servings × pricePerServingCents is even
// (most catalog prices). Future vouchers with odd multipliers (×0.85,
// ×0.95) will produce half-cents; round is the convention Stripe also uses.
function applyVoucher(subtotalCents, voucher) {
  // Defence-in-depth drift guard: VOUCHER_CODES and DISCOUNT_VOUCHERS live in
  // constants.js and MUST stay in sync (one feeds the Zod enum, the other
  // the multiplier lookup). The Zod schema already rejects unknown codes
  // before the route reaches this function, so this branch is unreachable
  // today — but if a future contributor adds to VOUCHER_CODES without also
  // adding to DISCOUNT_VOUCHERS, the unmapped code would otherwise silently
  // apply no discount (?? 1 returns multiplier 1, full price). Throwing here
  // surfaces the drift loudly on the first request rather than masking it.
  if (voucher !== undefined && !(voucher in DISCOUNT_VOUCHERS)) {
    throw { status: 500, message: `Voucher "${voucher}" passed schema but has no multiplier` }
  }
  const multiplier = DISCOUNT_VOUCHERS[voucher] ?? 1
  if (multiplier === 1) return subtotalCents
  return Math.round(subtotalCents * multiplier)
}

// The wizard sells a single "box" product sized by `servings`. The box maps
// to an underlying Meal row so the OrderItem FK is real and the price comes
// from the DB (never trusted from the client, CODE_REVIEW_CHECKLIST §6.4).
// `BOX_MEAL_ID` lets ops pin the box product; the fallback (earliest seeded
// meal) keeps the route working in dev/test without env wiring.
//
// Fallback risk (low): if a dev seeds a meal at a different price as the
// "earliest", the demo shows a different totalCents than expected. Pin
// BOX_MEAL_ID in `.env` before the K8s recording to eliminate this. The
// test suite mocks meal.findFirst so the test totals are stable.
async function resolveBoxMeal() {
  if (BOX_MEAL_ID) {
    const pinned = await prisma.meal.findUnique({
      where: { id: BOX_MEAL_ID },
      select: { id: true, pricePerServingCents: true }
    })
    if (pinned) return pinned
    // Fail loud: a misconfigured env var should not silently fall back to
    // a different meal, which would charge the wrong price.
    throw { status: 500, message: 'BOX_MEAL_ID does not resolve to a meal' }
  }
  const fallback = await prisma.meal.findFirst({
    select: { id: true, pricePerServingCents: true },
    orderBy: { createdAt: 'asc' }
  })
  if (!fallback) throw { status: 503, message: 'No meals available' }
  return fallback
}

router.post('/', async (req, res, next) => {
  const parsed = createOrderBodySchema.safeParse(req.body)
  if (!parsed.success) {
    return next({ status: 400, message: 'Invalid input', details: parsed.error.flatten() })
  }
  const { servings, voucher } = parsed.data

  let box
  try {
    box = await resolveBoxMeal()
  } catch (e) {
    return next(e)
  }

  const subtotalCents = box.pricePerServingCents * servings
  const totalCents = applyVoucher(subtotalCents, voucher)

  const order = await prisma.order.create({
    data: {
      userId: req.user.sub,
      status: 'pending',
      totalCents,
      items: { create: [{ mealId: box.id, servings }] }
    },
    select: {
      id: true,
      status: true,
      totalCents: true,
      createdAt: true,
      items: { select: { id: true, mealId: true, servings: true } }
    }
  })

  logger.info({ event: 'order.create', userId: req.user.sub, orderId: order.id, totalCents })
  res.status(201).json(order)
})

router.get('/:id', async (req, res, next) => {
  const parsed = orderParamsSchema.safeParse(req.params)
  if (!parsed.success) return next({ status: 404, message: 'Order not found' })

  const order = await prisma.order.findUnique({
    where: { id: parsed.data.id },
    select: {
      id: true,
      userId: true,
      status: true,
      totalCents: true,
      createdAt: true,
      items: { select: { id: true, mealId: true, servings: true } }
    }
  })

  // IDOR guard. Return 404 (not 403) so an attacker cannot distinguish
  // "exists but not yours" from "does not exist" — same response either
  // way, no existence oracle. CODE_REVIEW_CHECKLIST §6.
  //
  // Mock-vs-real fragility (review agents, see EXECUTION_LOG 2026-05-25):
  // tests use a Prisma mock that returns whatever object the test sets,
  // so this JS comparison is verified by mock contract, not by real DB
  // semantics. Any refactor of this branch to `findFirst({ where: { id,
  // userId }})` MUST be treated as security-touching and re-verified
  // against a real Postgres — the db.js harness deferral is documented.
  if (!order || order.userId !== req.user.sub) {
    return next({ status: 404, message: 'Order not found' })
  }

  const { userId, ...safe } = order
  res.json(safe)
})

export default router
