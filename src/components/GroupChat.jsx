import { useState, useRef, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import AuthModal from './AuthModal'
import styles from './GroupChat.module.css'

function formatTime(date) {
  return new Date(date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
    </svg>
  )
}

function PaperclipIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
    </svg>
  )
}

export default function GroupChat({ roomId, session }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showFullAuth, setShowFullAuth] = useState(null) // 'signin' | 'signup' | null
  const bottomRef = useRef(null)

  const userName = session?.user?.email?.split('@')[0] || 'Guest'

  useEffect(() => {
    // Load recent messages
    supabase
      .from('group_messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(100)
      .then(({ data }) => {
        if (data) setMessages(data)
        setLoading(false)
      })

    // Subscribe to new messages
    const channel = supabase
      .channel(`group_chat:${roomId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'group_messages', filter: `room_id=eq.${roomId}` },
        (payload) => {
          setMessages(prev => {
            // avoid duplicates (optimistic insert already added it)
            if (prev.find(m => m.id === payload.new.id)) return prev
            return [...prev, payload.new]
          })
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [roomId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    const text = input.trim()
    if (!text) return
    if (!session) { setShowAuthModal(true); return }
    setInput('')

    const optimistic = {
      id: `opt-${Date.now()}`,
      room_id: roomId,
      user_name: userName,
      text,
      created_at: new Date().toISOString(),
      isOwn: true,
    }
    setMessages(prev => [...prev, optimistic])

    const { data, error } = await supabase
      .from('group_messages')
      .insert({ room_id: roomId, user_name: userName, text })
      .select()
      .single()

    if (!error && data) {
      // Replace optimistic entry with real one
      setMessages(prev => prev.map(m => m.id === optimistic.id ? { ...data, isOwn: true } : m))
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  const deleteMsg = (id) => setMessages(prev => prev.filter(m => m.id !== id))

  return (
    <div className={styles.wrap}>
      <div className={styles.sustainBanner}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
        </svg>
        <span>Save energy. Save answers. Share notes. Learn from each other.</span>
      </div>
      <div className={styles.messages}>
        {loading && <p className={styles.loadingText}>Loading messages…</p>}
        {!loading && messages.length === 0 && (
          <p className={styles.emptyText}>No messages yet. Say hello!</p>
        )}
        {messages.map(msg => {
          const isOwn = msg.isOwn || msg.user_name === userName
          return (
            <div key={msg.id} className={`${styles.row} ${isOwn ? styles.own : ''}`}>
              {!isOwn && (
                <span className={styles.avatar}>{msg.user_name.charAt(0).toUpperCase()}</span>
              )}
              <div className={styles.content}>
                {!isOwn && (
                  <div className={styles.meta}>
                    <span className={styles.name}>{msg.user_name}</span>
                    <span className={styles.time}>{formatTime(msg.created_at)}</span>
                  </div>
                )}
                <div className={`${styles.bubble} ${isOwn ? styles.bubbleOwn : styles.bubbleOther}`}>
                  {msg.text}
                </div>
                {isOwn && (
                  <div className={styles.ownMeta}>
                    <span className={styles.ownTime}>{formatTime(msg.created_at)}</span>
                    <button className={styles.deleteBtn} onClick={() => deleteMsg(msg.id)} title="Delete message">
                      <TrashIcon />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div className={styles.inputRow}>
        <input
          className={styles.input}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Message the room…"
        />
        <button className={styles.sendBtn} onClick={send} disabled={!input.trim()}>↑</button>
      </div>
      <div className={styles.hint}>Press Enter to send</div>

      {showAuthModal && (
        <div className={styles.gateOverlay} onClick={() => setShowAuthModal(false)}>
          <div className={styles.gateModal} onClick={e => e.stopPropagation()}>
            <span className={styles.gateAccent}>Almost there</span>
            <h3 className={styles.gateTitle}>You're one message away from the conversation</h3>
            <p className={styles.gateBody}>Create a free account to join the room and chat with other IB students.</p>
            <button className={styles.gateSignUp} onClick={() => { setShowAuthModal(false); setShowFullAuth('signup') }}>
              Sign up — it's free
            </button>
            <p className={styles.gateSignInRow}>
              Already have an account?{' '}
              <button className={styles.gateSignInLink} onClick={() => { setShowAuthModal(false); setShowFullAuth('signin') }}>
                Sign in
              </button>
            </p>
          </div>
        </div>
      )}

      {showFullAuth && (
        <AuthModal
          initialMode={showFullAuth}
          onClose={() => setShowFullAuth(null)}
          onAuth={() => setShowFullAuth(null)}
        />
      )}
    </div>
  )
}
