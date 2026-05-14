import { useState, useRef, useEffect, useMemo } from 'react'
import { supabase } from '../supabaseClient'
import styles from './DmThread.module.css'

function fmt(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function DmThread({ session, toUserId, toUserName, onBack }) {
  const fromUserId   = session.user.id
  const fromUserName = session.user.user_metadata?.full_name
    || session.user.email?.split('@')[0]
    || 'User'

  const [messages, setMessages] = useState([])
  const [input,    setInput]    = useState('')
  const bottomRef      = useRef(null)
  const threadChRef    = useRef(null)
  const inboxChRef     = useRef(null)

  const pairId = useMemo(() => [fromUserId, toUserId].sort().join(':'), [fromUserId, toUserId])

  // Thread channel — receives messages from the other user in this conversation
  useEffect(() => {
    setMessages([])

    const thread = supabase
      .channel(`dm:${pairId}`)
      .on('broadcast', { event: 'msg' }, ({ payload }) => {
        if (payload.senderId === fromUserId) return
        setMessages(prev => [...prev, payload])
      })
      .subscribe()
    threadChRef.current = thread

    return () => { supabase.removeChannel(thread); threadChRef.current = null }
  }, [pairId, fromUserId])

  // Inbox channel — subscribed so we can broadcast notifications to the recipient's MessagesPanel
  useEffect(() => {
    const inbox = supabase.channel(`dm-inbox:${toUserId}`).subscribe()
    inboxChRef.current = inbox
    return () => { supabase.removeChannel(inbox); inboxChRef.current = null }
  }, [toUserId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    const text = input.trim()
    if (!text || !threadChRef.current) return
    setInput('')

    const msg = {
      id: `opt-${Date.now()}`,
      senderId: fromUserId,
      senderName: fromUserName,
      recipientId: toUserId,
      content: text,
      created_at: new Date().toISOString(),
    }

    setMessages(prev => [...prev, msg])

    await threadChRef.current.send({
      type: 'broadcast',
      event: 'msg',
      payload: msg,
    })

    // Notify recipient's MessagesPanel so it can show unread dot + update conv list
    if (inboxChRef.current) {
      await inboxChRef.current.send({
        type: 'broadcast',
        event: 'msg',
        payload: { senderId: fromUserId, senderName: fromUserName, content: text, created_at: msg.created_at },
      })
    }
  }

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.threadHeader}>
        <button className={styles.backBtn} onClick={onBack}>← Back</button>
        <span className={styles.avatar}>{toUserName.charAt(0).toUpperCase()}</span>
        <span className={styles.userName}>{toUserName}</span>
      </div>

      <div className={styles.messages}>
        {messages.length === 0 && (
          <p className={styles.stateText}>No messages yet. Say hello!</p>
        )}
        {messages.map(msg => {
          const isMe = msg.senderId === fromUserId
          return (
            <div key={msg.id} className={`${styles.row} ${isMe ? styles.rowMe : styles.rowThem}`}>
              {!isMe && <span className={styles.avatar}>{toUserName.charAt(0).toUpperCase()}</span>}
              <div className={styles.bubbleWrap}>
                <div className={`${styles.bubble} ${isMe ? styles.bubbleMe : styles.bubbleThem}`}>
                  {msg.content}
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
        />
        <button className={styles.sendBtn} onClick={send} disabled={!input.trim()}>↑</button>
      </div>
    </div>
  )
}
