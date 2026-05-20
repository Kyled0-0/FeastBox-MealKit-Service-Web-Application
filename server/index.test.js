import { describe, it, expect, afterEach } from 'vitest'
import request from 'supertest'
import { createApp } from './index.js'

describe('createApp', () => {
  it('returns a usable Express app', () => {
    const app = createApp()
    expect(typeof app.use).toBe('function')
  })

  it('GET /health returns { status: ok }', async () => {
    const res = await request(createApp()).get('/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: 'ok' })
  })
})

describe('CORS allowlist (multi-origin via comma-separated CLIENT_URL)', () => {
  const originalClientUrl = process.env.CLIENT_URL

  afterEach(() => {
    process.env.CLIENT_URL = originalClientUrl
  })

  it('allows the single configured origin (backwards compatible)', async () => {
    process.env.CLIENT_URL = 'http://localhost:5173'
    const res = await request(createApp())
      .get('/health')
      .set('Origin', 'http://localhost:5173')
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173')
    expect(res.headers['access-control-allow-credentials']).toBe('true')
  })

  it('allows BOTH origins when CLIENT_URL is a comma-separated list', async () => {
    process.env.CLIENT_URL = 'http://localhost:5173,https://feastbox.vercel.app'
    const app = createApp()

    const local = await request(app).get('/health').set('Origin', 'http://localhost:5173')
    expect(local.headers['access-control-allow-origin']).toBe('http://localhost:5173')
    // Credentials header must travel with EVERY allowed origin — the
    // refresh-cookie flow in Task 9+ depends on it cross-origin.
    expect(local.headers['access-control-allow-credentials']).toBe('true')

    const vercel = await request(app).get('/health').set('Origin', 'https://feastbox.vercel.app')
    expect(vercel.headers['access-control-allow-origin']).toBe('https://feastbox.vercel.app')
    expect(vercel.headers['access-control-allow-credentials']).toBe('true')
  })

  it('matches origins case-insensitively (hostnames are per RFC 3986)', async () => {
    process.env.CLIENT_URL = 'https://feastbox.vercel.app'
    const res = await request(createApp())
      .get('/health')
      .set('Origin', 'https://FEASTBOX.vercel.app')
    expect(res.headers['access-control-allow-origin']).toBe('https://FEASTBOX.vercel.app')
  })

  it('tolerates whitespace around comma separators', async () => {
    process.env.CLIENT_URL = ' http://localhost:5173 , https://feastbox.vercel.app '
    const res = await request(createApp())
      .get('/health')
      .set('Origin', 'https://feastbox.vercel.app')
    expect(res.headers['access-control-allow-origin']).toBe('https://feastbox.vercel.app')
  })

  it('rejects an origin that is not on the allowlist', async () => {
    process.env.CLIENT_URL = 'http://localhost:5173'
    const res = await request(createApp())
      .get('/health')
      .set('Origin', 'https://evil.example.com')
    // The CORS middleware omits the Access-Control-Allow-Origin header for
    // disallowed origins — the request still completes server-side, but the
    // browser refuses to expose the response to the disallowed JS context.
    expect(res.headers['access-control-allow-origin']).toBeUndefined()
  })

  it('does not crash when the request has no Origin header (same-origin/curl)', async () => {
    process.env.CLIENT_URL = 'http://localhost:5173'
    const res = await request(createApp()).get('/health')
    expect(res.status).toBe(200)
  })

  it('preflight (OPTIONS) succeeds for allowed origin + authenticated request shape', async () => {
    // Cross-origin authenticated requests (Bearer + credentials: include)
    // trigger a CORS preflight. The cors package uses the same origin
    // matcher for preflight, so this should pass; lock the contract in
    // before the Task 9+ refresh-cookie flow lands.
    process.env.CLIENT_URL = 'https://feastbox.vercel.app'
    const res = await request(createApp())
      .options('/meals')
      .set('Origin', 'https://feastbox.vercel.app')
      .set('Access-Control-Request-Method', 'GET')
      .set('Access-Control-Request-Headers', 'authorization,content-type')
    expect(res.status).toBeGreaterThanOrEqual(200)
    expect(res.status).toBeLessThan(300)
    expect(res.headers['access-control-allow-origin']).toBe('https://feastbox.vercel.app')
    expect(res.headers['access-control-allow-credentials']).toBe('true')
    // The browser only accepts the preflight if the response advertises the
    // requested method and headers. The `cors` package sets both by default;
    // these assertions lock the contract in so a future config change
    // (e.g. allowedHeaders: ['x-csrf']) can't silently break Task 9 auth.
    expect(res.headers['access-control-allow-methods']).toMatch(/GET/i)
    expect(res.headers['access-control-allow-headers']).toMatch(/authorization/i)
  })

  it('throws at boot when a CLIENT_URL entry includes a path', () => {
    process.env.CLIENT_URL = 'https://foo.com/oops'
    expect(() => createApp()).toThrow(/must be an origin/i)
  })

  it('throws at boot when a CLIENT_URL entry is not a parseable URL', () => {
    process.env.CLIENT_URL = 'not-a-url'
    expect(() => createApp()).toThrow(/not a valid URL/i)
  })

  it('throws at boot when a CLIENT_URL entry uses a non-http(s) scheme', () => {
    process.env.CLIENT_URL = 'ftp://foo.com'
    expect(() => createApp()).toThrow(/http: or https:/i)
  })

  it('throws at boot when a CLIENT_URL entry contains userinfo (user:pass@)', () => {
    process.env.CLIENT_URL = 'https://user:pass@foo.com'
    expect(() => createApp()).toThrow(/userinfo/i)
  })

  it('userinfo throw does NOT echo the password into the error message (logging hygiene)', () => {
    // The boot-validation throw paths must never quote the input string,
    // because the input may contain a pasted secret that would land in
    // the deploy log. Regression test for CODE_REVIEW_CHECKLIST.md §9
    // ("No secrets in logs"). Sentinel uses a recognisable token so a
    // grep on the message body fails loud if any future contributor adds
    // an echo back to the throw.
    process.env.CLIENT_URL = 'https://admin:hunter2-do-not-leak@foo.com'
    let caught
    try { createApp() } catch (e) { caught = e }
    expect(caught).toBeDefined()
    expect(caught.message).not.toContain('hunter2-do-not-leak')
    expect(caught.message).not.toContain('admin:')
    // It should still pinpoint which entry failed by index, not value.
    expect(caught.message).toMatch(/entry #1/i)
  })

  it('identifies the failing entry by index when CLIENT_URL has multiple entries', () => {
    // Index makes the failure locatable even when the value is suppressed.
    process.env.CLIENT_URL = 'http://localhost:5173,ftp://bad-entry.example'
    expect(() => createApp()).toThrow(/entry #2/i)
  })
})
