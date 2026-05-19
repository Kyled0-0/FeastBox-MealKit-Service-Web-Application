import DOMPurify from 'isomorphic-dompurify'

// Meal step instructions allow inline <span> (ingredient highlight) and
// <strong>. All other tags and attributes are stripped.
//
// SCOPE: this module sanitises the `stepText` field only. It does NOT
// validate the shape of `steps`, `ingredients`, or `nutriFacts`. The seed
// is the sole writer today, so this is sufficient.
//
// CONSUMER NOTE: `meal.steps[].stepText` is rendered with `v-html` in the
// frontend (Commit 3 / src/components/MealPage.vue). The CODE_REVIEW_CHECKLIST
// §1 carve-out for `v-html` holds ONLY because every write goes through this
// sanitiser. Do not bypass it.
//
// TODO (when admin write endpoint lands): pair this sanitiser with Zod
// schemas (nutriFactsSchema, ingredientSchema, stepSchema) in
// server/schemas/meals.schema.js and validate the request body before
// invoking sanitiseMealSteps. Sanitisation is a defence-in-depth layer,
// not a substitute for shape validation.
const STEP_TEXT_POLICY = { ALLOWED_TAGS: ['span', 'strong'], ALLOWED_ATTR: [] }

export function sanitiseStepText(html) {
  return DOMPurify.sanitize(html, STEP_TEXT_POLICY)
}

export function sanitiseMealSteps(steps) {
  return steps.map((step) => ({
    ...step,
    stepText: sanitiseStepText(step.stepText)
  }))
}
