import { useState } from 'react'
import { STUDY_ROOMS } from '../data/subjects'
import styles from './Rooms.module.css'

const SUBJECT_FILTERS = ['All', 'Languages', 'Humanities', 'Sciences', 'Maths', 'Computer Science', 'Core']

const SUBJECT_FILTER_MAP = {
  Languages: [
    'english_a_lit_hl', 'english_a_lit_sl', 'english_a_lang_lit_hl', 'english_a_lang_lit_sl',
    'french_a_lit_hl', 'french_a_lit_sl', 'french_a_lang_lit_hl', 'french_a_lang_lit_sl',
    'spanish_a_lang_lit_hl', 'spanish_a_lang_lit_sl', 'spanish_b_hl', 'spanish_b_sl',
  ],
  Humanities: [
    'economics_hl', 'economics_sl', 'geography_hl', 'geography_sl',
    'global_politics_hl', 'global_politics_sl', 'history_hl', 'history_sl',
  ],
  Sciences: ['biology_hl', 'biology_sl', 'chemistry_hl', 'chemistry_sl', 'physics_hl', 'physics_sl', 'ess_hl', 'ess_sl'],
  Maths: ['math_aa_hl', 'math_aa_sl', 'math_ai_sl'],
  'Computer Science': ['computer_science_hl', 'computer_science_sl'],
  'Core': ['extended_essay', 'tok', 'cas'],
}

const SVG_BOOK = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
)
const SVG_FLASK = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 3h6"/><path d="M10 3v6l-4 9a1 1 0 0 0 .9 1.5h10.2a1 1 0 0 0 .9-1.5L14 9V3"/>
  </svg>
)
const SVG_GRAPH = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
)
const SVG_GLOBE = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
)
const SVG_LAPTOP = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
)
const SVG_CHART = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>
    <line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
)

function getSubjectIcon(id) {
  if (id.startsWith('math_aa') || id.startsWith('math_ai'))  return SVG_GRAPH
  if (id.startsWith('physics') || id.startsWith('chemistry') || id.startsWith('biology') || id.startsWith('ess')) return SVG_FLASK
  if (id.startsWith('english_a') || id.startsWith('french_a') || id.startsWith('spanish_a') || id.startsWith('spanish_b')) return SVG_BOOK
  if (id.startsWith('economics'))                            return SVG_CHART
  if (id.startsWith('geography') || id.startsWith('global_politics') || id.startsWith('history')) return SVG_GLOBE
  if (id.startsWith('computer_science'))                     return SVG_LAPTOP
  return SVG_BOOK
}

export default function Rooms({ navigate }) {
  const [subjectFilter, setSubjectFilter] = useState('All')
  const [levelFilter, setLevelFilter] = useState('All')
  const [search, setSearch] = useState('')

  const filtered = STUDY_ROOMS.filter(room => {
    const matchesSubject = subjectFilter === 'All' || (SUBJECT_FILTER_MAP[subjectFilter] || []).includes(room.subjectId)
    const matchesLevel = levelFilter === 'All' || room.level === levelFilter
    const matchesSearch = !search || room.subject.toLowerCase().includes(search.toLowerCase())
    return matchesSubject && matchesLevel && matchesSearch
  })

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Study Rooms</h1>
          <p className={styles.sub}>Join a subject-specific room and study with peers worldwide</p>
        </div>
        <input
          className={styles.search}
          placeholder="Search subjects..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className={styles.filterRows}>
        <div className={styles.filterRow}>
          <span className={styles.filterLabel}>Subject</span>
          <div className={styles.filters}>
            {SUBJECT_FILTERS.map(f => (
              <button
                key={f}
                className={`${styles.filter} ${f === subjectFilter ? styles.filterActive : ''}`}
                onClick={() => setSubjectFilter(f)}
              >{f}</button>
            ))}
          </div>
        </div>
        <div className={styles.filterRow}>
          <span className={styles.filterLabel}>Level</span>
          <div className={styles.filters}>
            {['All', 'HL', 'SL'].map(l => (
              <button
                key={l}
                className={`${styles.filter} ${l === levelFilter ? (l === 'HL' ? styles.filterHL : l === 'SL' ? styles.filterSL : styles.filterActive) : ''}`}
                onClick={() => setLevelFilter(l)}
              >{l}</button>
            ))}
          </div>
          {levelFilter !== 'All' && (
            <span className={styles.filterCount}>{filtered.length} rooms</span>
          )}
        </div>
      </div>

      {(() => {
        const CORE_IDS = ['extended_essay', 'tok', 'cas']
        const subjectRooms = filtered.filter(r => !CORE_IDS.includes(r.id))
        const coreRooms = filtered.filter(r => CORE_IDS.includes(r.id))
        return (
          <>
            {subjectRooms.length > 0 && (
              <div className={styles.grid}>
                {subjectRooms.map(room => (
                  <RoomCard key={room.id} room={room} navigate={navigate} icon={getSubjectIcon(room.subjectId)} />
                ))}
              </div>
            )}
            {coreRooms.length > 0 && (
              <>
                <div className={styles.sectionDivider}>
                  <span className={styles.sectionDividerLabel}>Core Components</span>
                </div>
                <div className={styles.grid}>
                  {coreRooms.map(room => (
                    <RoomCard key={room.id} room={room} navigate={navigate} icon={getSubjectIcon(room.subjectId)} />
                  ))}
                </div>
              </>
            )}
          </>
        )
      })()}

      {filtered.length === 0 && (
        <div className={styles.empty}>
          <p>No rooms match your filters</p>
          <button className={styles.clearBtn} onClick={() => { setSubjectFilter('All'); setLevelFilter('All'); setSearch('') }}>
            Clear filters
          </button>
        </div>
      )}
    </div>
  )
}

function RoomCard({ room, navigate, icon }) {
  const handleJoin = (e) => {
    e.stopPropagation()
    navigate('room', room)
  }

  return (
    <div className={styles.card} onClick={() => navigate('room', room)}>
      <div className={styles.cardHeader}>
        <span className={styles.subjectIcon}>{icon}</span>
        <div className={styles.cardHeaderRight}>
          {!['extended_essay', 'tok', 'cas'].includes(room.id) && (
            <span className={`${styles.levelBadge} ${room.level === 'HL' ? styles.levelHL : styles.levelSL}`}>
              {room.level}
            </span>
          )}
        </div>
      </div>

      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{room.subject}</h3>
        <p className={styles.cardDesc}>{room.description}</p>
      </div>

      <div className={styles.cardFooter}>
        <button className={styles.joinBtn} onClick={handleJoin}>
          Join Now
        </button>
      </div>
    </div>
  )
}
