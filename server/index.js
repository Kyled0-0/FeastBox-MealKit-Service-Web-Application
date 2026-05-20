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
  // CLIENT_URL accepts a single origin or a comma-separated allowlist. The
  // Vercel SPA and a contributor's localhost both need access in production
  // (CORS rejected one OR the other before this change). Same-origin and
  // server-to-server requests (no Origin header) pass through unchanged.
  // Hostnames are case-insensitive per RFC 3986 §3.2.2 — lowercase both
  // sides so a non-conformant client sending `Origin: https://VERCEL...`
  // is not denied. Scheme is also case-insensitive but always lowercase
  // in practice.
  //
  // Boot-time validation (fail-loud posture matching the rest of the
  // codebase): each entry must parse as a URL whose origin equals itself
  // — no path, no query, no fragment. Browsers always send Origin as
  // scheme://host[:port]; an entry with a path silently never matches.
  const allowedOrigins = (process.env.CLIENT_URL ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .map((s, i) => {
      // Boot-validation throws use `entry #${i+1}` rather than echoing `s`.
      // The userinfo path (and the query-string path) could otherwise leak
      // a copy-pasted secret to the deploy log — Render retains build logs
      // and the runbook in EXECUTION_LOG explicitly walks an operator
      // through pasting CLIENT_URL into the Render dashboard. CODE_REVIEW_
      // CHECKLIST.md §9: no secrets in logs.
      const where = `CLIENT_URL entry #${i + 1}`
      let url
      try { url = new URL(s) } catch {
        throw new Error(`${where} is not a valid URL.`)
      }
      // Protocol allowlist: anything else (ftp:, file:, ws:) parses fine
      // but never matches a browser-sent Origin, silently joining the
      // allowlist as dead config. Fail-loud per the rest of the codebase.
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new Error(`${where} must use http: or https: scheme (got ${url.protocol}).`)
      }
      // Userinfo (user:pass@host) is stripped by url.origin without
      // warning. Reject explicitly so an operator pasting a basic-auth
      // URL gets a loud error instead of an unauthenticated entry.
      if (url.username || url.password) {
        throw new Error(`${where} must not include userinfo (user:pass@host).`)
      }
      // `new URL()` canonicalises an empty pathname to '/', so the
      // truthiness guard is redundant — only the non-root case matters.
      if (url.pathname !== '/' || url.search || url.hash) {
        throw new Error(
          `${where} must be an origin (scheme://host[:port]) ` +
          `with no path/query/fragment. Browsers never send those in the Origin header.`
        )
      }
      // No second .toLowerCase() — the input is already lowercased above
      // and `new URL()`'s host parser canonicalises to lowercase on its own.
      return url.origin
    })
  app.use(cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin.toLowerCase())) return cb(null, true)
      // Deny gracefully (no Access-Control-Allow-Origin header) instead of
      // erroring — the browser blocks the JS context from reading the
      // response either way, and the server log stays clean.
      cb(null, false)
    },
    credentials: true
  }))

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
