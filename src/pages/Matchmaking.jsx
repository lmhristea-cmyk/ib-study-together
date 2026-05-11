import { useState } from 'react'
import { IB_SUBJECTS } from '../data/subjects'
import { MATCH_POOL, calculateMatchScore } from '../data/mockUsers'
import SubjectBadge from '../components/SubjectBadge'
import styles from './Matchmaking.module.css'

const TIMEZONES = ['GMT-8', 'GMT-7', 'GMT-6', 'GMT-5', 'GMT-4', 'GMT-3', 'GMT+0', 'GMT+1', 'GMT+2', 'GMT+3', 'GMT+4', 'GMT+5:30', 'GMT+8', 'GMT+9', 'GMT+10']

export default function Matchmaking({ navigate }) {
  const [step, setStep] = useState(1)
  const [profile, setProfile] = useState({
    subjects: [],
    timezone: 'GMT+0',
    weeklyHours: 8,
  })
  const [matches, setMatches] = useState([])

  const toggle = (field, value) => {
    setProfile(p => ({
      ...p,
      [field]: p[field].includes(value)
        ? p[field].filter(x => x !== value)
        : [...p[field], value],
    }))
  }

  const computeMatches = () => {
    const scored = MATCH_POOL.map(c => calculateMatchScore(profile, c))
    scored.sort((a, b) => b.score - a.score)
    setMatches(scored)
    setStep(2)
  }

  const canSubmit = profile.subjects.length > 0

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* Step 1: Preferences */}
        {step === 1 && (
          <div className={`${styles.card} fade-in`}>
            <h2 className={styles.stepTitle}>Study Preferences</h2>
            <p className={styles.stepSub}>Tell us what you're studying and when you're available</p>

            <div className={styles.field}>
              <label className="label">Subjects <span className={styles.hint}>(select all that apply)</span></label>
              <div className="tag-grid">
                {IB_SUBJECTS.map(s => (
                  <span
                    key={s.id}
                    className={`tag ${profile.subjects.includes(s.id) ? 'selected' : ''}`}
                    onClick={() => toggle('subjects', s.id)}
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </div>

            <div className={styles.field}>
              <label className="label">Timezone</label>
              <select
                className="input"
                value={profile.timezone}
                onChange={e => setProfile(p => ({ ...p, timezone: e.target.value }))}
              >
                {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
              </select>
            </div>

            <div className={styles.field}>
              <label className="label">Hours / week available</label>
              <div className={styles.sliderWrap}>
                <input
                  type="range" min={1} max={20} value={profile.weeklyHours}
                  onChange={e => setProfile(p => ({ ...p, weeklyHours: +e.target.value }))}
                  className={styles.slider}
                />
                <span className={styles.sliderVal}>{profile.weeklyHours}h</span>
              </div>
            </div>

            <button
              className={styles.primaryBtn}
              disabled={!canSubmit}
              onClick={computeMatches}
            >
              Find My Matches
            </button>
          </div>
        )}

        {/* Step 2: Results */}
        {step === 2 && (
          <div className="fade-in">
            <div className={styles.resultsHeader}>
              <div>
                <h2 className={styles.stepTitle}>Your matches</h2>
                <p className={styles.stepSub}>Sorted by compatibility based on your subjects and availability</p>
              </div>
              <button className={styles.startOver} onClick={() => setStep(1)}>← Edit preferences</button>
            </div>

            <div className={styles.matchGrid}>
              {matches.map((match, i) => (
                <MatchCard key={match.id} match={match} rank={i + 1} navigate={navigate} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function MatchCard({ match, rank, navigate }) {
  const pct = Math.min(100, Math.round((match.score / 100) * 100))
  const isTop = rank === 1

  return (
    <div className={`${styles.matchCard} ${isTop ? styles.matchCardTop : ''}`}>
      {isTop && <div className={styles.topBadge}>Best Match</div>}

      <div className={styles.matchTop}>
        <span className={styles.matchAvatar}>{match.name.charAt(0)}</span>
        <div className={styles.matchInfo}>
          <span className={styles.matchName}>{match.name}</span>
          <span className={styles.matchTz}>{match.timezone}</span>
        </div>
        <div className={styles.scoreWrap}>
          <div className={styles.scoreRing} style={{ '--pct': pct, '--color': '#374151' }}>
            <span className={styles.scoreNum}>{pct}%</span>
          </div>
        </div>
      </div>

      <p className={styles.matchBio}>{match.bio}</p>

      <div className={styles.matchSubjects}>
        {match.commonSubjects.map(sid => (
          <SubjectBadge key={sid} subjectId={sid} size="sm" />
        ))}
        {match.subjects.filter(s => !match.commonSubjects.includes(s)).slice(0, 2).map(sid => (
          <span key={sid} className={styles.otherSubject}>
            {IB_SUBJECTS.find(s => s.id === sid)?.name}
          </span>
        ))}
      </div>

      <div className={styles.matchMeta}>
        <span className={styles.metaChip}>{match.studyStyle}</span>
        <span className={styles.metaChip}>{match.weeklyHours}h/week</span>
        {match.commonSubjects.length > 0 && (
          <span className={styles.metaChip}>{match.commonSubjects.length} shared subjects</span>
        )}
      </div>

      <button className={styles.primaryBtn} onClick={() => navigate('rooms')}>
        Study Together
      </button>
    </div>
  )
}
