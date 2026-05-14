import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import tibetanBowl from '../assets/tibetan-bowl.mp3.mp3'
import PomodoroTimer from '../components/PomodoroTimer'
import LiveChat from '../components/LiveChat'
import GroupChat from '../components/GroupChat'
import Library from '../components/Library'
import MessagesPanel from '../components/MessagesPanel'
import { supabase } from '../supabaseClient'
import AuthPromptModal from '../components/AuthPromptModal'
import AuthModal from '../components/AuthModal'
import styles from './Room.module.css'

const libraryKey = (roomId) => `ib-library-${roomId}`

// ── Room Library export ───────────────────────────────────────────────────────

function exportRoomItemAsPDF(item) {
  function escHtml(t) {
    return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }
  function fmtContent(t) {
    return escHtml(t)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/^---+$/gm, '<hr>')
      .replace(/^#{3}\s+(.+)/gm, '<h3>$1</h3>')
      .replace(/^#{2}\s+(.+)/gm, '<h2>$1</h2>')
      .replace(/^#\s+(.+)/gm, '<h1>$1</h1>')
      .replace(/^[-*]\s+(.+)/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
      .replace(/\n/g, '<br>')
  }
  const dateStr = new Date(item.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
  const win = window.open('', '_blank')
  win.document.write(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
  <title>${escHtml(item.subject || 'Room Library')} — Library Note</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#fff;color:#111827;padding:40px;max-width:700px;margin:0 auto;font-size:13px;line-height:1.65}
    .header{border-bottom:2px solid #111827;padding-bottom:16px;margin-bottom:28px}
    .badge{display:inline-block;background:#7C3AED;color:#fff;font-size:10px;font-weight:800;padding:3px 8px;border-radius:4px;letter-spacing:.05em;margin-bottom:10px}
    h1.title{font-size:22px;font-weight:800;letter-spacing:-.02em;margin-bottom:4px}
    .meta{font-size:11px;color:#6B7280}
    .content{background:#F9FAFB;border:1px solid #E5E7EB;border-left:3px solid #7C3AED;padding:16px 20px;border-radius:8px;line-height:1.7}
    strong{font-weight:700;color:#111827} em{font-style:italic}
    code{background:#F3F4F6;border:1px solid #E5E7EB;padding:1px 5px;border-radius:4px;font-family:monospace;font-size:12px}
    h1,h2,h3{margin:12px 0 6px;font-weight:700;color:#111827} h1{font-size:17px} h2{font-size:15px} h3{font-size:14px}
    ul{margin:6px 0 6px 20px} li{margin:2px 0} hr{border:none;border-top:1px solid #E5E7EB;margin:10px 0}
    .footer{margin-top:32px;padding-top:12px;border-top:1px solid #E5E7EB;font-size:11px;color:#9CA3AF;display:flex;justify-content:space-between}
    @media print{body{padding:24px}.content{page-break-inside:avoid}}
  </style></head><body>
  <div class="header">
    <div class="badge">ROOM LIBRARY</div>
    <h1 class="title">${escHtml(item.title)}</h1>
    <div class="meta">Shared by ${escHtml(item.user_display_name)} · ${dateStr} · IB Study Together</div>
  </div>
  ${item.content ? `<div class="content">${fmtContent(item.content)}</div>` : ''}
  <div class="footer"><span>IB Study Together · Room Library</span><span>${dateStr}</span></div>
  <script>window.onload=function(){window.print()}</script>
  </body></html>`)
  win.document.close()
}

function LeaveWarningModal({ items, onLeave, onStay }) {
  return (
    <div className={styles.leaveOverlay}>
      <div className={styles.leaveModal}>
        <div className={styles.leaveWarningIcon}>⚠️</div>
        <h2 className={styles.leaveTitle}>Room library will be cleared when you leave</h2>
        <p className={styles.leaveSub}>Export anything you want to keep before leaving.</p>
        {items.length > 0 && (
          <div className={styles.leaveItems}>
            {items.map(item => (
              <div key={item.id} className={styles.leaveItem}>
                <span className={styles.leaveItemTitle}>{item.title}</span>
                <button className={styles.leaveExportBtn} onClick={() => exportRoomItemAsPDF(item)}>
                  Export PDF
                </button>
              </div>
            ))}
          </div>
        )}
        <div className={styles.leaveActions}>
          <button className={styles.leaveStayBtn} onClick={onStay}>Stay in room</button>
          <button className={styles.leaveConfirmBtn} onClick={onLeave}>Leave anyway</button>
        </div>
      </div>
    </div>
  )
}

function UserList({ users, selfKey, onUserClick }) {
  if (users.length === 0) {
    return <p className={styles.emptyPresence}>No one else is here yet!</p>
  }
  return (
    <div className={styles.presenceList}>
      {users.map(u => {
        const isMe  = u.self_key === selfKey
        const canDm = !isMe && u.authenticated && !!u.uid
        return (
          <div
            key={u.presence_ref}
            className={`${styles.presenceUser} ${!isMe ? styles.presenceUserClickable : ''}`}
            onClick={() => {
              if (isMe) return
              onUserClick(canDm ? u.uid : null, u.display_name)
            }}
          >
            <span className={styles.presenceDot} />
            <span className={styles.presenceName}>
              {u.display_name}
              {isMe && <span className={styles.presenceYou}> (you)</span>}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default function Room({ room, navigate, session }) {
  const [activeTab,    setActiveTab]    = useState('chat')
  const [rightPanel,   setRightPanel]   = useState('ai')
  const [activeTopic,  setActiveTopic]  = useState(null)
  const [topicPrompt,  setTopicPrompt]  = useState(null)

  const handleTopicClick = (topic) => {
    setActiveTopic(topic)
    setRightPanel('ai')
    setTopicPrompt(`Give me an IB-style practice question on "${topic}" for ${room.subject}. Just the question itself — no answer yet.`)
  }
  const handleTopicConsumed = () => setTopicPrompt(null)

  const [library, setLibrary] = useState(() => {
    try { return JSON.parse(localStorage.getItem(libraryKey(room.id)) || '[]') } catch { return [] }
  })
  useEffect(() => {
    localStorage.setItem(libraryKey(room.id), JSON.stringify(library))
  }, [library, room.id])

  // Room Library — ephemeral shared items (broadcast, no DB)
  const [roomLibraryItems,    setRoomLibraryItems]    = useState([])
  const [showLeaveWarning,    setShowLeaveWarning]     = useState(false)
  const roomLibraryChannelRef = useRef(null)

  useEffect(() => {
    const ch = supabase.channel(`room-library-bc:${room.id}`)
    ch.on('broadcast', { event: 'item' }, ({ payload }) => {
      setRoomLibraryItems(prev => [payload, ...prev])
    }).subscribe()
    roomLibraryChannelRef.current = ch
    return () => { supabase.removeChannel(ch); roomLibraryChannelRef.current = null }
  }, [room.id])

  const handleRoomLibraryShare = useCallback(async (sharedItem) => {
    setRoomLibraryItems(prev => [sharedItem, ...prev])
    if (roomLibraryChannelRef.current) {
      await roomLibraryChannelRef.current.send({ type: 'broadcast', event: 'item', payload: sharedItem })
    }
  }, [])

  const deleteRoomLibraryItem = useCallback((id) => {
    setRoomLibraryItems(prev => prev.filter(i => i.id !== id))
  }, [])

  const handleBack = () => {
    if (roomLibraryItems.length > 0) setShowLeaveWarning(true)
    else navigate('rooms')
  }

  const savedIds = useMemo(() => new Set(library.map(i => i.msgId)), [library])

  const saveToLibrary = useCallback(({ msgId, content }) => {
    if (savedIds.has(msgId)) return
    setLibrary(prev => [...prev, { id: Date.now(), msgId, subject: room.subject, content, savedAt: Date.now() }])
  }, [savedIds, room.subject])

  const deleteFromLibrary = useCallback((id) => {
    setLibrary(prev => prev.filter(i => i.id !== id))
  }, [])

  const [presentUsers,  setPresentUsers]  = useState([])
  const presenceKeyRef = useRef(crypto.randomUUID())

  // DM routing: clicking a name sets dmConvTarget and switches to Messages tab
  const [dmConvTarget,  setDmConvTarget]  = useState(null)  // { userId, userName } | null
  const [showDmGate,    setShowDmGate]    = useState(false)
  const [showDmAuth,    setShowDmAuth]    = useState(null)   // 'signin' | 'signup' | null
  const [unreadDm,      setUnreadDm]      = useState(0)

  const handleOpenDm = (targetId, targetName) => {
    if (!session) { setShowDmGate(true); return }
    if (!targetId) return
    setUnreadDm(0)
    setRightPanel('messages')
    setDmConvTarget({ userId: targetId, userName: targetName })
  }

  // Presence tracking
  useEffect(() => {
    const displayName = session?.user?.user_metadata?.full_name
      || session?.user?.email?.split('@')[0]
      || 'Guest'

    const channel = supabase.channel(`room-presence:${room.id}`)
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        setPresentUsers(Object.values(state).flatMap(arr => arr))
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            display_name: displayName,
            uid: session?.user?.id || null,
            self_key: presenceKeyRef.current,
            authenticated: !!session,
          })
        }
      })
    // Also track in a lightweight global channel so the landing page can count online users
    const globalChannel = supabase.channel('global-online')
    globalChannel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await globalChannel.track({ key: presenceKeyRef.current })
      }
    })

    return () => {
      supabase.removeChannel(channel)
      supabase.removeChannel(globalChannel)
    }
  }, [room.id, session?.user?.id])

  // Ambient sound
  const audioRef = useRef(null)
  const [soundPlaying, setSoundPlaying] = useState(false)
  const [soundMuted,   setSoundMuted]   = useState(false)

  useEffect(() => {
    const audio = new Audio(tibetanBowl)
    audio.loop = true
    audio.volume = 0.2
    audioRef.current = audio
    return () => { audio.pause(); audio.src = '' }
  }, [])

  const toggleSound = () => {
    const audio = audioRef.current
    if (!audio) return
    if (soundPlaying) { audio.pause(); setSoundPlaying(false) }
    else              { audio.play();  setSoundPlaying(true)  }
  }

  const toggleMute = (e) => {
    e.stopPropagation()
    const audio = audioRef.current
    if (!audio) return
    audio.muted = !audio.muted
    setSoundMuted(m => !m)
  }

  const uploadToLibrary = useCallback((item) => {
    setLibrary(prev => [item, ...prev])
  }, [])

  // Mobile people sheet
  const [mobileUsersOpen, setMobileUsersOpen] = useState(false)

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={handleBack}>← Back</button>
          <div className={styles.roomInfo}>
            <div className={styles.roomDot}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
            </div>
            <div>
              <h1 className={styles.roomTitle}>{room.subject}</h1>
              <p className={styles.roomDesc}>{room.description}</p>
            </div>
          </div>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.mobilePeopleWrap}>
            <button
              className={styles.mobilePeopleBtn}
              onClick={() => setMobileUsersOpen(o => !o)}
              title="Who's in this room"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              {presentUsers.length > 0 && (
                <span className={styles.mobilePeopleCount}>{presentUsers.length}</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className={styles.layout}>
        <div className={styles.timerRow}>
          <PomodoroTimer
            roomId={room.id}
            soundPlaying={soundPlaying}
            soundMuted={soundMuted}
            onToggleSound={toggleSound}
            onToggleMute={toggleMute}
          />
        </div>

        {/* Left sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sideCard}>
            <div className={styles.sideLabel}>In this room</div>
            <UserList
              users={presentUsers}
              selfKey={presenceKeyRef.current}
              onUserClick={handleOpenDm}
            />
          </div>
          <div className={styles.sideCard}>
            <div className={styles.sideLabel}>Topics</div>
            <div className={styles.topicList}>
              {room.topics.map(t => (
                <div
                  key={t}
                  className={`${styles.topicItem} ${activeTopic === t ? styles.topicItemActive : ''}`}
                  onClick={() => handleTopicClick(t)}
                >
                  <span className={styles.topicDot} style={{ background: activeTopic === t ? '#7C3AED' : room.color }} />
                  {t}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Center (mobile tabs only) */}
        <main className={styles.center}>
          <div className={styles.mobileTabs}>
            <button
              className={`${styles.mobileTab} ${activeTab === 'chat' ? styles.mobileTabActive : ''}`}
              onClick={() => setActiveTab('chat')}
            >
              {room.subject === 'CAS' ? 'CAS Advisor' : 'AI Tutor'}
            </button>
          </div>
        </main>

        {/* Right panel */}
        <aside className={styles.chatPanel}>
          <div className={styles.panelSlot}>
            <div className={styles.panelTabs}>
              <button
                className={`${styles.panelTab} ${rightPanel === 'ai' ? styles.panelTabActive : ''}`}
                onClick={() => setRightPanel('ai')}
              >{room.subject === 'CAS' ? 'CAS Advisor' : 'AI Tutor'}</button>
              <button
                className={`${styles.panelTab} ${rightPanel === 'group' ? styles.panelTabActive : ''}`}
                onClick={() => setRightPanel('group')}
              >Group Chat</button>
              <button
                className={`${styles.panelTab} ${rightPanel === 'messages' ? styles.panelTabActive : ''}`}
                onClick={() => { setRightPanel('messages'); setUnreadDm(0) }}
              >
                Messages
                {unreadDm > 0 && rightPanel !== 'messages' && (
                  <span className={styles.dmDot} />
                )}
              </button>
              <button
                className={`${styles.panelTab} ${rightPanel === 'library' ? styles.panelTabActive : ''}`}
                onClick={() => setRightPanel('library')}
              >
                Library
                {library.length > 0 && (
                  <span className={styles.panelTabBadge}>{library.length}</span>
                )}
              </button>
              <button
                className={`${styles.panelTab} ${rightPanel === 'ebooks' ? styles.panelTabActive : ''}`}
                onClick={() => setRightPanel('ebooks')}
              >Ebooks</button>
            </div>
            <div className={styles.panelBody}>
              <div className={rightPanel === 'ai' ? styles.panelVisible : styles.panelHidden}>
                <LiveChat
                  subject={room.subject}
                  subjectColor={room.color}
                  onSave={saveToLibrary}
                  savedIds={savedIds}
                  topicPrompt={topicPrompt}
                  onTopicConsumed={handleTopicConsumed}
                  session={session}
                  roomId={room.id}
                  activeTopic={activeTopic}
                />
              </div>
              <div className={rightPanel === 'group' ? styles.panelVisible : styles.panelHidden}>
                <GroupChat roomId={room.id} session={session} onOpenDm={handleOpenDm} />
              </div>
              {/* MessagesPanel is always mounted so its subscription stays active */}
              <div className={rightPanel === 'messages' ? styles.panelVisible : styles.panelHidden}>
                <MessagesPanel
                  session={session}
                  isActive={rightPanel === 'messages'}
                  initialConv={dmConvTarget}
                  onClearInitialConv={() => setDmConvTarget(null)}
                  onUnread={() => setUnreadDm(d => d + 1)}
                  onSignIn={() => setShowDmAuth('signin')}
                />
              </div>
              <div className={rightPanel === 'library' ? styles.panelVisible : styles.panelHidden}>
                <Library
                  items={library}
                  onDelete={deleteFromLibrary}
                  onUpload={uploadToLibrary}
                  roomId={room.id}
                  session={session}
                  roomLibraryItems={roomLibraryItems}
                  onShareToRoom={handleRoomLibraryShare}
                  onDeleteRoomItem={deleteRoomLibraryItem}
                />
              </div>
              <div className={rightPanel === 'ebooks' ? styles.panelVisible : styles.panelHidden}>
                <div className={styles.ebooksEmpty}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                  </svg>
                  <h3 className={styles.ebooksTitle}>IB Ebooks</h3>
                  <p className={styles.ebooksSub}>Free study ebooks for IB subjects are on the way. Check back soon.</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Auth gate for guests who try to DM */}
      {showDmGate && (
        <AuthPromptModal
          onClose={() => setShowDmGate(false)}
          accentText="Direct Messages"
          title="Create a free account to send direct messages"
          body="Sign up to message other students privately and collaborate one-on-one."
          primaryLabel="Sign up — it's free"
          onPrimary={() => { setShowDmGate(false); setShowDmAuth('signup') }}
          secondaryLabel="Sign in"
          onSecondary={() => { setShowDmGate(false); setShowDmAuth('signin') }}
        />
      )}
      {showDmAuth && (
        <AuthModal
          initialMode={showDmAuth}
          onClose={() => setShowDmAuth(null)}
          onAuth={() => setShowDmAuth(null)}
        />
      )}

      {/* Leave warning — shown when there are shared Room Library items */}
      {showLeaveWarning && (
        <LeaveWarningModal
          items={roomLibraryItems}
          onLeave={() => navigate('rooms')}
          onStay={() => setShowLeaveWarning(false)}
        />
      )}

      {/* Mobile people bottom sheet */}
      {mobileUsersOpen && (
        <div className={styles.mobileSheet} onClick={() => setMobileUsersOpen(false)}>
          <div className={styles.mobileSheetContent} onClick={e => e.stopPropagation()}>
            <div className={styles.mobileSheetHandle} />
            <div className={styles.mobileSheetLabel}>In this room</div>
            <UserList
              users={presentUsers}
              selfKey={presenceKeyRef.current}
              onUserClick={(uid, name) => { setMobileUsersOpen(false); handleOpenDm(uid, name) }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
