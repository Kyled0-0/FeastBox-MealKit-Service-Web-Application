import { Router } from 'express'
import { rateLimit } from 'express-rate-limit'
import { prisma } from '../prisma/client.js'
import {
  hashPassword,
  verifyPassword,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} from '../services/authService.js'
import { registerSchema, loginSchema } from '../schemas/auth.schema.js'
import { logger } from '../logger.js'

// Precomputed hash for timing parity. verifyPassword is always called in login
// so an attacker cannot enumerate valid emails via response-time differences.
const DUMMY_HASH = await hashPassword('timing_parity_never_matches_any_real_password_xZ9#')

const REFRESH_COOKIE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'Strict',
  path: '/auth/refresh',
  maxAge: 7 * 24 * 60 * 60 * 1000
}

async function register(req, res, next) {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) {
    return next({ status: 400, message: 'Invalid input', details: parsed.error.flatten() })
  }
  const { email, password } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return next({ status: 409, message: 'Email already registered' })

  const passwordHash = await hashPassword(password)
  const user = await prisma.user.create({
    data: { email, passwordHash },
    select: { id: true, email: true, createdAt: true }
  })

  const accessToken = signAccessToken({ sub: user.id })
  const refreshToken = signRefreshToken({ sub: user.id })

  logger.info({ event: 'auth.register', outcome: 'success', userId: user.id })
  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE)
  res.status(201).json({ accessToken, user: { id: user.id, email: user.email } })
}

async function login(req, res, next) {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    return next({ status: 400, message: 'Invalid input', details: parsed.error.flatten() })
  }
  const { email, password } = parsed.data

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, passwordHash: true }
  })

  // Always call verifyPassword: prevents email enumeration via timing.
  const valid = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH)
  if (!valid || !user) {
    logger.warn({ event: 'auth.login', outcome: 'failure' })
    return next({ status: 401, message: 'Invalid credentials' })
  }

  const accessToken = signAccessToken({ sub: user.id })
  const refreshToken = signRefreshToken({ sub: user.id })

  logger.info({ event: 'auth.login', outcome: 'success', userId: user.id })
  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE)
  res.json({ accessToken })
}

async function refresh(req, res, next) {
  const token = req.cookies?.refreshToken
  if (!token) return next({ status: 401, message: 'Refresh token required' })

  let payload
  try {
    payload = verifyRefreshToken(token)
  } catch {
    return next({ status: 401, message: 'Invalid refresh token' })
  }

  res.json({ accessToken: signAccessToken({ sub: payload.sub }) })
}

export function createAuthRouter() {
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false
  })

  const router = Router()
  router.post('/register', authLimiter, register)
  router.post('/login', authLimiter, login)
  router.post('/refresh', refresh)
  return router
}
