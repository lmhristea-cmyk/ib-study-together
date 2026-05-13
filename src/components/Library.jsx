import { useState, useRef } from 'react'
import styles from './Library.module.css'
import RoomLibrary from './RoomLibrary'
import AuthPromptModal from './AuthPromptModal'
import AuthModal from './AuthModal'
import { supabase } from '../supabaseClient'

// ── Icons ─────────────────────────────────────────────────────────────────────

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
    </svg>
  )
}
function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  )
}
function BookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  )
}
function UploadIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
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
function DocIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  )
}
function ImgIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
    </svg>
  )
}
function BookmarkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
    </svg>
  )
}
function ShareIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(ts) {
  return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}

function getTitle(item) {
  if (item.type === 'upload') return item.name
  const first = item.content
    .replace(/^#+\s*/m, '')
    .split('\n')[0]
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/^[-*]\s+/, '')
    .trim()
  return first.length > 70 ? first.slice(0, 70) + '…' : first
}

function renderInline(text, keyPrefix) {
  // Handle **bold**, *italic*, `code`
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g).map((part, i) => {
    const k = `${keyPrefix}-${i}`
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={k}>{part.slice(2, -2)}</strong>
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) return <em key={k}>{part.slice(1, -1)}</em>
    if (part.startsWith('`') && part.endsWith('`')) return <code key={k} className={styles.inlineCode}>{part.slice(1, -1)}</code>
    return <span key={k}>{part}</span>
  })
}

