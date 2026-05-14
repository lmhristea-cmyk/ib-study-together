import { useState, useEffect } from 'react'
import styles from './IBTools.module.css'

// ── Exam Countdown ────────────────────────────────────────────────────────────

const SESSIONS = [
  { label: 'May 2026',      date: '2026-04-24', note: 'Session start' },
  { label: 'November 2026', date: '2026-10-23', note: 'Session start' },
  { label: 'May 2027',      date: '2027-05-03', note: 'Session start' },
]

function useNow() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

function pad(n) { return String(n).padStart(2, '0') }

function CountdownCard({ label, date, note, now }) {
  const target = new Date(date)
  const diff   = target - now
  const passed = diff <= 0

  const days    = Math.floor(diff / 86400000)
  const hours   = Math.floor((diff % 86400000) / 3600000)
  const minutes = Math.floor((diff % 3600000)  / 60000)
  const seconds = Math.floor((diff % 60000)    / 1000)

  const formatted = target.toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div className={`${styles.countCard} ${passed ? styles.countCardDone : ''}`}>
      <div className={styles.countSession}>{label}</div>

      {passed ? (
        <div className={styles.countDone}>Session Complete ✓</div>
      ) : (
        <div className={styles.countNumbers}>
          <div className={styles.countUnit}>
            <span className={styles.countVal}>{pad(days)}</span>
            <span className={styles.countLbl}>days</span>
          </div>
          <span className={styles.countColon}>:</span>
          <div className={styles.countUnit}>
            <span className={styles.countVal}>{pad(hours)}</span>
            <span className={styles.countLbl}>hrs</span>
          </div>
          <span className={styles.countColon}>:</span>
          <div className={styles.countUnit}>
            <span className={styles.countVal}>{pad(minutes)}</span>
            <span className={styles.countLbl}>min</span>
          </div>
          <span className={styles.countColon}>:</span>
          <div className={styles.countUnit}>
            <span className={styles.countVal}>{pad(seconds)}</span>
            <span className={styles.countLbl}>sec</span>
          </div>
        </div>
      )}

      <div className={styles.countDate}>{note} · {formatted}</div>
    </div>
  )
}

function ExamCountdown() {
  const now = useNow()
  return (
    <div className={styles.countGrid}>
      {SESSIONS.map(s => <CountdownCard key={s.label} {...s} now={now} />)}
    </div>
  )
}

// ── IB Grade Calculator ───────────────────────────────────────────────────────

let _uid = 0
const newSubject = () => ({ id: ++_uid, name: '', grade: '' })

function Check({ pass, warn, label }) {
  const cls  = pass ? styles.checkPass : warn ? styles.checkWarn : styles.checkFail
  const icon = pass ? '✓' : warn ? '!' : '✗'
  return (
    <div className={`${styles.check} ${cls}`}>
      <span className={styles.checkIcon}>{icon}</span>
      {label}
    </div>
  )
}

function GradeCalculator() {
  const [subjects, setSubjects] = useState(() => [newSubject(), newSubject(), newSubject()])
  const [bonus, setBonus] = useState('0')

  const addSubject    = () => { if (subjects.length < 6) setSubjects(p => [...p, newSubject()]) }
  const removeSubject = (id) => setSubjects(p => p.filter(s => s.id !== id))
  const update        = (id, field, val) =>
    setSubjects(p => p.map(s => s.id === id ? { ...s, [field]: val } : s))

  const grades       = subjects.map(s => Number(s.grade)).filter(Boolean)
  const hasGrades    = grades.length > 0
  const subjectSum   = grades.reduce((a, b) => a + b, 0)
  const bonusNum     = Number(bonus)
  const total        = subjectSum + bonusNum

  const meetsTotal  = total >= 24
  const noLowGrades = subjects.every(s => !s.grade || Number(s.grade) >= 2)
  const bonusPass   = bonusNum >= 1
  const bonusWarn   = bonusNum === 0

  const eligible = hasGrades && meetsTotal && noLowGrades && bonusPass

  const verdictCls = eligible
    ? styles.verdictPass
    : (hasGrades && meetsTotal && noLowGrades && bonusWarn)
      ? styles.verdictWarn
      : styles.verdictFail

  const verdictText = eligible
    ? '🎓 Predicted Diploma'
    : (hasGrades && meetsTotal && noLowGrades && bonusWarn)
      ? '⚠️ Verify TOK & EE Grades'
      : '✗ Diploma Conditions Not Met'

  return (
    <div className={styles.calc}>
      <div className={styles.calcSubjects}>
        {subjects.map((s, i) => (
          <div key={s.id} className={styles.subjectRow}>
            <span className={styles.subjectNum}>{i + 1}</span>
            <input
              className={styles.subjectName}
              placeholder="Subject name (optional)"
              value={s.name}
              onChange={e => update(s.id, 'name', e.target.value)}
            />
            <select
              className={styles.gradeSelect}
              value={s.grade}
              onChange={e => update(s.id, 'grade', e.target.value)}
            >
              <option value="">—</option>
              {[1, 2, 3, 4, 5, 6, 7].map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            {subjects.length > 1 && (
              <button
                className={styles.removeBtn}
                onClick={() => removeSubject(s.id)}
                title="Remove subject"
              >×</button>
            )}
          </div>
        ))}
      </div>

      {subjects.length < 6 && (
        <button className={styles.addBtn} onClick={addSubject}>+ Add subject</button>
      )}

      <div className={styles.bonusRow}>
        <div>
          <div className={styles.bonusLabel}>TOK + EE combined bonus</div>
          <div className={styles.bonusHint}>0–3 points awarded by the IB</div>
        </div>
        <select
          className={styles.gradeSelect}
          value={bonus}
          onChange={e => setBonus(e.target.value)}
        >
          {[0, 1, 2, 3].map(b => (
            <option key={b} value={b}>{b} pt{b !== 1 ? 's' : ''}</option>
          ))}
        </select>
      </div>

      <div className={styles.result}>
        <div className={styles.scoreRow}>
          <span className={styles.scoreLabel}>Total IB Score</span>
          <span className={styles.scoreVal}>
            {hasGrades ? total : '—'}
            <span className={styles.scoreMax}> / 45</span>
          </span>
        </div>

        {hasGrades && (
          <>
            <div className={styles.checks}>
              <Check pass={meetsTotal}  label="Total ≥ 24 points" />
              <Check pass={noLowGrades} label="No subject grade below 2" />
              <Check pass={bonusPass} warn={bonusWarn} label="TOK + EE bonus ≥ 1 point" />
            </div>

            <div className={`${styles.verdict} ${verdictCls}`}>{verdictText}</div>

            {bonusWarn && (
              <p className={styles.bonusNote}>
                A bonus of 0 may include failing TOK/EE combinations (e.g. grade E in either).
                Confirm your individual TOK and EE grades with your coordinator.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function IBTools() {
  return (
    <div className={styles.page}>
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Exam Countdown</h2>
          <p className={styles.sectionSub}>IB Diploma Programme exam session start dates</p>
        </div>
        <ExamCountdown />
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>IB Grade Calculator</h2>
          <p className={styles.sectionSub}>Estimate your total score and check diploma eligibility</p>
        </div>
        <GradeCalculator />
      </section>
    </div>
  )
}
