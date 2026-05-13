import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import AuthPromptModal from './AuthPromptModal'
import AuthModal from './AuthModal'
import styles from './RoomLibrary.module.css'

function fmtDate(ts) {
  return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
    </svg>
  )
}

function renderInline(text, keyPrefix) {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g).map((part, i) => {
    const k = `${keyPrefix}-${i}`
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={k}>{part.slice(2, -2)}</strong>
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) return <em key={k}>{part.slice(1, -1)}</em>
    if (part.startsWith('`') && part.endsWith('`')) return <code key={k} className={styles.inlineCode}>{part.slice(1, -1)}</code>
    return <span key={k}>{part}</span>
  })
}

function ContentPreview({ content, expanded }) {
  const preview = expanded ? content : content.slice(0, 280)
  return (
    <div className={styles.preview}>
      {preview.split('\n').map((line, i) => {
        const bullet = line.match(/^[-*]\s+(.+)/)
        const heading = line.match(/^#{1,3}\s+(.+)/)
        if (heading) return <p key={i} className={styles.previewHeading}>{renderInline(heading[1], i)}</p>
        if (bullet)  return <p key={i} className={styles.previewBullet}>• {renderInline(bullet[1], i)}</p>
        if (!line.trim()) return null
        return <p key={i} className={styles.previewLine}>{renderInline(line, i)}</p>
      })}
    </div>
  )
}

function RoomLibraryCard({ item, currentUserId, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const isOwn    = currentUserId && item.user_id === currentUserId
  const isAI     = item.type === 'ai_response'
  const isLong   = isAI && item.content && item.content.length > 280

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardMeta}>
          <span className={`${styles.badge} ${isAI ? styles.badgePurple : styles.badgeGrey}`}>
            {isAI ? 'AI Response' : 'Upload'}
          </span>
          <span className={styles.sharedBy}>by {item.user_display_name}</span>
          <span className={styles.dot}>·</span>
          <span className={styles.date}>{fmtDate(item.created_at)}</span>
        </div>
        {isOwn && (
          <button className={styles.deleteBtn} onClick={() => onDelete(item.id)} title="Remove">
            <TrashIcon />
          </button>
        )}
      </div>

      <p className={styles.cardTitle}>{item.title}</p>

      {isAI && item.content && (
        <>
          <ContentPreview content={item.content} expanded={expanded} />
          {isLong && (
            <button className={styles.toggleBtn} onClick={() => setExpanded(e => !e)}>
              {expanded ? 'Show less ↑' : 'Show more ↓'}
            </button>
          )}
        </>
      )}

      {!isAI && item.file_url && (
        <a href={item.file_url} target="_blank" rel="noreferrer" className={styles.fileLink}>
          View / Download ↗
        </a>
      )}
    </div>
  )
}

export default function RoomLibrary({ roomId, session }) {
  const [items,         setItems]         = useState([])
  const [loading,       setLoading]       = useState(true)
  const [showAuthGate,  setShowAuthGate]  = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(null)

  const currentUserId = session?.user?.id || null

  useEffect(() => {
    supabase
      .from('room_library')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setItems(data)
        setLoading(false)
      })

    const channel = supabase
      .channel(`room_library:${roomId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'room_library', filter: `room_id=eq.${roomId}` },
        () => {
          supabase
            .from('room_library')
            .select('*')
            .eq('room_id', roomId)
            .order('created_at', { ascending: false })
            .then(({ data }) => { if (data) setItems(data) })
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [roomId])

  const handleDelete = async (id) => {
    await supabase.from('room_library').delete().eq('id', id).eq('user_id', currentUserId)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const openAuth = (mode) => { setShowAuthGate(false); setShowAuthModal(mode) }

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <span className={styles.sectionLabel}>Room Library</span>
        <span className={styles.count}>{items.length} shared</span>
      </div>

      {loading && <p className={styles.stateText}>Loading…</p>}

      {!loading && items.length === 0 && (
        <p className={styles.stateText}>
          No resources shared yet. Save an AI response or upload a file to share it with this room.
        </p>
      )}

      {items.map(item => (
        <RoomLibraryCard
          key={item.id}
          item={item}
          currentUserId={currentUserId}
          onDelete={handleDelete}
        />
      ))}

      {showAuthGate && (
        <AuthPromptModal
          onClose={() => setShowAuthGate(false)}
          accentText="Sign in to share"
          title="Create a free account to share resources with your room"
          body="Guests can view the Room Library. Sign up to contribute AI responses and uploads."
          primaryLabel="Sign up — it's free"
          onPrimary={() => openAuth('signup')}
          secondaryLabel="Sign in"
          onSecondary={() => openAuth('signin')}
        />
      )}

      {showAuthModal && (
        <AuthModal
          initialMode={showAuthModal}
          onClose={() => setShowAuthModal(null)}
          onAuth={() => setShowAuthModal(null)}
        />
      )}
    </div>
  )
}