function ResponseText({ content }) {
  const lines = content.split('\n')
  const nodes = []
  let bulletGroup = []

  const flushBullets = () => {
    if (!bulletGroup.length) return
    nodes.push(
      <ul key={`ul-${nodes.length}`} className={styles.mdList}>
        {bulletGroup.map((item, i) => <li key={i}>{renderInline(item, `li-${i}`)}</li>)}
      </ul>
    )
    bulletGroup = []
  }

  lines.forEach((line, i) => {
    if (/^-{3,}$/.test(line.trim())) {
      flushBullets(); nodes.push(<hr key={i} className={styles.mdHr} />); return
    }
    const h3 = line.match(/^###\s+(.+)/); const h2 = line.match(/^##\s+(.+)/); const h1 = line.match(/^#\s+(.+)/)
    const bullet = line.match(/^[-*]\s+(.+)/)
    if (h3)    { flushBullets(); nodes.push(<p key={i} className={styles.mdH3}>{renderInline(h3[1], i)}</p>) }
    else if (h2)    { flushBullets(); nodes.push(<p key={i} className={styles.mdH2}>{renderInline(h2[1], i)}</p>) }
    else if (h1)    { flushBullets(); nodes.push(<p key={i} className={styles.mdH1}>{renderInline(h1[1], i)}</p>) }
    else if (bullet){ bulletGroup.push(bullet[1]) }
    else if (line.trim() === '') { flushBullets(); nodes.push(<div key={i} className={styles.mdSpacer} />) }
    else { flushBullets(); nodes.push(<p key={i} className={styles.mdP}>{renderInline(line, i)}</p>) }
  })
  flushBullets()
  return <div>{nodes}</div>
}

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// ── Export single response ────────────────────────────────────────────────────

function exportResponseAsPDF(item) {
  const date = fmtDate(item.savedAt)

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

  const win = window.open('', '_blank')
  win.document.write(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
  <title>${escHtml(item.subject)} — Library Note</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#fff;color:#111827;padding:40px;max-width:700px;margin:0 auto;font-size:13px;line-height:1.65}
    .header{border-bottom:2px solid #111827;padding-bottom:16px;margin-bottom:28px}
    .badge{display:inline-block;background:#7C3AED;color:#fff;font-size:10px;font-weight:800;padding:3px 8px;border-radius:4px;letter-spacing:.05em;margin-bottom:10px}
    h1{font-size:22px;font-weight:800;letter-spacing:-.02em;margin-bottom:4px}
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
    <div class="badge">AI TUTOR</div>
    <h1>${escHtml(item.subject)}</h1>
    <div class="meta">Saved ${date} · IB Study Together</div>
  </div>
  <div class="content">${fmtContent(item.content)}</div>
  <div class="footer"><span>IB Study Together · Library</span><span>${escHtml(item.subject)} · ${date}</span></div>
  <script>window.onload=function(){window.print()}</script>
  </body></html>`)
  win.document.close()
}

// ── Cards ─────────────────────────────────────────────────────────────────────

function LibraryCard({ item, onDelete, onShareToRoom, isShared }) {
  const [expanded, setExpanded] = useState(false)
  const isUpload = item.type === 'upload'
  const isImage  = isUpload && item.mediaType?.startsWith('image/')
  const title    = getTitle(item)
  const isLong   = !isUpload && item.content.length > 300
  const displayContent = isLong && !expanded ? item.content.slice(0, 300) : item.content

  return (
    <div className={styles.card}>
      <button className={styles.deleteBtn} onClick={() => onDelete(item.id)} title="Remove">
        <TrashIcon />
      </button>

      <div className={styles.cardIcon}>
        {isImage ? <ImgIcon /> : isUpload ? <DocIcon /> : <BookmarkIcon />}
      </div>

      <div className={styles.cardBody}>
        <div className={styles.cardMeta}>
          <span className={`${styles.badge} ${isUpload ? styles.badgeGrey : styles.badgePurple}`}>
            {isUpload ? (isImage ? 'Image' : 'Document') : item.subject}
          </span>
          <span className={styles.cardDate}>{fmtDate(item.savedAt)}</span>
        </div>

        <p className={styles.cardTitle}>{title}</p>

        {isUpload && isImage && (
          <a href={item.dataUrl} target="_blank" rel="noreferrer" className={styles.thumbLink}>
            <img src={item.dataUrl} className={styles.thumb} alt={item.name} />
          </a>
        )}
        {isUpload && !isImage && (
          <a href={item.dataUrl} target="_blank" rel="noreferrer" className={styles.docRow}>
            <DocIcon /><span className={styles.docName}>Open file ↗</span>
          </a>
        )}
        {!isUpload && (
          <>
            <div className={styles.cardPreview}>
              <ResponseText content={displayContent} />
              {isLong && !expanded && <span className={styles.fadeEdge}>…</span>}
            </div>
            {isLong && (
              <button className={styles.toggleBtn} onClick={() => setExpanded(e => !e)}>
                {expanded ? 'Show less ↑' : 'Show more ↓'}
              </button>
            )}
            <div className={styles.cardActions}>
              <button className={styles.exportBtn} onClick={() => exportResponseAsPDF(item)}>
                <ExportIcon /> Export PDF
              </button>
              {onShareToRoom && (
                <button
                  className={`${styles.shareBtn} ${isShared ? styles.shareBtnDone : ''}`}
                  onClick={() => !isShared && onShareToRoom(item)}
                  disabled={isShared}
                >
                  <ShareIcon /> {isShared ? 'Shared ✓' : 'Share to Room'}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'az',     label: 'A–Z' },
]

const VIEW_TABS = [
  { value: 'uploads', label: 'My Uploads' },
  { value: 'ai',      label: 'AI Saved' },
]

export default function Library({ items, onDelete, onUpload, roomId, session }) {
  const [query,        setQuery]        = useState('')
  const [view,         setView]         = useState('uploads')
  const [sort,         setSort]         = useState('newest')
  const [uploading,    setUploading]    = useState(false)
  const [sharedIds,    setSharedIds]    = useState(new Set())
  const [showShareGate,  setShowShareGate]  = useState(false)
  const [showShareModal, setShowShareModal] = useState(null)
  const fileRef = useRef(null)

  const handleShareToRoom = async (item) => {
    if (!session) { setShowShareGate(true); return }
    const displayName = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User'
    const { error } = await supabase.from('room_library').insert({
      room_id: roomId,
      user_id: session.user.id,
      user_display_name: displayName,
      type: 'ai_response',
      title: getTitle(item),
      content: item.content,
    })
    if (!error) setSharedIds(prev => new Set([...prev, item.id]))
  }

  const openShareAuth = (mode) => { setShowShareGate(false); setShowShareModal(mode) }

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setUploading(true)
    try {
      const mediaType = file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream')
      const dataUrl = await readAsDataUrl(file)
      onUpload({ id: Date.now(), type: 'upload', name: file.name, mediaType, dataUrl, savedAt: Date.now() })
    } finally { setUploading(false) }
  }

  const filtered = items
    .filter(item => {
      if (view === 'ai'      && item.type === 'upload')  return false
      if (view === 'uploads' && item.type !== 'upload')  return false
      if (!query.trim()) return true
      const q = query.toLowerCase()
      return item.type === 'upload'
        ? item.name.toLowerCase().includes(q)
        : (item.content || '').toLowerCase().includes(q) || (item.subject || '').toLowerCase().includes(q)
    })
    .sort((a, b) => {
      if (sort === 'oldest') return a.savedAt - b.savedAt
      if (sort === 'az')     return getTitle(a).localeCompare(getTitle(b))
      return b.savedAt - a.savedAt
    })

  return (
    <div className={styles.wrap}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}><SearchIcon /></span>
          <input className={styles.search} placeholder="Search library…" value={query} onChange={e => setQuery(e.target.value)} />
        </div>
        <select className={styles.sortSelect} value={sort} onChange={e => setSort(e.target.value)}>
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Sustainability banner */}
      <div className={styles.sustainBanner}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
        </svg>
        <span>Every saved response is an AI query someone else doesn't need to make.</span>
      </div>

      {/* View tabs */}
      <div className={styles.viewTabs}>
        {VIEW_TABS.map(t => (
          <button key={t.value} className={`${styles.viewTab} ${view === t.value ? styles.viewTabActive : ''}`} onClick={() => setView(t.value)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className={styles.body}>
        {/* My Library header */}
        <div className={styles.sectionHead}>
          <span className={styles.sectionLabel}>My Library</span>
          <div className={styles.sectionActions}>
            <span className={styles.count}>{items.length} saved</span>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp,application/pdf,.docx,.doc" className={styles.fileInput} onChange={handleFile} />
            <button className={styles.uploadBtn} onClick={() => fileRef.current?.click()} disabled={uploading}>
              <UploadIcon />{uploading ? 'Uploading…' : 'Upload'}
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className={styles.empty}>
            {query ? 'No items match your search.' : view === 'ai' ? 'No saved AI responses yet — bookmark a reply in the AI Tutor.' : 'No uploaded files yet — click Upload to add one.'}
          </div>
        ) : (
          <div className={styles.grid}>
            {filtered.map(item => (
              <LibraryCard
                key={item.id}
                item={item}
                onDelete={onDelete}
                onShareToRoom={roomId ? handleShareToRoom : undefined}
                isShared={sharedIds.has(item.id)}
              />
            ))}
          </div>
        )}

        {/* Room Library */}
        {roomId && (
          <div className={styles.roomSection}>
            <RoomLibrary roomId={roomId} session={session} />
          </div>
        )}
      </div>

      {showShareGate && (
        <AuthPromptModal
          onClose={() => setShowShareGate(false)}
          accentText="Sign in to share"
          title="Create a free account to share with your room"
          body="Guests can view the Room Library. Sign up to contribute AI responses."
          primaryLabel="Sign up — it's free"
          onPrimary={() => openShareAuth('signup')}
          secondaryLabel="Sign in"
          onSecondary={() => openShareAuth('signin')}
        />
      )}

      {showShareModal && (
        <AuthModal
          initialMode={showShareModal}
          onClose={() => setShowShareModal(null)}
          onAuth={() => setShowShareModal(null)}
        />
      )}
    </div>
  )
}
