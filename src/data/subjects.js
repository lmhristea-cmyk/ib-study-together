export const IB_SUBJECTS = [
  // Group 1 — Studies in Language & Literature
  { id: 'english_a_lit_hl',       name: 'English A Literature HL',       group: 1, color: '#F59E0B', emoji: '📚', level: 'HL' },
  { id: 'english_a_lit_sl',       name: 'English A Literature SL',       group: 1, color: '#FBBF24', emoji: '📚', level: 'SL' },
  { id: 'english_a_lang_lit_hl',  name: 'English A Lang & Lit HL',       group: 1, color: '#D97706', emoji: '📖', level: 'HL' },
  { id: 'english_a_lang_lit_sl',  name: 'English A Lang & Lit SL',       group: 1, color: '#F59E0B', emoji: '📖', level: 'SL' },
  { id: 'french_a_lit_hl',        name: 'French A Literature HL',        group: 1, color: '#F43F5E', emoji: '🇫🇷', level: 'HL' },
  { id: 'french_a_lit_sl',        name: 'French A Literature SL',        group: 1, color: '#FB7185', emoji: '🇫🇷', level: 'SL' },
  { id: 'french_a_lang_lit_hl',   name: 'French A Lang & Lit HL',        group: 1, color: '#E11D48', emoji: '🇫🇷', level: 'HL' },
  { id: 'french_a_lang_lit_sl',   name: 'French A Lang & Lit SL',        group: 1, color: '#F43F5E', emoji: '🇫🇷', level: 'SL' },
  { id: 'spanish_a_lang_lit_hl',  name: 'Spanish A Lang & Lit HL',       group: 1, color: '#EF4444', emoji: '🇪🇸', level: 'HL' },
  { id: 'spanish_a_lang_lit_sl',  name: 'Spanish A Lang & Lit SL',       group: 1, color: '#F87171', emoji: '🇪🇸', level: 'SL' },

  // Group 2 — Language Acquisition
  { id: 'spanish_b_hl',           name: 'Spanish B HL',                  group: 2, color: '#DC2626', emoji: '🇪🇸', level: 'HL' },
  { id: 'spanish_b_sl',           name: 'Spanish B SL',                  group: 2, color: '#EF4444', emoji: '🇪🇸', level: 'SL' },

  // Group 3 — Individuals & Societies
  { id: 'economics_hl',           name: 'Economics HL',                  group: 3, color: '#F97316', emoji: '📈', level: 'HL' },
  { id: 'economics_sl',           name: 'Economics SL',                  group: 3, color: '#FB923C', emoji: '📈', level: 'SL' },
  { id: 'geography_hl',           name: 'Geography HL',                  group: 3, color: '#14B8A6', emoji: '🌍', level: 'HL' },
  { id: 'geography_sl',           name: 'Geography SL',                  group: 3, color: '#2DD4BF', emoji: '🌍', level: 'SL' },
  { id: 'global_politics_hl',     name: 'Global Politics HL',            group: 3, color: '#A855F7', emoji: '🌐', level: 'HL' },
  { id: 'global_politics_sl',     name: 'Global Politics SL',            group: 3, color: '#C084FC', emoji: '🌐', level: 'SL' },
  { id: 'history_hl',             name: 'History HL',                    group: 3, color: '#EC4899', emoji: '🏛️', level: 'HL' },
  { id: 'history_sl',             name: 'History SL',                    group: 3, color: '#F472B6', emoji: '🏛️', level: 'SL' },

  // Group 4 — Sciences
  { id: 'biology_hl',             name: 'Biology HL',                    group: 4, color: '#16A34A', emoji: '🧬', level: 'HL' },
  { id: 'biology_sl',             name: 'Biology SL',                    group: 4, color: '#22C55E', emoji: '🧬', level: 'SL' },
  { id: 'chemistry_hl',           name: 'Chemistry HL',                  group: 4, color: '#059669', emoji: '🧪', level: 'HL' },
  { id: 'chemistry_sl',           name: 'Chemistry SL',                  group: 4, color: '#10B981', emoji: '🧪', level: 'SL' },
  { id: 'physics_hl',             name: 'Physics HL',                    group: 4, color: '#7C3AED', emoji: '⚛️', level: 'HL' },
  { id: 'physics_sl',             name: 'Physics SL',                    group: 4, color: '#8B5CF6', emoji: '⚛️', level: 'SL' },
  { id: 'ess_hl',                 name: 'ESS HL',                        group: 4, color: '#059669', emoji: '🌿', level: 'HL' },
  { id: 'ess_sl',                 name: 'ESS SL',                        group: 4, color: '#34D399', emoji: '🌿', level: 'SL' },

  // Group 5 — Mathematics
  { id: 'math_aa_hl',             name: 'Math AA HL',                    group: 5, color: '#8B5CF6', emoji: '∑',  level: 'HL' },
  { id: 'math_aa_sl',             name: 'Math AA SL',                    group: 5, color: '#A78BFA', emoji: '∑',  level: 'SL' },
  { id: 'math_ai_sl',             name: 'Math AI SL',                    group: 5, color: '#7C3AED', emoji: '📊', level: 'SL' },

  // Group 6 — Computer Science
  { id: 'computer_science_hl',    name: 'Computer Science HL',           group: 6, color: '#7C3AED', emoji: '💻', level: 'HL' },
  { id: 'computer_science_sl',    name: 'Computer Science SL',           group: 6, color: '#8B5CF6', emoji: '💻', level: 'SL' },

  // Core — Extended Essay, TOK & CAS
  { id: 'extended_essay',         name: 'Extended Essay',                group: 0, color: '#0EA5E9', emoji: '📝', level: 'HL' },
  { id: 'tok',                    name: 'Theory of Knowledge',           group: 0, color: '#6366F1', emoji: '🧠', level: 'HL' },
  { id: 'cas',                    name: 'CAS',                           group: 0, color: '#10B981', emoji: '🌱', level: 'HL' },
]

