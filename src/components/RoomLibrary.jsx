import { useState } from 'react'
import styles from './RoomLibrary.module.css'

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
    </svg>
  )
}

function ExportIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  )
}

function exportAsPDF(item) {
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
          <div className={styles.cardActions}>
            <button className={styles.exportBtn} onClick={() => exportAsPDF(item)}>
              <ExportIcon /> Export PDF
            </button>
          </div>
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
