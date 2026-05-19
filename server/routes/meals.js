import { Router } from 'express'
import { prisma } from '../prisma/client.js'
import { mealParamsSchema, mealsQuerySchema } from '../schemas/meals.schema.js'

const router = Router()

// List view: card-level fields only. The detail JSONB (steps, ingredients,
// nutriFacts) is large and unnecessary here; fetched separately by GET /:id.
const LIST_SELECT = {
  id: true,
  title: true,
  nameExtend: true,
  description: true,
  cuisine: true,
  tags: true,
  imageUrl: true,
  pricePerServingCents: true,
  createdAt: true
}

router.get('/', async (req, res, next) => {
  const parsed = mealsQuerySchema.safeParse(req.query)
  if (!parsed.success) {
    return next({ status: 400, message: 'Invalid query', details: parsed.error.flatten() })
  }
  const { page, pageSize } = parsed.data

  const meals = await prisma.meal.findMany({
    select: LIST_SELECT,
    orderBy: { createdAt: 'asc' },
    skip: (page - 1) * pageSize,
    take: pageSize
  })
  res.json(meals)
})

router.get('/:id', async (req, res, next) => {
  const parsed = mealParamsSchema.safeParse(req.params)
  if (!parsed.success) return next({ status: 404, message: 'Meal not found' })

  const meal = await prisma.meal.findUnique({ where: { id: parsed.data.id } })
  if (!meal) return next({ status: 404, message: 'Meal not found' })

  res.json(meal)
})

export default router
