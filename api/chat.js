const LIMIT_GUEST = 10
const LIMIT_AUTH  = 25
const WINDOW_MS   = 24 * 60 * 60 * 1000

const ipStore   = new Map() // guest: ip  -> { count, resetAt }
const userStore = new Map() // auth:  uid -> { count, resetAt }

function getEntry(store, key, limit) {
  const now = Date.now()
  const entry = store.get(key)
  if (!entry || now >= entry.resetAt) {
    const next = { count: 0, resetAt: now + WINDOW_MS }
    store.set(key, next)
    return { entry: next, limit }
  }
  return { entry, limit }
}

async function getAuthUser(token) {
  if (!token) return null
  try {
    const res = await fetch(`${process.env.VITE_SUPABASE_URL}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: process.env.SUPABASE_ANON_KEY,
      },
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.id || null
  } catch {
    return null
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const ip =
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    'unknown'

  const isAdmin = process.env.ADMIN_IP && ip === process.env.ADMIN_IP

  // Resolve identity — prefer authenticated user, fall back to IP
  const token = req.headers['authorization']?.replace('Bearer ', '') || null
  const userId = await getAuthUser(token)

  const { entry, limit } = userId
    ? getEntry(userStore, userId, LIMIT_AUTH)
    : getEntry(ipStore, ip, LIMIT_GUEST)

  if (!isAdmin && entry.count >= limit) {
    return res.status(429).json({ error: 'rate_limit_exceeded', remaining: 0 })
  }

  const { messages, system } = req.body

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system,
        messages,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'API error' })
    }

    entry.count++
    const remaining = limit - entry.count

    res.status(200).json({ ...data, remaining })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
