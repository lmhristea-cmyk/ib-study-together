import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import styles from './Home.module.css'

const FEATURES = [
  { icon: '📚', title: 'Virtual Study Rooms', desc: 'Subject-specific rooms with a 10-person cap and lobby queue system. See who\'s studying right now.' },
  { icon: '🎵', title: 'Focus Music', desc: 'Play ambient Tibetan bowl sounds to stay calm and focused during your study session.' },
  { icon: '⏱️', title: 'Synced Pomodoro Timer', desc: 'Stay in sync with your room. Everyone works and breaks together.' },
  { icon: '🤖', title: 'AI Tutor (Powered by Claude)', desc: 'Ask any IB question and get expert, curriculum-aligned answers instantly.' },
  { icon: '📖', title: 'Free IB Ebooks', desc: 'Download free study ebooks for IB subjects. Curriculum-aligned, exam-focused, and written for students.' },
]

export default function Home({ navigate }) {
  const [onlineCount, setOnlineCount] = useState(null)

  useEffect(() => {
    const ch = supabase.channel('global-online')
      .on('presence', { event: 'sync' }, () => {
        setOnlineCount(Object.keys(ch.presenceState()).length)
      })
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [])

  const thirdStat = onlineCount > 0
    ? { value: String(onlineCount), label: 'Students Online Now', live: true }
    : { value: '24/7', label: 'Always Online', live: false }

  const STATS = [
    { value: '36', label: 'Study Rooms' },
    { value: '20', label: 'IB Subjects' },
    thirdStat,
  ]

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroContent}>
          <div className={styles.heroPill}>Powered by Claude AI</div>
          <h1 className={styles.heroTitle}>
            Your IB study space,<br />
            <span className={styles.heroAccent}>all in one place.</span>
          </h1>
          <p className={styles.heroSub}>
            The ultimate IB study platform. Join subject-specific study rooms, collaborate with IB students worldwide,
            and get AI-powered tutoring — all in one place.
          </p>
          <div className={styles.heroCtas}>
            <button className={styles.btnPrimary} onClick={() => navigate('rooms')}>
              Start Studying Now
            </button>
          </div>
        </div>

        {/* App screenshot mockup */}
        <div className={styles.mockupWrap}>
          <div className={styles.mockupChrome}>
            <div className={styles.mockupDots}>
              <span className={styles.mockupDot} style={{ background: '#FF5F57' }} />
              <span className={styles.mockupDot} style={{ background: '#FFBD2E' }} />
              <span className={styles.mockupDot} style={{ background: '#28CA41' }} />
            </div>
            <div className={styles.mockupUrlBar}>ibstudytogether.com/room</div>
          </div>
          <img src="/app-screenshot.svg" alt="IB Study Together study room" className={styles.mockupImg} />
        </div>
      </section>

      {/* Sustainability */}
      <section className={styles.sustain}>
        <span className={styles.sustainLeaf}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
          </svg>
        </span>
        <div className={styles.sustainText}>
          <p>Every AI question has a cost. It takes energy to generate every answer, and at scale, that energy adds up fast. At IB Study Together, we believe <strong>knowledge shared is energy saved.</strong> So instead of asking the same questions again and again, we help you reuse knowledge. Save answers. Share notes. Learn from each other. <strong>Study smarter. Not harder. Not wasteful.</strong></p>
        </div>
      </section>

      {/* Stats */}
      <section className={styles.stats}>
        {STATS.map((s, i) => (
          <div key={i} className={styles.stat}>
            <span className={styles.statValue}>
              {s.live && <span className={styles.liveDot} />}
              {s.value}
            </span>
            <span className={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </section>

      {/* Features */}
      <section className={styles.features}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Everything you need to ace the IB</h2>
          <p className={styles.sectionSub}>Built by IB students, for IB students</p>
        </div>
        <div className={styles.featureGrid}>
          {FEATURES.map((f, i) => (
            <div key={i} className={styles.featureCard}>
              <span className={styles.featureIcon}>{f.icon}</span>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className={styles.how}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Get started in 3 steps</h2>
        </div>
        <div className={styles.steps}>
          {[
            { n: '01', title: 'Enter your subjects', desc: 'Tell us which IB subjects you\'re taking.' },
            { n: '02', title: 'Join a study room', desc: 'Browse subject-specific rooms and join one that matches what you\'re studying today.' },
            { n: '03', title: 'Study together', desc: 'Join a room, start the Pomodoro timer, and ask the AI tutor anything.' },
          ].map((s, i) => (
            <div key={i} className={styles.step}>
              <span className={styles.stepNum}>{s.n}</span>
              <h3 className={styles.stepTitle}>{s.title}</h3>
              <p className={styles.stepDesc}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <div className={styles.ctaCard}>
          <h2 className={styles.ctaTitle}>Ready to study smarter?</h2>
          <p className={styles.ctaSub}>Join IB students already using IB Study Together</p>
          <button className={styles.btnPrimary} onClick={() => navigate('rooms')}>
            Browse Study Rooms
          </button>
        </div>
      </section>
    </div>
  )
}
