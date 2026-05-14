import styles from './IBResources.module.css'

const SAMPLE_PAPERS_URL =
  'https://www.ibo.org/programmes/diploma-programme/assessment-and-exams/sample-exam-papers/'

const BASE = 'https://www.ibo.org/programmes/diploma-programme/curriculum/'

// Maps every subjectId in STUDY_ROOMS to the corresponding ibo.org subject-guide page.
const GUIDE_URLS = {
  // Group 1 — Language A Literature
  english_a_lit_hl:      BASE + 'language-and-literature/studies-in-language-and-literature/',
  english_a_lit_sl:      BASE + 'language-and-literature/studies-in-language-and-literature/',
  french_a_lit_hl:       BASE + 'language-and-literature/studies-in-language-and-literature/',
  french_a_lit_sl:       BASE + 'language-and-literature/studies-in-language-and-literature/',

  // Group 1 — Language A Language & Literature
  english_a_lang_lit_hl: BASE + 'language-and-literature/language-a-language-and-literature/',
  english_a_lang_lit_sl: BASE + 'language-and-literature/language-a-language-and-literature/',
  french_a_lang_lit_hl:  BASE + 'language-and-literature/language-a-language-and-literature/',
  french_a_lang_lit_sl:  BASE + 'language-and-literature/language-a-language-and-literature/',
  spanish_a_lang_lit_hl: BASE + 'language-and-literature/language-a-language-and-literature/',
  spanish_a_lang_lit_sl: BASE + 'language-and-literature/language-a-language-and-literature/',

  // Group 2 — Language B
  spanish_b_hl: BASE + 'language-acquisition/language-b/',
  spanish_b_sl: BASE + 'language-acquisition/language-b/',

  // Group 3 — Individuals & Societies
  economics_hl:       BASE + 'individuals-and-societies/economics/',
  economics_sl:       BASE + 'individuals-and-societies/economics/',
  geography_hl:       BASE + 'individuals-and-societies/geography/',
  geography_sl:       BASE + 'individuals-and-societies/geography/',
  global_politics_hl: BASE + 'individuals-and-societies/global-politics/',
  global_politics_sl: BASE + 'individuals-and-societies/global-politics/',
  history_hl:         BASE + 'individuals-and-societies/history/',
  history_sl:         BASE + 'individuals-and-societies/history/',

  // Group 4 — Sciences
  biology_hl:   BASE + 'sciences/biology/',
  biology_sl:   BASE + 'sciences/biology/',
  chemistry_hl: BASE + 'sciences/chemistry/',
  chemistry_sl: BASE + 'sciences/chemistry/',
  physics_hl:   BASE + 'sciences/physics/',
  physics_sl:   BASE + 'sciences/physics/',
  ess_hl:       BASE + 'sciences/environmental-systems-and-societies/',
  ess_sl:       BASE + 'sciences/environmental-systems-and-societies/',

  // Group 5 — Mathematics
  math_aa_hl: BASE + 'mathematics/mathematics-analysis-and-approaches/',
  math_aa_sl: BASE + 'mathematics/mathematics-analysis-and-approaches/',
  math_ai_sl: BASE + 'mathematics/mathematics-applications-and-interpretation/',

  // Group 6 — Computer Science
  computer_science_hl: BASE + 'sciences/computer-science/',
  computer_science_sl: BASE + 'sciences/computer-science/',

  // Core
  extended_essay: BASE + 'extended-essay/',
  tok:            BASE + 'theory-of-knowledge/',
  cas:            BASE + 'creativity-activity-service/',
}

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

export default function IBResources({ subjectId, subject }) {
  const guideUrl = GUIDE_URLS[subjectId] || null

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
        {guideUrl && (
          <ResourceCard
            icon="📘"
            title="Subject Guide"
            description={`Official IB curriculum guide for ${subject} — syllabus, assessment details and command terms`}
            url={guideUrl}
          />
        )}
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
