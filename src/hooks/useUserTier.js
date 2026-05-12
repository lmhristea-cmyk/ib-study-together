// Returns 'guest' | 'freeUser' | 'proUser'
// proUser detection is stubbed — wire up Stripe metadata here later.
export function useUserTier(session) {
  if (!session) return 'guest'
  // Future: check session.user.user_metadata.plan === 'pro'
  return 'freeUser'
}

export const TIER_LIMITS = {
  guest:    5,
  freeUser: 10,
  proUser:  Infinity,
}
