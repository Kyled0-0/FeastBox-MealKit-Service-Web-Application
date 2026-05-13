import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'

// 4 rounds in test keeps the suite fast; 12 is the production setting.
const SALT_ROUNDS = process.env.NODE_ENV === 'test' ? 4 : 12

export async function hashPassword(password) {
  return bcryptjs.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password, hash) {
  return bcryptjs.compare(password, hash)
}

// Destructure { sub } at the boundary so callers cannot accidentally
// pass a full User object and embed passwordHash in the JWT body.
export function signAccessToken({ sub }) {
  return jwt.sign({ sub }, process.env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: '15m'
  })
}

export function signRefreshToken({ sub }) {
  return jwt.sign({ sub }, process.env.JWT_REFRESH_SECRET, {
    algorithm: 'HS256',
    expiresIn: '7d'
  })
}

export function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] })
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET, { algorithms: ['HS256'] })
}
