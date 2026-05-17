import jwt from 'jsonwebtoken'

export function signTestToken(payload = { sub: 'test_user_id' }) {
  return jwt.sign(payload, process.env.JWT_SECRET, { algorithm: 'HS256', expiresIn: '15m' })
}

export function signExpiredToken(payload = { sub: 'test_user_id' }) {
  return jwt.sign(payload, process.env.JWT_SECRET, { algorithm: 'HS256', expiresIn: '-1s' })
}

export function signWrongSecretToken(payload = { sub: 'attacker' }) {
  return jwt.sign(payload, 'wrong_secret_entirely', { algorithm: 'HS256' })
}

// Constructs a JWT with alg:none manually. jwt.sign() refuses to produce these,
// so we base64url-encode the header and body and join with an empty signature.
// Verifies that { algorithms: ['HS256'] } rejects it.
export function signNoneAlgToken(payload = { sub: 'attacker' }) {
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url')
  const body = Buffer.from(
    JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000) })
  ).toString('base64url')
  return `${header}.${body}.`
}
