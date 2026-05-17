import { verifyAccessToken } from '../services/authService.js'

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next({ status: 401, message: 'Authorization header required' })
  }
  const token = authHeader.slice(7)
  try {
    req.user = verifyAccessToken(token)
    next()
  } catch {
    next({ status: 401, message: 'Invalid or expired token' })
  }
}
