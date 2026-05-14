import styles from './Resources.module.css'

const SAMPLE_PAPERS_URL =
  'https://www.ibo.org/programmes/diploma-programme/assessment-and-exams/sample-exam-papers/'

function ExternalLinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
      <polyline points="15 3 21 3 21 9"/>
      <line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  )
}

export default function Resources() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>IB Resources</h1>
        <p className={styles.subtitle}>Official links from the International Baccalaureate</p>
      </div>

      <div className={styles.cards}>
        <a
          href={SAMPLE_PAPERS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.card}
        >
          <span className={styles.cardIcon}>📄</span>
          <div className={styles.cardBody}>
            <span className={styles.cardTitle}>Sample Exam Papers</span>
            <span className={styles.cardNote}>Official International Baccalaureate sample papers and mark schemes.</span>
          </div>
          <span className={styles.cardArrow}><ExternalLinkIcon /></span>
        </a>
      </div>
    </div>
  )
}
