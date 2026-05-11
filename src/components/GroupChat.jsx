import { useState, useRef, useEffect } from 'react'
import styles from './GroupChat.module.css'

const SAMPLE_MESSAGES = [
  { text: "Has anyone started the IA yet? I'm struggling with the research question" },
  { text: "Yes! I went with a question on market structures — way easier to find data for" },
  { text: "Good call. I'm doing something on price elasticity, lots of real-world examples" },
  { text: "Does anyone have good notes on Paper 2 structure? Exam is in 3 weeks" },
  { text: "I can share mine after this session — remind me in the group" },
]

function seedRandom(seed) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

function formatTime(date) {
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
    </svg>
  )
}

function PaperclipIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
    </svg>
  )
}

function Attachment({ attachment }) {
  if (!attachment) return null
  if (attachment.previewUrl) {
    return (
      <a href={attachment.objectUrl} target="_blank" rel="noreferrer" className={styles.attachLink}>
        <img src={attachment.previewUrl} className={styles.attachThumb} alt="uploaded" />
      </a>
    )
  }
  return (
    <a href={attachment.objectUrl} target="_blank" rel="noreferrer" className={styles.attachLink}>
      <div className={styles.pdfChip}><PaperclipIcon /> {attachment.name}</div>
    </a>
  )
}

export default function GroupChat({ users, roomId }) {
  const rand = seedRandom(roomId.split('').reduce((a, c) => a + c.charCodeAt(0), 0))
  const now = Date.now()

  const [messages, setMessages] = useState(() => {
    const online = users.filter(u => u.status !== 'offline')
    return SAMPLE_MESSAGES.slice(0, Math.min(SAMPLE_MESSAGES.length, online.length + 1)).map((m, i) => {
      const user = online[Math.floor(rand() * online.length)]
      const minsAgo = Math.floor(rand() * 18) + 2
      return {
        id: i,
        user,
        text: m.text,
        attachment: null,
        time: new Date(now - minsAgo * 60 * 1000),
        isOwn: false,
      }
    }).sort((a, b) => a.time - b.time)
  })

  const [input, setInput] = useState('')
  const [attachment, setAttachment] = useState(null)
  const bottomRef = useRef(null)
  const fileRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    const mediaType = file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg')
    const objectUrl = URL.createObjectURL(file)
    const previewUrl = mediaType !== 'application/pdf' ? objectUrl : null
    setAttachment({ name: file.name, mediaType, previewUrl, objectUrl })
  }

  const clearAttachment = () => setAttachment(null)

  const deleteMsg = (id) => setMessages(prev => prev.filter(m => m.id !== id))

  const send = () => {
    const text = input.trim()
    if (!text && !attachment) return
    const att = attachment
    setMessages(prev => [...prev, {
      id: Date.now(),
      user: { name: 'You', id: 'me' },
      text,
      attachment: att,
      time: new Date(),
      isOwn: true,
    }])
    setInput('')
    setAttachment(null)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.sustainBanner}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
        </svg>
        <span>Save energy. Save answers. Share notes. Learn from each other.</span>
      </div>
      <div className={styles.messages}>
        {messages.map(msg => (
          <div key={msg.id} className={`${styles.row} ${msg.isOwn ? styles.own : ''}`}>
            {!msg.isOwn && (
              <span className={styles.avatar}>{msg.user.name.charAt(0)}</span>
            )}
            <div className={styles.content}>
              {!msg.isOwn && (
                <div className={styles.meta}>
                  <span className={styles.name}>{msg.user.name}</span>
                  <span className={styles.time}>{formatTime(msg.time)}</span>
                </div>
              )}
              {msg.attachment && <Attachment attachment={msg.attachment} />}
              {msg.text && (
                <div className={`${styles.bubble} ${msg.isOwn ? styles.bubbleOwn : styles.bubbleOther}`}>
                  {msg.text}
                </div>
              )}
              {msg.isOwn && (
                <div className={styles.ownMeta}>
                  <span className={styles.ownTime}>{formatTime(msg.time)}</span>
                  <button className={styles.deleteBtn} onClick={() => deleteMsg(msg.id)} title="Delete message">
                    <TrashIcon />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {attachment && (
        <div className={styles.attachPreview}>
          <Attachment attachment={attachment} />
          <button className={styles.removeBtn} onClick={clearAttachment} title="Remove">×</button>
        </div>
      )}

      <div className={styles.inputRow}>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
          className={styles.fileInput}
          onChange={handleFile}
        />
        <button
          className={styles.attachBtn}
          onClick={() => fileRef.current?.click()}
          title="Attach image or PDF"
          type="button"
        >
          <PaperclipIcon />
        </button>
        <input
          className={styles.input}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={attachment ? 'Add a message (optional)...' : 'Message the room...'}
        />
        <button
          className={styles.sendBtn}
          onClick={send}
          disabled={!input.trim() && !attachment}
        >↑</button>
      </div>
      <div className={styles.hint}>Press Enter to send · Attach images or PDFs</div>
    </div>
  )
}
