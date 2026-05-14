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

  const isActiveRef   = useRef(isActive)
  const activeConvRef = useRef(null)

  useEffect(() => { isActiveRef.current = isActive }, [isActive])
  useEffect(() => { activeConvRef.current = activeConv }, [activeConv])

  // Open a conversation when triggered from the sidebar
  useEffect(() => {
    if (!initialConv) return
    setActiveConv({ userId: initialConv.userId, userName: initialConv.userName })
    setConvs(prev =>
      prev.find(c => c.userId === initialConv.userId)
        ? prev
        : [{ userId: initialConv.userId, userName: initialConv.userName, lastMsg: null }, ...prev]
    )
    onClearInitialConv?.()
  }, [initialConv])

  // Subscribe to personal inbox broadcast channel for incoming DM notifications
  useEffect(() => {
    if (!session?.user?.id) return
    const myId = session.user.id

    const ch = supabase
      .channel(`dm-inbox:${myId}`)
      .on('broadcast', { event: 'msg' }, ({ payload }) => {
        const { senderId, senderName, content, created_at } = payload

        setConvs(prev => {
          const existing = prev.find(c => c.userId === senderId)
          const updated  = { userId: senderId, userName: senderName, lastMsg: { content, created_at } }
          if (existing) {
            return [updated, ...prev.filter(c => c.userId !== senderId)]
          }
          return [updated, ...prev]
        })

        if (!isActiveRef.current || activeConvRef.current?.userId !== senderId) {
          onUnread?.()
        }
      })
      .subscribe()

    return () => supabase.removeChannel(ch)
  }, [session?.user?.id])

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

  return (
    <div className={styles.wrap}>
      {activeConv ? (
        <DmThread
          session={session}
          toUserId={activeConv.userId}
          toUserName={activeConv.userName}
          onBack={() => setActiveConv(null)}
        />
      ) : (
        <>
          {convs.length === 0 && (
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
        </>
      )}
    </div>
  )
}