export const STUDY_ROOMS = [
  // ── Group 1: English A ───────────────────────────────────────────
  {
    id: 'english_a_lit_hl', subject: 'English A Literature HL', subjectId: 'english_a_lit_hl', level: 'HL',
    description: 'Deep literary analysis, comparative essays and IO preparation',
    color: '#F59E0B', gradient: 'linear-gradient(135deg, #F59E0B, #B45309)', emoji: '📚',
    topics: ['Paper 1 Analysis', 'Paper 2 Essays', 'IO Prep', 'Comparative Study'],
  },
  {
    id: 'english_a_lit_sl', subject: 'English A Literature SL', subjectId: 'english_a_lit_sl', level: 'SL',
    description: 'Core literary texts, close reading and paper techniques',
    color: '#FBBF24', gradient: 'linear-gradient(135deg, #FBBF24, #D97706)', emoji: '📚',
    topics: ['Paper 1 Analysis', 'Paper 2 Essays', 'IO Prep', 'Text Analysis'],
  },
  {
    id: 'english_a_lang_lit_hl', subject: 'English A Lang & Lit HL', subjectId: 'english_a_lang_lit_hl', level: 'HL',
    description: 'Language in cultural context, media analysis and literature',
    color: '#D97706', gradient: 'linear-gradient(135deg, #D97706, #92400E)', emoji: '📖',
    topics: ['Paper 1 Analysis', 'Paper 2 Essays', 'IO Prep', 'Non-literary Texts'],
  },
  {
    id: 'english_a_lang_lit_sl', subject: 'English A Lang & Lit SL', subjectId: 'english_a_lang_lit_sl', level: 'SL',
    description: 'Language and literature fundamentals with media texts',
    color: '#F59E0B', gradient: 'linear-gradient(135deg, #F59E0B, #B45309)', emoji: '📖',
    topics: ['Paper 1 Analysis', 'Paper 2 Essays', 'IO Prep', 'Language Analysis'],
  },

  // ── Group 1: French A ────────────────────────────────────────────
  {
    id: 'french_a_lit_hl', subject: 'French A Literature HL', subjectId: 'french_a_lit_hl', level: 'HL',
    description: 'Analyse littéraire approfondie, essais comparatifs et IO en français',
    color: '#F43F5E', gradient: 'linear-gradient(135deg, #F43F5E, #9F1239)', emoji: '🇫🇷',
    topics: ['Paper 1 Analysis', 'Paper 2 Essays', 'IOC Prep', 'Comparative Study'],
  },
  {
    id: 'french_a_lit_sl', subject: 'French A Literature SL', subjectId: 'french_a_lit_sl', level: 'SL',
    description: 'Textes littéraires français, lecture attentive et techniques de rédaction',
    color: '#FB7185', gradient: 'linear-gradient(135deg, #FB7185, #E11D48)', emoji: '🇫🇷',
    topics: ['Paper 1 Analysis', 'Paper 2 Essays', 'IOC Prep', 'Text Analysis'],
  },
  {
    id: 'french_a_lang_lit_hl', subject: 'French A Lang & Lit HL', subjectId: 'french_a_lang_lit_hl', level: 'HL',
    description: 'Langue, médias et littérature en contexte culturel francophone',
    color: '#E11D48', gradient: 'linear-gradient(135deg, #E11D48, #881337)', emoji: '🇫🇷',
    topics: ['Paper 1 Analysis', 'Paper 2 Essays', 'IOC Prep', 'Non-literary Texts'],
  },
  {
    id: 'french_a_lang_lit_sl', subject: 'French A Lang & Lit SL', subjectId: 'french_a_lang_lit_sl', level: 'SL',
    description: 'Fondamentaux de la langue et de la littérature françaises',
    color: '#F43F5E', gradient: 'linear-gradient(135deg, #F43F5E, #BE123C)', emoji: '🇫🇷',
    topics: ['Paper 1 Analysis', 'Paper 2 Essays', 'IOC Prep', 'Language Analysis'],
  },

  // ── Group 1: Spanish A ───────────────────────────────────────────
  {
    id: 'spanish_a_lang_lit_hl', subject: 'Spanish A Lang & Lit HL', subjectId: 'spanish_a_lang_lit_hl', level: 'HL',
    description: 'Análisis literario avanzado y lengua en contexto cultural',
    color: '#EF4444', gradient: 'linear-gradient(135deg, #EF4444, #991B1B)', emoji: '🇪🇸',
    topics: ['Paper 1 Analysis', 'Paper 2 Essays', 'IOC Prep', 'Literary Devices'],
  },
  {
    id: 'spanish_a_lang_lit_sl', subject: 'Spanish A Lang & Lit SL', subjectId: 'spanish_a_lang_lit_sl', level: 'SL',
    description: 'Lengua y literatura española — análisis de textos y redacción',
    color: '#F87171', gradient: 'linear-gradient(135deg, #F87171, #DC2626)', emoji: '🇪🇸',
    topics: ['Paper 1 Analysis', 'Paper 2 Essays', 'IOC Prep', 'Text Analysis'],
  },

  // ── Group 2: Spanish B ───────────────────────────────────────────
  {
    id: 'spanish_b_hl', subject: 'Spanish B HL', subjectId: 'spanish_b_hl', level: 'HL',
    description: 'Advanced Spanish — complex texts, writing and oral exam',
    color: '#DC2626', gradient: 'linear-gradient(135deg, #DC2626, #7F1D1D)', emoji: '🇪🇸',
    topics: ['Reading & Writing', 'Listening', 'Speaking', 'Advanced Grammar'],
  },
  {
    id: 'spanish_b_sl', subject: 'Spanish B SL', subjectId: 'spanish_b_sl', level: 'SL',
    description: 'Core Spanish language skills and exam preparation',
    color: '#EF4444', gradient: 'linear-gradient(135deg, #EF4444, #B91C1C)', emoji: '🇪🇸',
    topics: ['Reading & Writing', 'Listening', 'Speaking', 'Vocabulary'],
  },

  // ── Group 3: Economics ───────────────────────────────────────────
  {
    id: 'economics_hl', subject: 'Economics HL', subjectId: 'economics_hl', level: 'HL',
    description: 'Micro, macro, international economics and HL extensions',
    color: '#F97316', gradient: 'linear-gradient(135deg, #F97316, #C2410C)', emoji: '📈',
    topics: ['Microeconomics', 'Macroeconomics', 'International', 'HL Extensions'],
  },
  {
    id: 'economics_sl', subject: 'Economics SL', subjectId: 'economics_sl', level: 'SL',
    description: 'Core economic concepts and global development',
    color: '#FB923C', gradient: 'linear-gradient(135deg, #FB923C, #EA580C)', emoji: '📈',
    topics: ['Microeconomics', 'Macroeconomics', 'International', 'Development'],
  },

  // ── Group 3: Geography ───────────────────────────────────────────
  {
    id: 'geography_hl', subject: 'Geography HL', subjectId: 'geography_hl', level: 'HL',
    description: 'Physical and human geography with HL global interactions',
    color: '#14B8A6', gradient: 'linear-gradient(135deg, #14B8A6, #0F766E)', emoji: '🌍',
    topics: ['Geophysical Hazards', 'Climate', 'Global Interactions', 'HL Extension'],
  },
  {
    id: 'geography_sl', subject: 'Geography SL', subjectId: 'geography_sl', level: 'SL',
    description: 'Core geography topics across physical and human themes',
    color: '#2DD4BF', gradient: 'linear-gradient(135deg, #2DD4BF, #14B8A6)', emoji: '🌍',
    topics: ['Freshwater', 'Oceans', 'Climate Change', 'Urban Environments'],
  },

  // ── Group 3: Global Politics ─────────────────────────────────────
  {
    id: 'global_politics_hl', subject: 'Global Politics HL', subjectId: 'global_politics_hl', level: 'HL',
    description: 'Power, sovereignty, rights and the HL global political engagement',
    color: '#A855F7', gradient: 'linear-gradient(135deg, #A855F7, #7E22CE)', emoji: '🌐',
    topics: ['Power & Sovereignty', 'Human Rights', 'Development', 'HL Extension'],
  },
  {
    id: 'global_politics_sl', subject: 'Global Politics SL', subjectId: 'global_politics_sl', level: 'SL',
    description: 'Core global political concepts and the engagement activity',
    color: '#C084FC', gradient: 'linear-gradient(135deg, #C084FC, #A855F7)', emoji: '🌐',
    topics: ['Power & Sovereignty', 'Human Rights', 'Development', 'Engagement Activity'],
  },

  // ── Group 3: History ─────────────────────────────────────────────
  {
    id: 'history_hl', subject: 'History HL', subjectId: 'history_hl', level: 'HL',
    description: 'World history with depth studies and three HL papers',
    color: '#EC4899', gradient: 'linear-gradient(135deg, #EC4899, #9D174D)', emoji: '🏛️',
    topics: ['Cold War', 'WWI & WWII', 'Paper 1 & 2', 'HL Paper 3'],
  },
  {
    id: 'history_sl', subject: 'History SL', subjectId: 'history_sl', level: 'SL',
    description: 'World history routes and source-based paper analysis',
    color: '#F472B6', gradient: 'linear-gradient(135deg, #F472B6, #DB2777)', emoji: '🏛️',
    topics: ['Cold War', 'WWI & WWII', 'Paper 1', 'Paper 2'],
  },

  // ── Group 4: Biology ─────────────────────────────────────────────
  {
    id: 'biology_hl', subject: 'Biology HL', subjectId: 'biology_hl', level: 'HL',
    description: 'Full biology curriculum with HL topics and options',
    color: '#16A34A', gradient: 'linear-gradient(135deg, #16A34A, #14532D)', emoji: '🧬',
    topics: ['Cell Biology', 'Genetics', 'Ecology', 'HL Options'],
  },
  {
    id: 'biology_sl', subject: 'Biology SL', subjectId: 'biology_sl', level: 'SL',
    description: 'Core biology — cells, genetics, ecology and human physiology',
    color: '#22C55E', gradient: 'linear-gradient(135deg, #22C55E, #15803D)', emoji: '🧬',
    topics: ['Cell Biology', 'Genetics', 'Ecology', 'Human Physiology'],
  },

  // ── Group 4: Chemistry ───────────────────────────────────────────
  {
    id: 'chemistry_hl', subject: 'Chemistry HL', subjectId: 'chemistry_hl', level: 'HL',
    description: 'Advanced chemistry with HL topics and deeper quantitative work',
    color: '#059669', gradient: 'linear-gradient(135deg, #059669, #064E3B)', emoji: '🧪',
    topics: ['Organic Chem', 'Equilibrium', 'Acids/Bases', 'HL Topics'],
  },
  {
    id: 'chemistry_sl', subject: 'Chemistry SL', subjectId: 'chemistry_sl', level: 'SL',
    description: 'Core chemistry from stoichiometry to organic reactions',
    color: '#10B981', gradient: 'linear-gradient(135deg, #10B981, #047857)', emoji: '🧪',
    topics: ['Organic Chem', 'Equilibrium', 'Stoichiometry', 'Energetics'],
  },

  // ── Group 4: Physics ─────────────────────────────────────────────
  {
    id: 'physics_hl', subject: 'Physics HL', subjectId: 'physics_hl', level: 'HL',
    description: 'Full physics with HL mechanics, fields and options',
    color: '#7C3AED', gradient: 'linear-gradient(135deg, #7C3AED, #6D28D9)', emoji: '⚛️',
    topics: ['Mechanics', 'Waves', 'Electromagnetism', 'HL Options'],
  },
  {
    id: 'physics_sl', subject: 'Physics SL', subjectId: 'physics_sl', level: 'SL',
    description: 'Core physics — mechanics, waves, electricity and thermal',
    color: '#8B5CF6', gradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED)', emoji: '⚛️',
    topics: ['Mechanics', 'Waves', 'Electricity', 'Thermal Physics'],
  },

  // ── Group 4: ESS ─────────────────────────────────────────────────
  {
    id: 'ess_hl', subject: 'ESS HL', subjectId: 'ess_hl', level: 'HL',
    description: 'In-depth ecosystems science, sustainability and environmental systems',
    color: '#059669', gradient: 'linear-gradient(135deg, #059669, #064E3B)', emoji: '🌿',
    topics: ['Ecosystems', 'Pollution', 'Climate Change', 'Sustainability'],
  },
  {
    id: 'ess_sl', subject: 'ESS SL', subjectId: 'ess_sl', level: 'SL',
    description: 'Exploring ecosystems, sustainability and our impact on the planet',
    color: '#34D399', gradient: 'linear-gradient(135deg, #34D399, #059669)', emoji: '🌿',
    topics: ['Ecosystems', 'Pollution', 'Climate Change', 'Sustainability'],
  },

  // ── Group 5: Mathematics ─────────────────────────────────────────
  {
    id: 'math_aa_hl', subject: 'Math AA HL', subjectId: 'math_aa_hl', level: 'HL',
    description: 'Proofs, complex numbers, hard calculus and advanced analysis',
    color: '#8B5CF6', gradient: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', emoji: '∑',
    topics: ['Calculus', 'Complex Numbers', 'Proofs', 'Vectors'],
  },
  {
    id: 'math_aa_sl', subject: 'Math AA SL', subjectId: 'math_aa_sl', level: 'SL',
    description: 'Functions, statistics, calculus and algebra',
    color: '#A78BFA', gradient: 'linear-gradient(135deg, #A78BFA, #7C3AED)', emoji: '∑',
    topics: ['Functions', 'Statistics', 'Calculus', 'Trigonometry'],
  },
  {
    id: 'math_ai_sl', subject: 'Math AI SL', subjectId: 'math_ai_sl', level: 'SL',
    description: 'Statistics, modelling, financial maths and technology use',
    color: '#7C3AED', gradient: 'linear-gradient(135deg, #7C3AED, #4C1D95)', emoji: '📊',
    topics: ['Statistics', 'Modelling', 'Financial Maths', 'Technology Use'],
  },

  // ── Group 6: Computer Science ────────────────────────────────────
  {
    id: 'computer_science_hl', subject: 'Computer Science HL', subjectId: 'computer_science_hl', level: 'HL',
    description: 'Algorithms, OOP, system design and the HL dossier',
    color: '#7C3AED', gradient: 'linear-gradient(135deg, #7C3AED, #6D28D9)', emoji: '💻',
    topics: ['Algorithms', 'OOP', 'HL Dossier', 'Databases'],
  },
  {
    id: 'computer_science_sl', subject: 'Computer Science SL', subjectId: 'computer_science_sl', level: 'SL',
    description: 'Core CS concepts, problem solving and the IA project',
    color: '#8B5CF6', gradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED)', emoji: '💻',
    topics: ['Algorithms', 'OOP', 'Databases', 'IA Projects'],
  },

  // ── Core: Extended Essay, TOK & CAS ─────────────────────────────
  {
    id: 'extended_essay', subject: 'Extended Essay', subjectId: 'extended_essay', level: 'HL',
    description: 'Research, structure, argument and the 4000-word independent essay',
    color: '#0EA5E9', gradient: 'linear-gradient(135deg, #0EA5E9, #0369A1)', emoji: '📝',
    topics: ['Research Question', 'Structure & Argument', 'Citations & RPPF', 'Viva Voce Prep'],
  },
  {
    id: 'tok', subject: 'Theory of Knowledge', subjectId: 'tok', level: 'HL',
    description: 'Knowledge questions, TOK essay and exhibition preparation',
    color: '#6366F1', gradient: 'linear-gradient(135deg, #6366F1, #4338CA)', emoji: '🧠',
    topics: ['Knowledge Questions', 'TOK Essay', 'TOK Exhibition', 'Areas of Knowledge'],
  },
  {
    id: 'cas', subject: 'CAS', subjectId: 'cas', level: 'HL',
    description: 'Creativity, Activity, Service — reflections, portfolio and learning outcomes',
    color: '#10B981', gradient: 'linear-gradient(135deg, #10B981, #059669)', emoji: '🌱',
    topics: ['CAS Reflections', 'Learning Outcomes', 'CAS Project', 'Portfolio Review'],
  },
]

export function getSubject(id) {
  return IB_SUBJECTS.find(s => s.id === id)
}
