import { useState, useRef, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import styles from './DirectMessage.module.css'

function fmt(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function DmModal({ session, toUserId, toUserName, onClose }) {
  const fromUserId   = session.user.id
  const fromUserName = session.user.user_metadata?.full_name
    || session.user.email?.split('@')[0]
    || 'User'

  const conversationId = [fromUserId, toUserId].sort().join('_')

  const [messages, setMessages] = useState([])
  const [input,    setInput]    = useState('')
  const [loading,  setLoading]  = useState(true)
  const bottomRef = useRef(null)

  useEffect(() => {
    supabase
      .from('direct_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(100)
      .then(({ data }) => {
        if (data) setMessages(data)
        setLoading(false)
      })

    const channel = supabase
      .channel(`dm:${conversationId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'direct_messages',
          filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          setMessages(prev =>
            prev.find(m => m.id === payload.new.id) ? prev : [...prev, payload.new]
          )
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [conversationId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    const text = input.trim()
    if (!text) return
    setInput('')

    const optimistic = {
      id: `opt-${Date.now()}`,
      conversation_id: conversationId,
      from_user_id: fromUserId,
      from_user_name: fromUserName,
      to_user_id: toUserId,
      to_user_name: toUserName,
      text,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, optimistic])

    const { data, error } = await supabase
      .from('direct_messages')
      .insert({
        conversation_id: conversationId,
        from_user_id: fromUserId,
        from_user_name: fromUserName,
        to_user_id: toUserId,
        to_user_name: toUserName,
        text,
      })
      .select()
      .single()

    if (!error && data) {
      setMessages(prev => prev.map(m => m.id === optimistic.id ? data : m))
    }
  }

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.headerUser}>
            <span className={styles.avatar}>{toUserName.charAt(0).toUpperCase()}</span>
            <span className={styles.userName}>{toUserName}</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose} title="Close">×</button>
        </div>

        <div className={styles.messages}>
          {loading && <p className={styles.stateText}>Loading…</p>}
          {!loading && messages.length === 0 && (
            <p className={styles.stateText}>No messages yet. Say hello!</p>
          )}
          {messages.map(msg => {
            const isMe = msg.from_user_id === fromUserId
            return (
              <div key={msg.id} className={`${styles.row} ${isMe ? styles.rowMe : styles.rowThem}`}>
                {!isMe && <span className={styles.avatar}>{toUserName.charAt(0).toUpperCase()}</span>}
                <div className={styles.bubbleWrap}>
                  <div className={`${styles.bubble} ${isMe ? styles.bubbleMe : styles.bubbleThem}`}>
                    {msg.text}
                  </div>
                  <span className={styles.ts}>{fmt(msg.created_at)}</span>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        <div className={styles.inputRow}>
          <input
            className={styles.input}
            type="text"
            placeholder={`Message ${toUserName.split(' ')[0]}…`}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKey}
            autoFocus
          />
          <button className={styles.sendBtn} onClick={send} disabled={!input.trim()}>↑</button>
        </div>
      </div>
    </div>
  )
}
