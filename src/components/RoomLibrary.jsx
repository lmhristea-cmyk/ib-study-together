import { useState } from 'react'
import styles from './RoomLibrary.module.css'

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
    </svg>
  )
}

function fmtDate(ts) {
  return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
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
  const isOwn = currentUserId && item.user_id === currentUserId
  const body  = item.content
    ? item.content.split('\n').slice(item.content.split('\n').findIndex(l => l.trim() !== '') + 1).join('\n')
    : ''
  const isLong = body.length > 280

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardMeta}>
          <span className={`${styles.badge} ${styles.badgePurple}`}>AI Response</span>
          <span className={styles.sharedBy}>by {item.user_display_name}</span>
          <span className={styles.dot}>·</span>
          <span className={styles.date}>{fmtDate(item.created_at)}</span>
        </div>
        {isOwn && onDelete && (
          <button className={styles.deleteBtn} onClick={() => onDelete(item.id)} title="Remove">
            <TrashIcon />
          </button>
        )}
      </div>

      <p className={styles.cardTitle}>{item.title}</p>

      {item.content && (
        <>
          <ContentPreview content={item.content} expanded={expanded} />
          {isLong && (
            <button className={styles.toggleBtn} onClick={() => setExpanded(e => !e)}>
              {expanded ? 'Show less ↑' : 'Show more ↓'}
            </button>
          )}
        </>
      )}
    </div>
  )
}

export default function RoomLibrary({ items, session, onDeleteItem }) {
  const currentUserId = session?.user?.id || null

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <span className={styles.sectionLabel}>Room Library</span>
        <span className={styles.count}>{items.length} shared</span>
      </div>

      {items.length === 0 && (
        <p className={styles.stateText}>
          No resources shared yet. Save an AI response and click "Share to Room" to contribute.
        </p>
      )}

      {items.map(item => (
        <RoomLibraryCard
          key={item.id}
          item={item}
          currentUserId={currentUserId}
          onDelete={onDeleteItem}
        />
      ))}
    </div>
  )
}
