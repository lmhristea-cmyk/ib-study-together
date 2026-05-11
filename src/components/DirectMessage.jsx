import { useState, useRef, useEffect } from 'react'
import styles from './DirectMessage.module.css'

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

const OPENERS = [
  "Hey! Good luck with your studies today 👋",
  "Hi there! Are you working on anything interesting right now?",
  "Hey, nice to see another IB student here! What subject are you focusing on?",
  "Hi! I've been struggling with this topic — glad to have study buddies around.",
  "Hey! Hope your session is going well. Feel free to message if you want to study together!",
]

function getOpener(userId) {
  return OPENERS[Number(userId) % OPENERS.length]
}

export default function DirectMessage({ user, onBack, markRead }) {
  const [messages, setMessages] = useState(() => [
    { id: 1, from: user.id, text: getOpener(user.id), ts: Date.now() - 60000 }
  ])
  const [draft, setDraft] = useState('')
  const [attachment, setAttachment] = useState(null)
  const bottomRef = useRef(null)
  const fileRef = useRef(null)

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

  useEffect(() => {
    markRead(user.id)
  }, [user.id, markRead])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = () => {
    const text = draft.trim()
    if (!text && !attachment) return
    const att = attachment
    setMessages(prev => [...prev, { id: Date.now(), from: 'me', text, attachment: att, ts: Date.now() }])
    setDraft('')
    setAttachment(null)

    // Simulate a reply after a short delay
    const replies = [
      "That's a great point!",
      "Totally agree, it's been a tough one.",
      "Nice! I'm working through something similar.",
      "Oh interesting — how did you approach it?",
      "Good luck! Let me know if you want to compare notes.",
    ]
    const reply = replies[Math.floor(Math.random() * replies.length)]
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now() + 1, from: user.id, text: reply, ts: Date.now() }])
    }, 1200 + Math.random() * 800)
  }

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  function fmt(ts) {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack}>← Back to Room</button>
        <div className={styles.headerUser}>
          <span className={styles.avatar}>{user.name.charAt(0)}</span>
          <div>
            <span className={styles.userName}>{user.name}</span>
            <span className={styles.userStatus}>{user.timezone}</span>
          </div>
        </div>
      </div>

      <div className={styles.messages}>
        {messages.map(msg => {
          const isMe = msg.from === 'me'
          return (
            <div key={msg.id} className={`${styles.row} ${isMe ? styles.rowMe : styles.rowThem}`}>
              {!isMe && <span className={styles.avatar}>{user.name.charAt(0)}</span>}
              <div className={styles.bubbleWrap}>
                {msg.attachment && <Attachment attachment={msg.attachment} />}
                {msg.text && (
                  <div className={`${styles.bubble} ${isMe ? styles.bubbleMe : styles.bubbleThem}`}>
                    {msg.text}
                  </div>
                )}
                <div className={styles.msgMeta}>
                  <span className={styles.ts}>{fmt(msg.ts)}</span>
                  {isMe && (
                    <button className={styles.deleteBtn} onClick={() => deleteMsg(msg.id)} title="Delete message">
                      <TrashIcon />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
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
        <textarea
          className={styles.input}
          rows={2}
          placeholder={attachment ? 'Add a message (optional)…' : `Message ${user.name.split(' ')[0]}…`}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={onKey}
        />
        <button className={styles.sendBtn} onClick={send} disabled={!draft.trim() && !attachment}>↑</button>
      </div>
    </div>
  )
}
