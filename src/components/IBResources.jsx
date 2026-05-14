import styles from './IBResources.module.css'

const SAMPLE_PAPERS_URL =
  'https://www.ibo.org/programmes/diploma-programme/assessment-and-exams/sample-exam-papers/'

function ExternalLinkIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
      <polyline points="15 3 21 3 21 9"/>
      <line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  )
}

function ResourceCard({ icon, title, description, url }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={styles.card}>
      <span className={styles.cardIcon}>{icon}</span>
      <div className={styles.cardBody}>
        <span className={styles.cardTitle}>{title}</span>
        <span className={styles.cardDesc}>{description}</span>
      </div>
      <span className={styles.cardArrow}><ExternalLinkIcon /></span>
    </a>
  )
}

export default function IBResources({ subject }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h2 className={styles.title}>Official IB Resources</h2>
        <p className={styles.subtitle}>{subject}</p>
      </div>

      <div className={styles.list}>
        <ResourceCard
          icon="📄"
          title="Sample Exam Papers"
          description="Past papers and markschemes from the IB — use these to practise under exam conditions"
          url={SAMPLE_PAPERS_URL}
        />
      </div>

      <div className={styles.note}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        All resources are from the official International Baccalaureate website (ibo.org). Links open in a new tab.
      </div>
    </div>
  )
}
