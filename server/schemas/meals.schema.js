import { z } from 'zod'

export const mealParamsSchema = z.object({
  id: z.string().cuid()
}).strict()

export const MEALS_PAGE_SIZE_DEFAULT = 25
export const MEALS_PAGE_SIZE_MAX = 100

export const mealsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(MEALS_PAGE_SIZE_MAX).default(MEALS_PAGE_SIZE_DEFAULT)
}).strict()
