import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { createAuthRouter } from './routes/auth.js'
import mealsRouter from './routes/meals.js'
import ordersRouter from './routes/orders.js'
import paymentsRouter from './routes/payments.js'
import { errorHandler } from './middleware/errorHandler.js'

export function createApp() {
  const app = express()

  app.use(helmet())
  app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))

  // Webhook before express.json(): raw body required for Stripe HMAC (Task 12)
  app.post(
    '/payments/webhook',
    express.raw({ type: 'application/json', limit: '1mb' }),
    (_req, res) => res.sendStatus(200)
  )

  app.use(express.json({ limit: '10kb' }))
  app.use(cookieParser())

  app.get('/health', (_req, res) => res.json({ status: 'ok' }))

  app.use('/auth', createAuthRouter())
  app.use('/meals', mealsRouter)
  app.use('/orders', ordersRouter)
  app.use('/payments', paymentsRouter)

  app.use((_req, res) => res.status(404).json({ error: 'Not found' }))
  app.use(errorHandler)

  return app
}
