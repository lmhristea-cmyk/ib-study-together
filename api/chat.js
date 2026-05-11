const LIMIT = 10
const WINDOW_MS = 24 * 60 * 60 * 1000

// In-memory store: ip -> { count, resetAt }
// Resets across cold starts but acceptable for a soft rate limit.
const ipStore = new Map()

function getRateLimit(ip) {
  const now = Date.now()
  const entry = ipStore.get(ip)
  if (!entry || now >= entry.resetAt) {
    const next = { count: 0, resetAt: now + WINDOW_MS }
    ipStore.set(ip, next)
    return next
  }
  return entry
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

  const entry = getRateLimit(ip)

  if (!isAdmin && entry.count >= LIMIT) {
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
    const remaining = LIMIT - entry.count

    res.status(200).json({ ...data, remaining })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
