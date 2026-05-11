import { useState, useRef, useEffect } from 'react'
import styles from './LiveChat.module.css'

const CAS_SYSTEM_PROMPT = `You are a CAS Advisor for IB Diploma Programme students. CAS (Creativity, Activity, Service) is an experiential learning component — there are no exams, but students must complete 18 months of meaningful engagement and maintain a reflective portfolio.

## Your Role
Help students with:
- Writing strong CAS reflections
- Identifying which of the 7 Learning Outcomes their activities cover
- Brainstorming Creativity, Activity, and Service ideas
- Structuring and improving their CAS portfolio
- Understanding what their CAS coordinator is looking for
- Preparing for their CAS interview

## The 7 CAS Learning Outcomes
Always reference these when helping students reflect or plan:
1. Identify own strengths and develop areas for growth
2. Demonstrate that challenges have been undertaken
3. Demonstrate how to initiate and plan a CAS experience
4. Show commitment to and perseverance in CAS experiences
5. Demonstrate the skills and recognise the benefits of working collaboratively
6. Demonstrate engagement with issues of global significance
7. Recognise and consider the ethics of choices and actions

## Reflection Writing Help
- Push students beyond surface-level descriptions ("I did X") to genuine reflection ("I noticed / I felt / I realised / This changed how I think about...")
- Use reflection prompts: What? So what? Now what?
- Encourage specific details, not vague generalities
- Remind students reflections can be written, video, audio, or creative — not just essays
- Flag if a reflection sounds too short, too descriptive, or lacks a learning outcome connection

## Activity Guidance
- Help students see everyday activities as valid CAS (sport, art, volunteering, clubs)
- Remind them they need a balance of C, A, and S across their programme
- At least one activity must be a CAS Project (collaborative, sustained)
- Encourage activities that connect to LO6 (global significance) and LO7 (ethics)

## Portfolio Advice
- Remind students to upload evidence regularly, not all at once at the end
- Evidence can be photos, videos, emails, certificates, screenshots
- Each activity needs at least one reflection — longer experiences need multiple
- The portfolio should tell a story of growth, not just a list of activities

## Tone
- Encouraging and non-judgmental — CAS anxiety is real
- Be honest if a reflection needs more depth, but always explain how to improve it
- Never write the reflection for the student — guide them to write it themselves
- Remind students that CAS is meant to be enjoyable, not a checkbox exercise`

const getSystemPrompt = (subject) => subject === 'CAS' ? CAS_SYSTEM_PROMPT : `You are an expert IB tutor specializing in ${subject} for the IB Diploma Programme.
You help students (ages 16-19) understand concepts, work through problems, and prepare for exams.

## Core Guidelines
- Be concise, clear, and encouraging — never overwhelming
- Use IB-specific terminology and reference the IB curriculum directly
- Align answers with IB mark scheme language: award one point per distinct, clearly stated idea
- Distinguish between HL and SL content where relevant — if the subject includes "HL", go deeper

## Subject-Specific Approach
- **Maths/Sciences**: Show full step-by-step working; reference data booklet values where applicable
- **Humanities (History, Economics, Geography)**: Help with essay structure using PEEL or similar; reference Paper 1/2/3 source analysis skills
- **Languages (Language A/B)**: Guide on literary analysis, oral commentary structure, and written tasks
- **Computer Science**: Use pseudocode in IB format; reference the approved notation
- **TOK/EE**: Help structure arguments, identify knowledge questions, and meet assessment criteria

## IB Assessment Awareness
- Always reference relevant assessment components: IA, Paper 1/2/3, IOC, EE, TOK Exhibition
- For IA questions, reference the specific criteria (e.g. Criterion A: Focus and Method)
- For exam questions, identify the command term (describe, explain, evaluate, discuss, analyse, etc.) and tailor the answer accordingly

## Response Format
- Use markdown: bold for key terms, bullet points for lists, code blocks for CS
- For exam-style questions, structure the response as a model answer with examiner notes
- Keep responses focused — if a question is broad, ask the student to narrow it down
- When an image or PDF is shared, carefully analyse its content and provide specific help based on what you see — past paper questions, diagrams, graphs, handwritten notes, etc.

## Tone
- Encouraging but honest — if an answer is incomplete, explain what's missing and why
- Never just give the answer outright for problem-solving questions — guide the student to it
- Celebrate correct reasoning, not just correct answers`

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      // result is "data:<mediaType>;base64,<data>" — strip the prefix
      const base64 = reader.result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function buildApiContent(text, attachment) {
  if (!attachment) return text
  const block = attachment.mediaType === 'application/pdf'
    ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: attachment.data } }
    : { type: 'image',    source: { type: 'base64', media_type: attachment.mediaType,  data: attachment.data } }
  const parts = [block]
  if (text) parts.push({ type: 'text', text })
  return parts
}

