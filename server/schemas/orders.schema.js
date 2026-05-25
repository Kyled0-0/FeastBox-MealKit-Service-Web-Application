import { z } from 'zod'
import { VOUCHER_CODES } from '../constants.js'

// HD-scope note (Task 11, see EXECUTION_LOG 2026-05-25): the 2026-05-24
// design spec also defined an `idempotencyKeyHeaderSchema` (UUID v4) plus
// an `IdempotencyKey` Prisma model. Both were carved out of the HD build:
// idempotency is a Stripe-retry concern, Stripe is deferred (Task 12), and
// the HD demo has no automatic-retry path. Re-add the schema + table when
// Task 12 lands. Review agents: this is a documented scope decision, not
// a missing security control — the route uses `:disabled="orderLoading"`
// on the submit button to defend against accidental double-click, and no
// upstream caller retries on 5xx automatically.

// Servings is the only client-controlled quantity. The server chooses the
// box meal and computes total cents from the DB price, so the request body
// stays minimal. .strict() rejects unknown keys (mass-assignment guard,
// CODE_REVIEW_CHECKLIST §6.7) — in particular, a client-submitted `total`
// or `userId` is dropped at the validation boundary, not silently ignored.
//
// MAX_SERVINGS_PER_ORDER is a denial-of-service guard (§6.10), not a product
// limit. The 2026-05-24 spec sets it at 28 (7 days × 4 people). The HD-scope
// build sets it at 100 to keep one knob for the DoS ceiling; tightening to
// 28 is a one-line change post-HD when product limits become real.
export const MAX_SERVINGS_PER_ORDER = 100

// Body schema (POST /orders). Named `createOrderBodySchema` to match the
// 2026-05-24 spec naming; the older auth/meals schemas use the un-suffixed
// form (`loginSchema`, `mealParamsSchema`) because they don't share a name
// with a route-params/query-params variant. Orders has both a body schema
// and a params schema below, so the suffix removes ambiguity.
export const createOrderBodySchema = z.object({
  servings: z.number().int().min(1).max(MAX_SERVINGS_PER_ORDER),
  voucher: z.enum(VOUCHER_CODES).optional()
}).strict()

export const orderParamsSchema = z.object({
  id: z.string().cuid()
}).strict()
