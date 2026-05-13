import { useState, useEffect, useRef } from 'react'
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

function UploadIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
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
  // Skip the first non-empty line — it's already shown as cardTitle
  const lines = content.split('\n')
  const firstContentIdx = lines.findIndex(l => l.trim() !== '')
  const body = lines.slice(firstContentIdx + 1).join('\n')
  const preview = expanded ? body : body.slice(0, 280)
  return (
    <div className={styles.preview}>
      {preview.split('\n').map((line, i) => {
        const bullet  = line.match(/^[-*]\s+(.+)/)
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
  const isOwn  = currentUserId && item.user_id === currentUserId
  const isAI   = item.type === 'ai_response'
  // "long" is measured against the body after skipping the first line (which is the title)
  const body   = isAI && item.content
    ? item.content.split('\n').slice(item.content.split('\n').findIndex(l => l.trim() !== '') + 1).join('\n')
    : ''
  const isLong = body.length > 280

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardMeta}>
          <span className={`${styles.badge} ${isAI ? styles.badgePurple : styles.badgeBlue}`}>
            {isAI ? 'AI Response' : 'Upload'}
          </span>
          <span className={styles.sharedBy}>by {item.user_display_name}</span>
          <span className={styles.dot}>·</span>
          <span className={styles.date}>{fmtDate(item.created_at)}</span>
        </div>
        {isOwn && (
          <button className={styles.deleteBtn} onClick={() => onDelete(item)} title="Remove">
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
  const [uploading,     setUploading]     = useState(false)
  const [uploadError,   setUploadError]   = useState(null)
  const [showAuthGate,  setShowAuthGate]  = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(null)
  const fileRef = useRef(null)

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

  const handleUploadClick = () => {
    if (!session) { setShowAuthGate(true); return }
    fileRef.current?.click()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setUploadError(null)

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File too large — maximum size is 10 MB.')
      return
    }

    setUploading(true)
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const path = `${roomId}/${Date.now()}-${safeName}`

      const { error: storageError } = await supabase.storage
        .from('room-library-files')
        .upload(path, file, { contentType: file.type, upsert: false })

      if (storageError) throw storageError

      const { data: { publicUrl } } = supabase.storage
        .from('room-library-files')
        .getPublicUrl(path)

      const displayName = session.user.user_metadata?.full_name
        || session.user.email?.split('@')[0]
        || 'User'

      const { error: dbError } = await supabase.from('room_library').insert({
        room_id:           roomId,
        user_id:           session.user.id,
        user_display_name: displayName,
        type:              'upload',
        title:             file.name,
        file_url:          publicUrl,
        content:           null,
      })

      if (dbError) throw dbError
    } catch (err) {
      setUploadError(err.message || 'Upload failed — please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (item) => {
    // Remove DB record
    await supabase.from('room_library').delete().eq('id', item.id).eq('user_id', currentUserId)

    // Also remove from Storage for file uploads
    if (item.type === 'upload' && item.file_url) {
      try {
        const url = new URL(item.file_url)
        const marker = '/object/public/room-library-files/'
        const idx = url.pathname.indexOf(marker)
        if (idx !== -1) {
          const storagePath = decodeURIComponent(url.pathname.slice(idx + marker.length))
          await supabase.storage.from('room-library-files').remove([storagePath])
        }
      } catch { /* storage cleanup best-effort */ }
    }

    setItems(prev => prev.filter(i => i.id !== item.id))
  }

  const openAuth = (mode) => { setShowAuthGate(false); setShowAuthModal(mode) }

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <span className={styles.sectionLabel}>Room Library</span>
        <div className={styles.headerRight}>
          <span className={styles.count}>{items.length} shared</span>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp,application/pdf,.doc,.docx"
            className={styles.fileInput}
            onChange={handleFileChange}
          />
          <button className={styles.uploadBtn} onClick={handleUploadClick} disabled={uploading}>
            <UploadIcon />
            {uploading ? 'Uploading…' : 'Upload'}
          </button>
        </div>
      </div>

      {uploadError && <p className={styles.uploadError}>{uploadError}</p>}

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