function BookmarkIcon({ filled }) {
  return filled
    ? <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
    : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
}

export default function LiveChat({ subject, subjectColor, onSave, savedIds = new Set(), topicPrompt = null, onTopicConsumed }) {
  const [messages, setMessages] = useState([
    {
      id: 0,
      role: 'assistant',
      content: `Hi! I'm your AI tutor for **${subject}**. Ask me anything — concepts, past paper questions, IA help, or exam tips. You can also upload an image or PDF and I'll analyse it for you.`,
    },
  ])
  const [input, setInput] = useState('')
  const [attachment, setAttachment] = useState(null) // { file, mediaType, data, previewUrl }
  const [loading, setLoading] = useState(false)
  const [showUploadNudge, setShowUploadNudge] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const fileRef = useRef(null)
  const isTopicRequestRef = useRef(false)
  const sendRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (!topicPrompt) return
    setShowUploadNudge(false)
    isTopicRequestRef.current = true
    sendRef.current(topicPrompt)
    onTopicConsumed?.()
  }, [topicPrompt])

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    const mediaType = file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg')
    const data = await readFileAsBase64(file)
    const objectUrl = URL.createObjectURL(file)
    const previewUrl = mediaType !== 'application/pdf' ? objectUrl : null
    setAttachment({ name: file.name, mediaType, data, previewUrl, objectUrl })
  }

  const clearAttachment = () => {
    // Don't revoke objectUrl — it may still be referenced in sent messages
    setAttachment(null)
  }

  const send = async (forcedText) => {
    const text = typeof forcedText === 'string' ? forcedText : input.trim()
    if ((!text && !attachment) || loading) return
    if (typeof forcedText !== 'string') setInput('')
    const att = attachment
    setAttachment(null)

    const userMsg = { id: Date.now(), role: 'user', content: text, attachment: att }
    const history = [...messages, userMsg]
    setMessages(history)
    setLoading(true)

    try {
      // Build API messages — only current message uses attachment; history uses stored content
      const apiMessages = history.map(m => ({
        role: m.role,
        content: m.attachment ? buildApiContent(m.content, m.attachment) : m.content,
      }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          system: getSystemPrompt(subject),
          messages: apiMessages,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error?.message || `API error ${res.status}`)
      }

      const data = await res.json()
      setMessages(prev => [...prev, { id: Date.now(), role: 'assistant', content: data.content[0].text }])
      if (isTopicRequestRef.current) {
        setShowUploadNudge(true)
        isTopicRequestRef.current = false
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: 'assistant',
        content: `Sorry, I ran into an error: ${err.message}`,
      }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  sendRef.current = send

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  const deleteMsg = (id) => setMessages(prev => prev.filter(m => m.id !== id))

  const canSend = (input.trim() || attachment) && !loading

  return (
    <div className={styles.wrap}>
      <div className={styles.sustainBanner}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
        </svg>
        <span>Every saved response is an AI query someone else doesn't need to make.</span>
      </div>
      <div className={styles.messages}>
        {messages.map((msg) => (
          <div key={msg.id} className={`${styles.msg} ${msg.role === 'user' ? styles.user : styles.assistant}`}>
            {msg.role === 'assistant' && <span className={styles.msgIcon}>AI</span>}
            <div className={styles.bubbleCol}>
              {msg.attachment && (
                msg.attachment.previewUrl
                  ? <a href={msg.attachment.objectUrl} target="_blank" rel="noreferrer" className={styles.attachLink}>
                      <img src={msg.attachment.previewUrl} className={styles.attachThumb} alt="uploaded" />
                    </a>
                  : <a href={msg.attachment.objectUrl} target="_blank" rel="noreferrer" className={styles.attachLink}>
                      <div className={styles.pdfChip}>
                        <PaperclipIcon /> {msg.attachment.name}
                      </div>
                    </a>
              )}
              {msg.content && (
                <div className={styles.bubble} style={msg.role === 'user' ? { background: '#F3F4F6', borderColor: '#E5E7EB' } : {}}>
                  <MessageContent content={msg.content} />
                </div>
              )}
              {msg.role === 'user' && (
                <button className={styles.deleteBtn} onClick={() => deleteMsg(msg.id)} title="Delete message">
                  <TrashIcon />
                </button>
              )}
              {msg.role === 'assistant' && msg.id !== 0 && onSave && (
                <button
                  className={`${styles.bookmarkBtn} ${savedIds.has(msg.id) ? styles.bookmarkSaved : ''}`}
                  onClick={() => onSave({ msgId: msg.id, content: msg.content })}
                  title={savedIds.has(msg.id) ? 'Saved to library' : 'Save to library'}
                >
                  <BookmarkIcon filled={savedIds.has(msg.id)} />
                  {savedIds.has(msg.id) ? 'Saved' : 'Save'}
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className={`${styles.msg} ${styles.assistant}`}>
            <span className={styles.msgIcon}>AI</span>
            <div className={styles.bubble}>
              <div className={styles.typing}><span /><span /><span /></div>
            </div>
          </div>
        )}
        {messages.length > 1 && (
          <div className={styles.exportRow}>
            <button
              className={styles.exportLink}
              onClick={async () => {
                const { exportChatAsPDF } = await import('../utils/exportChat')
                exportChatAsPDF(messages, subject)
              }}
            >
              ↓ Export chat as PDF
            </button>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Upload nudge — shown after topic-triggered questions */}
      {showUploadNudge && (
        <div className={styles.uploadNudge}>
          <span className={styles.nudgeIcon}>📎</span>
          <div className={styles.nudgeText}>
            <strong>Have a past paper?</strong> Upload it to get specific feedback on this question.
          </div>
          <button className={styles.nudgeUpload} onClick={() => fileRef.current?.click()}>
            Upload
          </button>
          <button className={styles.nudgeDismiss} onClick={() => setShowUploadNudge(false)}>✕</button>
        </div>
      )}

      {/* Attachment preview strip */}
      {attachment && (
        <div className={styles.attachPreview}>
          {attachment.previewUrl
            ? <a href={attachment.objectUrl} target="_blank" rel="noreferrer" className={styles.attachLink}>
                <img src={attachment.previewUrl} className={styles.previewThumb} alt="preview" />
              </a>
            : <a href={attachment.objectUrl} target="_blank" rel="noreferrer" className={styles.attachLink}>
                <div className={styles.pdfChip}><PaperclipIcon /> {attachment.name}</div>
              </a>
          }
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
          ref={inputRef}
          className={styles.input}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={attachment ? 'Add a message (optional)...' : 'Ask about a concept, past paper question, or IA help...'}
          rows={3}
        />
        <button className={styles.sendBtn} onClick={send} disabled={!canSend}>↑</button>
      </div>
      <div className={styles.hint}>Press Enter to send · Shift+Enter for new line · Attach images or PDFs</div>
    </div>
  )
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

function MessageContent({ content }) {
  const parts = content.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
  return (
    <p className={styles.msgText}>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**'))
          return <strong key={i}>{part.slice(2, -2)}</strong>
        if (part.startsWith('`') && part.endsWith('`'))
          return <code key={i} className={styles.inlineCode}>{part.slice(1, -1)}</code>
        return part.split('\n').map((line, j, arr) => (
          <span key={`${i}-${j}`}>{line}{j < arr.length - 1 ? <br /> : null}</span>
        ))
      })}
    </p>
  )
}
