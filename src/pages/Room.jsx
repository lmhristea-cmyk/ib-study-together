import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import tibetanBowl from '../assets/tibetan-bowl.mp3.mp3'
import PomodoroTimer from '../components/PomodoroTimer'
import LiveChat from '../components/LiveChat'
import GroupChat from '../components/GroupChat'
import Library from '../components/Library'
import { supabase } from '../supabaseClient'
import DmModal from '../components/DirectMessage'
import AuthPromptModal from '../components/AuthPromptModal'
import AuthModal from '../components/AuthModal'
import styles from './Room.module.css'

const libraryKey = (roomId) => `ib-library-${roomId}`

export default function Room({ room, navigate, session }) {
  const [activeTab, setActiveTab] = useState('chat')
  const [rightPanel, setRightPanel] = useState('ai')
  const [activeTopic, setActiveTopic] = useState(null)
  const [topicPrompt, setTopicPrompt] = useState(null)

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

  const savedIds = useMemo(() => new Set(library.map(i => i.msgId)), [library])

  const saveToLibrary = useCallback(({ msgId, content }) => {
    if (savedIds.has(msgId)) return
    setLibrary(prev => [...prev, { id: Date.now(), msgId, subject: room.subject, content, savedAt: Date.now() }])
  }, [savedIds, room.subject])

  const deleteFromLibrary = useCallback((id) => {
    setLibrary(prev => prev.filter(i => i.id !== id))
  }, [])

  const [presentUsers, setPresentUsers] = useState([])
  const presenceKeyRef = useRef(session?.user?.id ?? crypto.randomUUID())

  const [dmTarget,   setDmTarget]   = useState(null)  // { userId, userName }
  const [showDmGate, setShowDmGate] = useState(false)
  const [showDmAuth, setShowDmAuth] = useState(null)  // 'signin' | 'signup' | null

  const handleOpenDm = (targetId, targetName) => {
    if (!session) { setShowDmGate(true); return }
    if (!targetId) return
    setDmTarget({ userId: targetId, userName: targetName })
  }

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
          await channel.track({ display_name: displayName, uid: presenceKeyRef.current, authenticated: !!session })
        }
      })

    return () => { supabase.removeChannel(channel) }
  }, [room.id, session?.user?.id])

  const audioRef = useRef(null)
  const [soundPlaying, setSoundPlaying] = useState(false)
  const [soundMuted, setSoundMuted] = useState(false)

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
    if (soundPlaying) {
      audio.pause()
      setSoundPlaying(false)
    } else {
      audio.play()
      setSoundPlaying(true)
    }
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

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={() => navigate('rooms')}>← Back</button>
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
        <div className={styles.headerRight} />
      </div>

      {/* Layout */}
      <div className={styles.layout}>
        {/* Timer bar — spans all columns */}
        <div className={styles.timerRow}>
          <PomodoroTimer roomId={room.id} />
        </div>

        {/* Left: Users */}
        <aside className={styles.sidebar}>
          <div className={styles.sideCard}>
            <div className={styles.sideLabel}>In this room</div>
            {presentUsers.length === 0 ? (
              <p className={styles.emptyPresence}>No one else is here yet — share the link to study together!</p>
            ) : (
              <div className={styles.presenceList}>
                {presentUsers.map(u => {
                  const isMe = u.uid === presenceKeyRef.current
                  const canDm = !isMe && u.authenticated
                  return (
                    <div
                      key={u.presence_ref}
                      className={`${styles.presenceUser} ${!isMe ? styles.presenceUserClickable : ''}`}
                      onClick={() => !isMe && handleOpenDm(canDm ? u.uid : null, u.display_name)}
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
            )}
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

        {/* Center: empty fill + mobile tabs */}
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

        {/* Right: panels */}
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
                />
              </div>
              <div className={rightPanel === 'group' ? styles.panelVisible : styles.panelHidden}>
                <GroupChat roomId={room.id} session={session} onOpenDm={handleOpenDm} />
              </div>
              <div className={rightPanel === 'library' ? styles.panelVisible : styles.panelHidden}>
                <Library items={library} onDelete={deleteFromLibrary} onUpload={uploadToLibrary} roomId={room.id} session={session} />
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

      {/* Tibetan bowl ambient sound */}
      <div className={styles.soundWidget}>
        <button
          className={`${styles.soundBtn} ${soundPlaying ? styles.soundActive : ''}`}
          onClick={toggleSound}
          title={soundPlaying ? 'Stop ambient sound' : 'Play ambient sound'}
        >
          {soundPlaying && !soundMuted ? '🔔' : soundPlaying && soundMuted ? '🔇' : '🔕'}
        </button>
        {soundPlaying && (
          <button
            className={styles.muteBtn}
            onClick={toggleMute}
            title={soundMuted ? 'Unmute' : 'Mute'}
          >
            {soundMuted ? 'unmute' : 'mute'}
          </button>
        )}
      </div>

      {dmTarget && session && (
        <DmModal
          session={session}
          toUserId={dmTarget.userId}
          toUserName={dmTarget.userName}
          onClose={() => setDmTarget(null)}
        />
      )}

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
    </div>
  )
}
