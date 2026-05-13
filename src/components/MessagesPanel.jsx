import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'
import DmThread from './DmThread'
import styles from './MessagesPanel.module.css'

function fmtTime(ts) {
  const d = new Date(ts)
  const now = new Date()
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export default function MessagesPanel({ session, isActive, initialConv, onClearInitialConv, onUnread, onSignIn }) {
  const [activeConv, setActiveConv] = useState(null)
  const [convs,      setConvs]      = useState([])
  const [loading,    setLoading]    = useState(true)

  // Refs so the realtime callback always reads current values without stale closure
  const isActiveRef    = useRef(isActive)
  const activeConvRef  = useRef(null)
  const knownNamesRef  = useRef({})   // userId → displayName cache

  useEffect(() => { isActiveRef.current = isActive }, [isActive])
  useEffect(() => { activeConvRef.current = activeConv }, [activeConv])

  // When a name is clicked from sidebar/mobile sheet → open that conversation
  useEffect(() => {
    if (!initialConv) return
    knownNamesRef.current[initialConv.userId] = initialConv.userName
    setActiveConv({ userId: initialConv.userId, userName: initialConv.userName })
    // Ensure the conversation appears in the list even before history loads
    setConvs(prev =>
      prev.find(c => c.userId === initialConv.userId)
        ? prev
        : [{ userId: initialConv.userId, userName: initialConv.userName, lastMsg: null }, ...prev]
    )
    onClearInitialConv?.()
  }, [initialConv])

  // Fetch full DM history once to build conversation list
  useEffect(() => {
    if (!session?.user?.id) { setLoading(false); return }
    const userId = session.user.id

    supabase
      .from('direct_messages')
      .select('*')
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(500)
      .then(({ data, error }) => {
        if (error) console.error('MessagesPanel load error:', error)
        if (!data) { setLoading(false); return }

        // Populate name cache from messages we received (sender_display_name is authoritative)
        data.forEach(msg => {
          if (msg.recipient_id === userId && !knownNamesRef.current[msg.sender_id]) {
            knownNamesRef.current[msg.sender_id] = msg.sender_display_name
          }
        })

        // Build conversation map — one entry per unique partner, most-recent message first
        const convMap = {}
        data.forEach(msg => {
          const otherId   = msg.sender_id === userId ? msg.recipient_id : msg.sender_id
          const otherName = msg.sender_id === userId
            ? (knownNamesRef.current[msg.recipient_id] || 'Someone')
            : msg.sender_display_name

          if (!knownNamesRef.current[otherId]) knownNamesRef.current[otherId] = otherName

          if (!convMap[otherId]) {
            convMap[otherId] = { userId: otherId, userName: otherName, lastMsg: msg }
          }
        })

        // Merge with any conversations already in state (e.g. opened from sidebar before load)
        setConvs(prev => {
          const fetched = Object.values(convMap).sort(
            (a, b) => new Date(b.lastMsg?.created_at || 0) - new Date(a.lastMsg?.created_at || 0)
          )
          // Preserve entries that are in state but not yet in fetched (brand-new conversations)
          const extra = prev.filter(c => !convMap[c.userId])
          return [...extra, ...fetched]
        })
        setLoading(false)
      })
  }, [session?.user?.id])

  // Realtime: incoming messages → update conv list + fire unread callback
  useEffect(() => {
    if (!session?.user?.id) return
    const userId = session.user.id

    const channel = supabase
      .channel(`messages-panel:${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'direct_messages',
          filter: `recipient_id=eq.${userId}` },
        (payload) => {
          const msg        = payload.new
          const senderId   = msg.sender_id
          const senderName = msg.sender_display_name

          knownNamesRef.current[senderId] = senderName

          // Bubble conversation to top of list
          setConvs(prev => {
            const updated = { userId: senderId, userName: senderName, lastMsg: msg }
            const rest    = prev.filter(c => c.userId !== senderId)
            return [updated, ...rest]
          })

          // Only notify unread when Messages tab isn't active, or active but viewing a different thread
          if (!isActiveRef.current || activeConvRef.current?.userId !== senderId) {
            onUnread?.()
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [session?.user?.id])

  // --- Guest state ---
  if (!session) {
    return (
      <div className={styles.guestWrap}>
        <div className={styles.guestIcon}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <p className={styles.guestText}>Sign in to send and receive direct messages.</p>
        <button className={styles.signInBtn} onClick={() => onSignIn?.()}>Sign in</button>
      </div>
    )
  }

  // --- Thread view ---
  if (activeConv) {
    return (
      <DmThread
        session={session}
        toUserId={activeConv.userId}
        toUserName={activeConv.userName}
        onBack={() => setActiveConv(null)}
      />
    )
  }

  // --- Conversation list ---
  return (
    <div className={styles.wrap}>
      {loading && <p className={styles.state}>Loading…</p>}
      {!loading && convs.length === 0 && (
        <p className={styles.empty}>
          No messages yet — click someone's name in the sidebar to start a conversation.
        </p>
      )}
      <div className={styles.list}>
        {convs.map(conv => (
          <div
            key={conv.userId}
            className={styles.convRow}
            onClick={() => setActiveConv(conv)}
          >
            <span className={styles.avatar}>{conv.userName.charAt(0).toUpperCase()}</span>
            <div className={styles.convInfo}>
              <div className={styles.convName}>{conv.userName}</div>
              {conv.lastMsg && (
                <div className={styles.convPreview}>{conv.lastMsg.content}</div>
              )}
            </div>
            {conv.lastMsg && (
              <div className={styles.convTime}>{fmtTime(conv.lastMsg.created_at)}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
