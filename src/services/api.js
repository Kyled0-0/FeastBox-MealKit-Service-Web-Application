// Single HTTP boundary for the frontend. Components NEVER call this module
// directly per CODE_STYLE.md §5.3; only Pinia store actions do. Centralising
// the fetch here keeps base-URL handling and auth-header injection in one
// place (CODE_STYLE.md §1.2).
//
// Error contract:
//   Non-2xx HTTP response  → throws ApiError(server's `error` field or
//                            generic fallback, { status, body: full JSON })
//   Timeout (15s default)  → throws ApiError('Request timed out',
//                            { status: 408, body: null })
//   Non-Abort fetch reject → original Error passes through unchanged (e.g.
//                            TypeError 'NetworkError', CORS failures, DNS).
//                            Store actions handle both branches via
//                            toErrorShape() which reads e?.status ?? null.
// Store actions read .status to drive UI (404 → empty state, 5xx/408 →
// retry banner), read .body.details for per-field Zod validation errors,
// and read .message as the human-facing fallback.
//
// TODO (Task 9, frontend auth integration): export setAccessToken() /
// clearAccessToken() helpers so the auth store doesn't have to know the
// localStorage key directly. For now the contract is: login stores under
// TOKEN_KEY; logout removes that key.

const TOKEN_KEY = 'accessToken'
const REQUEST_TIMEOUT_MS = 15000

// Fail loud in production builds when VITE_API_URL is missing — otherwise
// the empty-string fallback would silently route every request to the
// frontend's own origin, where the static handler returns HTML/404 and the
// user sees a generic "request failed" for every page. In dev (Vitest test
// mode, `vite` dev server) the empty fallback is intentional (same-origin
// or Vite proxy), so the guard only fires on a production bundle.
if (!import.meta.env.VITE_API_URL && import.meta.env.PROD) {
  throw new Error(
    'VITE_API_URL is not set. Configure it in Vercel project settings (production) ' +
    'or .env.local (local prod builds).'
  )
}

export class ApiError extends Error {
  constructor(message, { status, body } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

function authHeader() {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request(method, path, body) {
  // Read BASE_URL per-request so vi.stubEnv works in tests and so an env
  // change picks up on the next call without a server restart. The lookup
  // is a single env-object property read; cost is negligible.
  // Strip a trailing slash so 'https://api.example/' + '/meals' joins to
  // 'https://api.example/meals' rather than '...//meals'.
  const baseUrl = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

  const init = {
    method,
    headers: { Accept: 'application/json', ...authHeader() },
    credentials: 'include'
  }
  if (body !== undefined) {
    init.headers['Content-Type'] = 'application/json'
    init.body = JSON.stringify(body)
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  let res
  try {
    res = await fetch(`${baseUrl}${path}`, { ...init, signal: controller.signal })
  } catch (e) {
    if (e?.name === 'AbortError') {
      throw new ApiError('Request timed out', { status: 408, body: null })
    }
    throw e
  } finally {
    clearTimeout(timer)
  }

  const contentType = res.headers.get('content-type') ?? ''
  const payload = contentType.includes('application/json') ? await res.json().catch(() => null) : null

  if (!res.ok) {
    const message = payload?.error ?? `Request failed with status ${res.status}`
    throw new ApiError(message, { status: res.status, body: payload })
  }
  return payload
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  patch: (path, body) => request('PATCH', path, body),
  delete: (path) => request('DELETE', path)
}
