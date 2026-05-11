export function exportChatAsPDF(messages, subject) {
  const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const userCount = messages.filter(m => m.role === 'user').length
  const aiCount = messages.filter(m => m.role === 'assistant').length - 1

  function escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  }

  function formatContent(text) {
    return escapeHtml(text)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>')
  }

  const messagesHtml = messages.map(msg => {
    const isUser = msg.role === 'user'
    return `
      <div class="message ${isUser ? 'message-user' : 'message-ai'}">
        <div class="message-label">${isUser ? 'You' : 'AI Tutor'}</div>
        <div class="bubble">${formatContent(msg.content)}</div>
      </div>`
  }).join('')

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${subject} — AI Tutor Notes</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #fff;
      color: #111827;
      padding: 40px;
      max-width: 740px;
      margin: 0 auto;
      font-size: 13px;
      line-height: 1.6;
    }

    .header {
      border-bottom: 2px solid #111827;
      padding-bottom: 20px;
      margin-bottom: 32px;
    }
    .header-top {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
    }
    .ai-badge {
      background: #7C3AED;
      color: #fff;
      font-size: 10px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 4px;
      letter-spacing: 0.05em;
    }
    .brand {
      font-size: 11px;
      font-weight: 600;
      color: #9CA3AF;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    h1 {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin-bottom: 6px;
    }
    .meta {
      font-size: 12px;
      color: #6B7280;
    }
    .meta span { margin-right: 16px; }

    .messages { display: flex; flex-direction: column; gap: 16px; }

    .message {}
    .message-label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #9CA3AF;
      margin-bottom: 5px;
    }
    .message-user .message-label { color: #374151; }

    .bubble {
      padding: 12px 16px;
      border-radius: 10px;
      font-size: 13px;
      line-height: 1.65;
    }
    .message-ai .bubble {
      background: #F9FAFB;
      border: 1px solid #E5E7EB;
      border-left: 3px solid #7C3AED;
    }
    .message-user .bubble {
      background: #F3F4F6;
      border: 1px solid #E5E7EB;
    }

    strong { font-weight: 700; color: #111827; }
    code {
      background: #F3F4F6;
      border: 1px solid #E5E7EB;
      padding: 1px 5px;
      border-radius: 4px;
      font-family: 'SF Mono', 'Fira Code', monospace;
      font-size: 12px;
    }

    .footer {
      margin-top: 40px;
      padding-top: 16px;
      border-top: 1px solid #E5E7EB;
      font-size: 11px;
      color: #9CA3AF;
      display: flex;
      justify-content: space-between;
    }

    @media print {
      body { padding: 24px; }
      .message { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-top">
      <span class="ai-badge">AI</span>
      <span class="brand">IB Study Together</span>
    </div>
    <h1>${escapeHtml(subject)} — Study Notes</h1>
    <div class="meta">
      <span>${date}</span>
      <span>${userCount} question${userCount !== 1 ? 's' : ''}</span>
      <span>${aiCount} response${aiCount !== 1 ? 's' : ''}</span>
    </div>
  </div>

  <div class="messages">
    ${messagesHtml}
  </div>

  <div class="footer">
    <span>IB Study Together · AI Tutor Session</span>
    <span>${subject} · ${date}</span>
  </div>

  <script>
    window.onload = function() { window.print(); }
  </script>
</body>
</html>`

  const win = window.open('', '_blank')
  win.document.write(html)
  win.document.close()
}
