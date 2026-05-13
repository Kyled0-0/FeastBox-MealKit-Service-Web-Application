import { Router } from 'express'
import { authenticate } from '../middleware/authenticate.js'
const router = Router()
router.use(authenticate)
// Task 11: POST /orders, GET /orders/:id
export default router
