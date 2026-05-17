import { describe, it, expect } from 'vitest'
import jwt from 'jsonwebtoken'
import {
  hashPassword,
  verifyPassword,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
} from './authService.js'

describe('hashPassword', () => {
  // Plan used /^\$2b\$/ but bcryptjs@^3 can emit either $2a$ or $2b$ depending
  // on the internal versioning path. /^\$2[ab]\$/ is correct for bcryptjs@3.
  it('returns a bcrypt hash, not the plaintext', async () => {
    const hash = await hashPassword('mypassword')
    expect(hash).not.toBe('mypassword')
    expect(hash).toMatch(/^\$2[ab]\$/)
  })
})

describe('verifyPassword', () => {
  it('returns true for correct password', async () => {
    const hash = await hashPassword('correct')
    expect(await verifyPassword('correct', hash)).toBe(true)
  })

  it('returns false for wrong password', async () => {
    const hash = await hashPassword('correct')
    expect(await verifyPassword('wrong', hash)).toBe(false)
  })
})

describe('signAccessToken + verifyAccessToken', () => {
  it('signs and verifies a token', () => {
    const token = signAccessToken({ sub: 'user_123' })
    const payload = verifyAccessToken(token)
    expect(payload.sub).toBe('user_123')
  })

  it('rejects a token signed with the wrong secret', () => {
    const bad = jwt.sign({ sub: 'user' }, 'wrong_secret', { algorithm: 'HS256' })
    expect(() => verifyAccessToken(bad)).toThrow()
  })

  it('algorithm pinning: rejects an HS512-signed access token (control test)', () => {
    const hs512 = jwt.sign({ sub: 'attacker' }, process.env.JWT_SECRET, { algorithm: 'HS512' })
    expect(() => verifyAccessToken(hs512)).toThrow()
  })

  it('algorithm pinning: rejects a token with alg:none', () => {
    const tok = `${Buffer.from('{"alg":"none","typ":"JWT"}').toString('base64url')}.${Buffer.from(JSON.stringify({ sub: 'attacker' })).toString('base64url')}.`
    expect(() => verifyAccessToken(tok)).toThrow()
  })
})

describe('signRefreshToken + verifyRefreshToken', () => {
  it('signs and verifies a refresh token with the refresh secret', () => {
    const token = signRefreshToken({ sub: 'user_123' })
    const payload = verifyRefreshToken(token)
    expect(payload.sub).toBe('user_123')
  })

  it('algorithm pinning: rejects an HS512-signed refresh token (control test)', () => {
    const hs512 = jwt.sign({ sub: 'attacker' }, process.env.JWT_REFRESH_SECRET, { algorithm: 'HS512' })
    expect(() => verifyRefreshToken(hs512)).toThrow()
  })

  it('algorithm pinning: rejects a token with alg:none', () => {
    const tok = `${Buffer.from('{"alg":"none","typ":"JWT"}').toString('base64url')}.${Buffer.from(JSON.stringify({ sub: 'attacker' })).toString('base64url')}.`
    expect(() => verifyRefreshToken(tok)).toThrow()
  })
})
