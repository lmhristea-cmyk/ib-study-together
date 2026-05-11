import { useState, useEffect } from 'react'
import styles from './LobbyScreen.module.css'

export default function LobbyScreen({ room, navigate }) {
  const [phase, setPhase] = useState('waiting') // 'waiting' | 'notified' | 'declined'
  const [dots, setDots] = useState(0)

  // Animate waiting dots
  useEffect(() => {
    const t = setInterval(() => setDots(d => (d + 1) % 4), 500)
    return () => clearInterval(t)
  }, [])

  // After 3s, simulate notification being sent to room members
  useEffect(() => {
    if (phase !== 'waiting') return
    const t = setTimeout(() => setPhase('notified'), 3000)
    return () => clearTimeout(t)
  }, [phase])

  const handleAccept = () => navigate('room', room)
  const handleDecline = () => setPhase('declined')
  const handleLeave = () => navigate('rooms')

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* Room info pill */}
        <div className={styles.roomPill}>
          <span className={styles.roomDot} style={{ background: room.color }} />
          {room.subject}
        </div>

        {phase === 'waiting' && (
          <div className={styles.card}>
            <div className={styles.pulseRing}>
              <div className={styles.pulseCore} />
            </div>
            <h2 className={styles.title}>Waiting to join{'.'.repeat(dots)}</h2>
            <p className={styles.sub}>This room is currently full. You've been added to the queue.</p>

            <div className={styles.queueBadge}>
              <span className={styles.queueNum}>#1</span>
              <span className={styles.queueLabel}>You are first in the queue</span>
            </div>

            <div className={styles.statusRow}>
              <span className={styles.statusDot} />
              <span className={styles.statusText}>Notifying room members…</span>
            </div>

            <button className={styles.leaveBtn} onClick={handleLeave}>
              Leave queue
            </button>
          </div>
        )}

        {phase === 'notified' && (
          <div className={styles.card}>
            <div className={styles.notifiedIcon}>🔔</div>
            <h2 className={styles.title}>Request sent</h2>
            <p className={styles.sub}>Room members have been notified. Waiting for someone to accept.</p>

            <div className={styles.queueBadge}>
              <span className={styles.queueNum}>#1</span>
              <span className={styles.queueLabel}>You are first in the queue</span>
            </div>

            {/* Simulated notification card — what room members see */}
            <div className={styles.notifCard}>
              <div className={styles.notifHeader}>
                <span className={styles.notifLabel}>Room member notification</span>
                <span className={styles.notifSub}>Visible to all members in {room.subject}</span>
              </div>
              <div className={styles.notifBody}>
                <span className={styles.notifAvatar}>Y</span>
                <div className={styles.notifText}>
                  <strong>You</strong> want to join this room.
                </div>
              </div>
              <div className={styles.notifActions}>
                <button className={styles.acceptBtn} onClick={handleAccept}>
                  ✓ Accept
                </button>
                <button className={styles.declineBtn} onClick={handleDecline}>
                  ✕ Decline
                </button>
              </div>
            </div>

            <button className={styles.leaveBtn} onClick={handleLeave}>
              Leave queue
            </button>
          </div>
        )}

        {phase === 'declined' && (
          <div className={styles.card}>
            <div className={styles.declinedIcon}>✕</div>
            <h2 className={styles.title}>Request declined</h2>
            <p className={styles.sub}>A room member declined your request to join {room.subject}.</p>
            <div className={styles.declinedActions}>
              <button className={styles.primaryBtn} onClick={() => navigate('rooms')}>
                ← Back to rooms
              </button>
              <button className={styles.retryBtn} onClick={() => setPhase('waiting')}>
                Try again
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
