const AVATARS = ['🧑‍💻', '👩‍🎓', '🧑‍🔬', '👨‍🏫', '👩‍💼', '🧑‍🎨', '👩‍🔬', '🧑‍📚', '👨‍💻', '👩‍🏫', '🧑‍💼', '👨‍🎓']
const STATUSES = ['studying', 'studying', 'studying', 'on_break', 'focusing']
const TIMEZONES = ['GMT-8', 'GMT-5', 'GMT+0', 'GMT+1', 'GMT+3', 'GMT+5:30', 'GMT+8']

const NAMES = [
  'Aisha K.', 'Marco R.', 'Priya S.', 'Lucas M.', 'Emma T.',
  'Yuki N.', 'Omar A.', 'Sofia L.', 'James W.', 'Zara H.',
  'Ethan C.', 'Maya P.', 'Leo B.', 'Nina F.', 'Raj V.',
  'Chloe D.', 'Ivan S.', 'Amara O.', 'Felix K.', 'Sara J.',
]

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateUser(id) {
  return {
    id,
    name: NAMES[id % NAMES.length],
    avatar: AVATARS[id % AVATARS.length],
    status: randomFrom(STATUSES),
    timezone: randomFrom(TIMEZONES),
    pomodoroCount: Math.floor(Math.random() * 8),
    joinedMinutesAgo: Math.floor(Math.random() * 90) + 1,
  }
}

export function getRoomUsers(roomId) {
  const seed = roomId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const count = 3 + (seed % 7)
  return Array.from({ length: count }, (_, i) => generateUser((seed + i) % NAMES.length))
}

export const MATCH_POOL = [
  {
    id: 'm1', name: 'Aisha K.', avatar: '👩‍🎓',
    subjects: ['math_aa_hl', 'physics_hl', 'chemistry_hl'],
    level: 'HL', studyStyle: 'structured', timezone: 'GMT+1',
    goals: ['exams', 'ia'], weeklyHours: 10,
    bio: 'Aiming for 7s across sciences. Love working through past papers together.',
  },
  {
    id: 'm2', name: 'Marco R.', avatar: '🧑‍💻',
    subjects: ['computer_science_hl', 'math_aa_hl', 'economics_hl'],
    level: 'HL', studyStyle: 'flexible', timezone: 'GMT+1',
    goals: ['ia', 'concepts'], weeklyHours: 8,
    bio: 'CS nerd who also loves maths. Working on my IA right now.',
  },
  {
    id: 'm3', name: 'Priya S.', avatar: '🧑‍🔬',
    subjects: ['biology_hl', 'chemistry_hl', 'global_politics_sl'],
    level: 'HL', studyStyle: 'structured', timezone: 'GMT+5:30',
    goals: ['exams', 'concepts'], weeklyHours: 12,
    bio: 'Pre-med track. Need a study group for bio and chem papers.',
  },
  {
    id: 'm4', name: 'Lucas M.', avatar: '👨‍🏫',
    subjects: ['history_hl', 'english_a_lit_hl', 'economics_sl'],
    level: 'HL', studyStyle: 'discussion', timezone: 'GMT-5',
    goals: ['essays', 'exams'], weeklyHours: 7,
    bio: 'Love debating history topics. Happy to peer review essays!',
  },
  {
    id: 'm5', name: 'Emma T.', avatar: '👩‍💼',
    subjects: ['math_ai_sl', 'economics_sl', 'geography_sl'],
    level: 'SL', studyStyle: 'flexible', timezone: 'GMT+0',
    goals: ['concepts', 'exams'], weeklyHours: 6,
    bio: 'Economics and geography student. Looking for structured sessions.',
  },
  {
    id: 'm6', name: 'Yuki N.', avatar: '🧑‍🎨',
    subjects: ['french_a_lang_lit_hl', 'english_a_lang_lit_sl', 'global_politics_hl'],
    level: 'HL', studyStyle: 'discussion', timezone: 'GMT+9',
    goals: ['ia', 'essays'], weeklyHours: 9,
    bio: 'French A student working on IO prep. Also great at English essay structure.',
  },
  {
    id: 'm7', name: 'Omar A.', avatar: '🧑‍📚',
    subjects: ['math_aa_hl', 'physics_hl', 'history_hl'],
    level: 'HL', studyStyle: 'structured', timezone: 'GMT+3',
    goals: ['exams', 'concepts'], weeklyHours: 14,
    bio: 'Very serious about maths and physics. Let\'s grind past papers.',
  },
  {
    id: 'm8', name: 'Sofia L.', avatar: '👩‍🔬',
    subjects: ['biology_sl', 'spanish_b_sl', 'global_politics_sl'],
    level: 'SL', studyStyle: 'flexible', timezone: 'GMT+1',
    goals: ['concepts', 'exams'], weeklyHours: 5,
    bio: 'Friendly study partner! I explain concepts well and love Pomodoro sessions.',
  },
  {
    id: 'm9', name: 'James W.', avatar: '👨‍💻',
    subjects: ['computer_science_hl', 'math_aa_hl', 'physics_hl'],
    level: 'HL', studyStyle: 'structured', timezone: 'GMT-8',
    goals: ['ia', 'exams'], weeklyHours: 11,
    bio: 'Working on a complex CS IA. Great at algorithms and data structures.',
  },
  {
    id: 'm10', name: 'Zara H.', avatar: '🧑‍💼',
    subjects: ['economics_hl', 'history_sl', 'spanish_a_lang_lit_hl'],
    level: 'HL', studyStyle: 'discussion', timezone: 'GMT+4',
    goals: ['essays', 'exams'], weeklyHours: 8,
    bio: 'Economics and humanities. Let\'s do essay workshops and timed writing.',
  },
]

export function calculateMatchScore(userProfile, candidate) {
  let score = 0
  const commonSubjects = userProfile.subjects.filter(s => candidate.subjects.includes(s))
  score += commonSubjects.length * 30

  if (userProfile.studyStyle === candidate.studyStyle) score += 20
  if (userProfile.goals.some(g => candidate.goals.includes(g))) score += 15

  const userOffset = parseFloat(userProfile.timezone?.replace('GMT', '') || 0)
  const candOffset = parseFloat(candidate.timezone.replace('GMT', '') || 0)
  const tzDiff = Math.abs(userOffset - candOffset)
  if (tzDiff <= 2) score += 15
  else if (tzDiff <= 5) score += 8

  if (Math.abs((userProfile.weeklyHours || 8) - candidate.weeklyHours) <= 3) score += 10

  return { ...candidate, score, commonSubjects }
}
