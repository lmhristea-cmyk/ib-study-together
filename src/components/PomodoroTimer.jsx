import { useState, useEffect, useRef, useCallback } from 'react'
import styles from './PomodoroTimer.module.css'

const PHASES = [
  { label: 'Focus', duration: 25 * 60, color: '#8B5CF6' },
  { label: 'Short Break', duration: 5 * 60, color: '#10B981' },
  { label: 'Long Break', duration: 15 * 60, color: '#7C3AED' },
]

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export default function PomodoroTimer({ roomId, soundPlaying, soundMuted, onToggleSound, onToggleMute }) {
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(PHASES[0].duration)
  const [running, setRunning] = useState(false)
  const [completedPomodoros, setCompletedPomodoros] = useState(0)
  const intervalRef = useRef(null)
  const phase = PHASES[phaseIndex]

  const advance = useCallback(() => {
    setRunning(false)
    if (phaseIndex === 0) {
      setCompletedPomodoros(p => p + 1)
      const next = completedPomodoros > 0 && (completedPomodoros + 1) % 4 === 0 ? 2 : 1
      setPhaseIndex(next)
      setTimeLeft(PHASES[next].duration)
    } else {
      setPhaseIndex(0)
      setTimeLeft(PHASES[0].duration)
    }
  }, [phaseIndex, completedPomodoros])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { advance(); return 0 }
          return t - 1
        })
      }, 1000)
    }
    return () => clearInterval(intervalRef.current)
  }, [running, advance])

  const switchPhase = (i) => {
    clearInterval(intervalRef.current)
    setRunning(false)
    setPhaseIndex(i)
    setTimeLeft(PHASES[i].duration)
  }

  const reset = () => {
    clearInterval(intervalRef.current)
    setRunning(false)
    setTimeLeft(phase.duration)
  }

  const total = phase.duration
  const progress = (total - timeLeft) / total
  const radius = 26
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - progress)

  return (
    <div className={styles.wrap}>
      <div className={styles.tabs}>
        {PHASES.map((p, i) => (
          <button
            key={i}
            className={`${styles.tab} ${i === phaseIndex ? styles.tabActive : ''}`}
            style={i === phaseIndex ? { color: p.color, borderColor: p.color + '66', background: p.color + '18' } : {}}
            onClick={() => switchPhase(i)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className={styles.ring}>
        <svg width="64" height="64" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r={radius} fill="none" stroke="var(--border)" strokeWidth="3" />
          <circle
            cx="32" cy="32" r={radius} fill="none"
            stroke={phase.color} strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 32 32)"
            style={{ transition: 'stroke-dashoffset 0.5s linear', filter: `drop-shadow(0 0 3px ${phase.color}88)` }}
          />
        </svg>
        <div className={styles.timeDisplay}>
          <span className={styles.time} style={{ color: phase.color }}>{formatTime(timeLeft)}</span>
          <span className={styles.phaseLabel}>{phase.label}</span>
        </div>
      </div>

      <div className={styles.controls}>
        <button className={styles.ctrlBtn} onClick={reset} title="Reset">↺</button>
        <button
          className={`${styles.ctrlMain} ${running ? styles.ctrlPause : styles.ctrlStart}`}
          onClick={() => setRunning(r => !r)}
        >
          {running ? 'Pause' : 'Start'}
        </button>
        <button className={styles.ctrlBtn} onClick={advance} title="Skip">⏭</button>
      </div>

      <div className={styles.footer}>
        {onToggleSound && (
          <button
            className={`${styles.ctrlBtn} ${styles.ctrlSound} ${soundPlaying ? styles.ctrlSoundOn : ''}`}
            onClick={onToggleSound}
            title={soundPlaying ? 'Stop ambient sound' : 'Play ambient sound'}
          >
            {soundPlaying && !soundMuted ? '🔔' : soundPlaying && soundMuted ? '🔇' : '🔕'}
          </button>
        )}
        {onToggleSound && soundPlaying && (
          <button className={`${styles.ctrlBtn} ${styles.ctrlSound}`} onClick={onToggleMute} title={soundMuted ? 'Unmute' : 'Mute'}>
            {soundMuted ? 'unmute' : 'mute'}
          </button>
        )}
        <div className={styles.pomodoros}>
          {Array.from({ length: Math.max(4, completedPomodoros + 1) }).map((_, i) => (
            <span key={i} className={`${styles.tomato} ${i < completedPomodoros ? styles.tomatoDone : ''}`}>🍅</span>
          ))}
        </div>
        <span className={styles.syncBadge}>
          <span className={styles.syncDot} />
          <span className={styles.syncText}>Synced</span>
        </span>
      </div>
    </div>
  )
}
