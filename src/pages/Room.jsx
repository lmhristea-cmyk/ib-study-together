import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import tibetanBowl from '../assets/tibetan-bowl.mp3.mp3'
import PomodoroTimer from '../components/PomodoroTimer'
import LiveChat from '../components/LiveChat'
import GroupChat from '../components/GroupChat'
import DirectMessage from '../components/DirectMessage'
import Library from '../components/Library'
import UserCard from '../components/UserCard'
import { getRoomUsers } from '../data/mockUsers'
import styles from './Room.module.css'

const libraryKey = (roomId) => `ib-library-${roomId}`

export default function Room({ room, navigate }) {
  const [users] = useState(() => getRoomUsers(room.id))
  const [activeTab, setActiveTab] = useState('chat')
  const [rightPanel, setRightPanel] = useState('ai')
  const [activeTopic, setActiveTopic] = useState(null)
  const [topicPrompt, setTopicPrompt] = useState(null)
  const [dmUser, setDmUser] = useState(null)
  const [dmHistory, setDmHistory] = useState({})
  const [unread, setUnread] = useState(() => {
    // seed one user as having an unread message to demo the feature
    const u = getRoomUsers(room.id).find(u => u.status === 'studying')
    return u ? { [u.id]: true } : {}
  })

  const handleTopicClick = (topic) => {
    setActiveTopic(topic)
    setRightPanel('ai')
    setTopicPrompt(`Give me an IB-style practice question on "${topic}" for ${room.subject}. Just the question itself — no answer yet.`)
  }

  const handleTopicConsumed = () => setTopicPrompt(null)

  const openDm = (user) => {
    setDmUser(user)
    setDmHistory(prev => prev[user.id] ? prev : { ...prev, [user.id]: user })
  }

  const closeDm = () => setDmUser(null)

  const markRead = useCallback((userId) => {
    setUnread(prev => { const n = { ...prev }; delete n[userId]; return n })
  }, [])

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

  const online = users.filter(u => u.status !== 'offline')
  const studying = users.filter(u => u.status === 'studying')
  const onBreak = users.filter(u => u.status === 'on_break')

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
        <div className={styles.headerRight}>
          <div className={styles.onlineBadge}>
            <span className={styles.onlineDot} />
            {online.length} online
          </div>
          <div className={styles.statChip}>{studying.length} studying</div>
          <div className={styles.statChip}>{onBreak.length} on break</div>
        </div>
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
            <div className={styles.userList}>
              {online.map(user => (
                <UserCard
                  key={user.id}
                  user={user}
                  onClick={() => openDm(user)}
                  unread={!!unread[user.id]}
                />
              ))}
            </div>
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

          <div className={styles.sideCard}>
            <div className={styles.sideLabel}>Room stats</div>
            <div className={styles.statsRow}>
              <div className={styles.statItem}>
                <span className={styles.statVal}>{users.reduce((a, u) => a + u.pomodoroCount, 0)}</span>
                <span className={styles.statLab}>pomodoros</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statVal}>{online.length}</span>
                <span className={styles.statLab}>online</span>
              </div>
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
            <button
              className={`${styles.mobileTab} ${activeTab === 'users' ? styles.mobileTabActive : ''}`}
              onClick={() => setActiveTab('users')}
            >
              People ({online.length})
            </button>
          </div>
        </main>

        {/* Right: always-mounted panels, CSS show/hide between DM and tabs */}
        <aside className={styles.chatPanel}>
          {/* One DirectMessage per user ever opened — never unmounts */}
          {Object.values(dmHistory).map(u => (
            <div key={u.id} className={dmUser?.id === u.id ? styles.panelSlot : styles.panelHidden}>
              <DirectMessage user={u} onBack={closeDm} markRead={markRead} />
            </div>
          ))}

          {/* Tabs panel — always mounted, hidden while a DM is active */}
          <div className={dmUser ? styles.panelHidden : styles.panelSlot}>
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
                />
              </div>
              <div className={rightPanel === 'group' ? styles.panelVisible : styles.panelHidden}>
                <GroupChat users={users} roomId={room.id} />
              </div>
              <div className={rightPanel === 'library' ? styles.panelVisible : styles.panelHidden}>
                <Library items={library} onDelete={deleteFromLibrary} onUpload={uploadToLibrary} />
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

      {activeTab === 'users' && (
        <div className={`${styles.mobilePanel} card`}>
          <div className="label" style={{ marginBottom: 12 }}>In this room</div>
          {online.map(user => <UserCard key={user.id} user={user} />)}
        </div>
      )}

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
    </div>
  )
}
