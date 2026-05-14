export const AGE_GROUPS = [
  { id: 'youth_1011', label: 'Youth 10/11', min: 10, max: 11 },
  { id: 'youth_1213', label: 'Youth 12/13', min: 12, max: 13 },
  { id: 'youth_1415', label: 'Youth 14/15', min: 14, max: 15 },
  { id: 'junior_1617', label: 'Junior 16/17', min: 16, max: 17 },
  { id: 'junior_1819', label: 'Junior 18/19', min: 18, max: 19 },
  { id: 'senior_2024', label: 'Senior 20-24', min: 20, max: 24 },
  { id: 'senior_2529', label: 'Senior 25-29', min: 25, max: 29 },
  { id: 'senior_3034', label: 'Senior 30-34', min: 30, max: 34 },
  { id: 'masters_3539', label: 'Masters 35-39', min: 35, max: 39 },
  { id: 'masters_4044', label: 'Masters 40-44', min: 40, max: 44 },
  { id: 'masters_4549', label: 'Masters 45-49', min: 45, max: 49 },
  { id: 'masters_5054', label: 'Masters 50-54', min: 50, max: 54 },
  { id: 'veterans_5559', label: 'Veterans 55-59', min: 55, max: 59 },
  { id: 'veterans_6064', label: 'Veterans 60-64', min: 60, max: 64 },
  { id: 'veterans_65p', label: 'Veterans 65+', min: 65, max: 99 },
]

export const DISCIPLINES = [
  {
    id: 'ocr100',
    label: 'OCR 100m',
    labelEs: 'OCR 100m',
    color: '#C41A00',
    bg: '#FFF0EE',
    format: 'sprint',
    description: 'Sprint · 11 obstacles · Direct elimination',
    descriptionEs: 'Sprint · 11 obstáculos · Eliminación directa',
    icon: '⚡',
    rules: {
      qualifyingRuns: 2,
      bracketFormat: 'direct_elimination',
      laneCount: 2,
    }
  },
  {
    id: 'ocr400',
    label: 'OCR 400m',
    labelEs: 'OCR 400m',
    color: '#9A6E00',
    bg: '#FEF6E0',
    format: 'sprint',
    description: 'Track · 11 obstacles · Direct elimination',
    descriptionEs: 'Pista · 11 obstáculos · Eliminación directa',
    icon: '🔄',
    rules: {
      qualifyingRuns: 2,
      bracketFormat: 'direct_elimination',
      laneCount: 2,
    }
  },
  {
    id: 'short',
    label: 'Short Course',
    labelEs: 'Short Course',
    color: '#0055BB',
    bg: '#E8F0FB',
    format: 'xc',
    description: '3km · 20+ obstacles · 3-band system · Penalty Loop',
    descriptionEs: '3km · 20+ obstáculos · Sistema 3 pulseras · Penalty Loop',
    icon: '◎',
    rules: {
      startingBands: 3,
      adaptiveBands: 5,
      maxPenaltyLoops: 2,
      chipTiming: true,
    }
  },
  {
    id: 'standard',
    label: 'Standard Course',
    labelEs: 'Standard Course',
    color: '#0A7A50',
    bg: '#E5F5EF',
    format: 'xc',
    description: '12km · 40+ obstacles · 3-band system · Min age 16',
    descriptionEs: '12km · 40+ obstáculos · 3 pulseras · Edad mínima 16',
    icon: '🏔',
    rules: {
      startingBands: 3,
      adaptiveBands: 5,
      maxPenaltyLoops: 2,
      chipTiming: true,
      minAge: 16,
    }
  },
  {
    id: 'teamrelay',
    label: 'Team Relay',
    labelEs: 'Team Relay',
    color: '#5B3FA8',
    bg: '#F0EBFF',
    format: 'team',
    description: '4 athletes · 5 laps · Cooperative last lap',
    descriptionEs: '4 atletas · 5 vueltas · Última vuelta cooperativa',
    icon: '🤝',
    rules: {
      teamSize: 4,
      laps: 5,
      cooperativeLap: 5,
    }
  },
  {
    id: 'pentathlon',
    label: 'Pentathlon UIPM',
    labelEs: 'Pentatlón UIPM',
    color: '#0A1628',
    bg: '#E8EBF0',
    format: 'pentathlon',
    description: '~100m · 8 obstacles · 6 fixed + 2 drawn at random',
    descriptionEs: '~100m · 8 obstáculos · 6 fijos + 2 sorteados',
    icon: '🏛',
    rules: {
      qualifyingRuns: 2,
      fixedObstacles: 6,
      drawnObstacles: 2,
      eliteAdvance: 16,
      ageGroupAdvance: 8,
    }
  },
]

export const PENTATHLON_FIXED = [
  'Steps', 'Over Wall', 'Balance Beam',
  'Climbing Holds', 'Giant Steps', 'Finish Wall'
]

export const PENTATHLON_POOL = [
  'Rings', 'Flying Hoops', 'Monkey Bars', 'Tilting Ladder',
  'Rope Climb', 'Peg Board', 'Big Wheel', 'Net Crawl',
  'Traverse Wall', 'Low Rig', 'Canyon Rings', 'Dips'
]

export const COUNTRIES = [
  { code: 'ARG', name: 'Argentina', flag: '🇦🇷' },
  { code: 'AUS', name: 'Australia', flag: '🇦🇺' },
  { code: 'AUT', name: 'Austria', flag: '🇦🇹' },
  { code: 'BEL', name: 'Belgium', flag: '🇧🇪' },
  { code: 'BOL', name: 'Bolivia', flag: '🇧🇴' },
  { code: 'BRA', name: 'Brazil', flag: '🇧🇷' },
  { code: 'CAN', name: 'Canada', flag: '🇨🇦' },
  { code: 'CHI', name: 'Chile', flag: '🇨🇱' },
  { code: 'CHN', name: 'China', flag: '🇨🇳' },
  { code: 'COL', name: 'Colombia', flag: '🇨🇴' },
  { code: 'CRI', name: 'Costa Rica', flag: '🇨🇷' },
  { code: 'CRO', name: 'Croatia', flag: '🇭🇷' },
  { code: 'CZE', name: 'Czech Republic', flag: '🇨🇿' },
  { code: 'DEN', name: 'Denmark', flag: '🇩🇰' },
  { code: 'ECU', name: 'Ecuador', flag: '🇪🇨' },
  { code: 'ESP', name: 'Spain', flag: '🇪🇸' },
  { code: 'FIN', name: 'Finland', flag: '🇫🇮' },
  { code: 'FRA', name: 'France', flag: '🇫🇷' },
  { code: 'GBR', name: 'Great Britain', flag: '🇬🇧' },
  { code: 'GER', name: 'Germany', flag: '🇩🇪' },
  { code: 'GRE', name: 'Greece', flag: '🇬🇷' },
  { code: 'HUN', name: 'Hungary', flag: '🇭🇺' },
  { code: 'IND', name: 'India', flag: '🇮🇳' },
  { code: 'IRL', name: 'Ireland', flag: '🇮🇪' },
  { code: 'ISR', name: 'Israel', flag: '🇮🇱' },
  { code: 'ITA', name: 'Italy', flag: '🇮🇹' },
  { code: 'JPN', name: 'Japan', flag: '🇯🇵' },
  { code: 'KOR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'LTU', name: 'Lithuania', flag: '🇱🇹' },
  { code: 'MEX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'MLT', name: 'Malta', flag: '🇲🇹' },
  { code: 'NED', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'NOR', name: 'Norway', flag: '🇳🇴' },
  { code: 'NZL', name: 'New Zealand', flag: '🇳🇿' },
  { code: 'PAN', name: 'Panama', flag: '🇵🇦' },
  { code: 'PAR', name: 'Paraguay', flag: '🇵🇾' },
  { code: 'PER', name: 'Peru', flag: '🇵🇪' },
  { code: 'PHI', name: 'Philippines', flag: '🇵🇭' },
  { code: 'POL', name: 'Poland', flag: '🇵🇱' },
  { code: 'POR', name: 'Portugal', flag: '🇵🇹' },
  { code: 'ROU', name: 'Romania', flag: '🇷🇴' },
  { code: 'RSA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'SGP', name: 'Singapore', flag: '🇸🇬' },
  { code: 'SLO', name: 'Slovenia', flag: '🇸🇮' },
  { code: 'SRB', name: 'Serbia', flag: '🇷🇸' },
  { code: 'SUI', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'SVK', name: 'Slovakia', flag: '🇸🇰' },
  { code: 'SWE', name: 'Sweden', flag: '🇸🇪' },
  { code: 'UAE', name: 'UAE', flag: '🇦🇪' },
  { code: 'UKR', name: 'Ukraine', flag: '🇺🇦' },
  { code: 'URU', name: 'Uruguay', flag: '🇺🇾' },
  { code: 'USA', name: 'United States', flag: '🇺🇸' },
  { code: 'VEN', name: 'Venezuela', flag: '🇻🇪' },
]

export const getCountry = (code) => COUNTRIES.find(c => c.code === code)
export const getFlag = (code) => getCountry(code)?.flag || '🏳'
export const getDiscpline = (id) => DISCIPLINES.find(d => d.id === id)

// Timing helpers
export const parseTime = (s) => {
  if (!s || /^(dnc|dnf)$/i.test(String(s).trim())) return null
  const n = parseFloat(s)
  return isNaN(n) ? null : n
}

export const formatTime = (t, isMinutes = false) => {
  if (t == null) return '—'
  if (isMinutes) {
    const m = Math.floor(t / 60)
    const s = (t % 60).toFixed(2).padStart(5, '0')
    return `${m}:${s}`
  }
  return t.toFixed(2) + 's'
}

export const bestOf = (a, b) => {
  const x = parseTime(a), y = parseTime(b)
  if (!x && !y) return null
  if (!x) return y
  if (!y) return x
  return Math.min(x, y)
}

// XC wristband calculation (World Obstacle official rules)
export const calcXCResult = (chipTime, bandsLost, penaltyLoops, isAdaptive = false) => {
  const maxBands = isAdaptive ? 5 : 3
  if (bandsLost >= maxBands) return { status: 'DNC', adj: null }
  const recovered = Math.min(penaltyLoops, bandsLost, 2)
  const remaining = maxBands - bandsLost + recovered
  if (remaining < maxBands) return { status: 'DNC', adj: null }
  const t = parseTime(chipTime)
  if (!t) return { status: chipTime ? 'DNF' : null, adj: null }
  return { status: 'OK', adj: t }
}

// Bracket builder
export const buildBracket = (sorted) => {
  if (sorted.length < 2) return null
  let size = 2
  while (size < sorted.length) size *= 2
  const slots = Array(size).fill(null)
  sorted.forEach((a, i) => { slots[i] = a })
  const rounds = []
  const r0 = Array.from({ length: size / 2 }, (_, i) => ({
    id: `r0m${i}`, a: slots[i * 2], b: slots[i * 2 + 1], winner: null, tA: '', tB: ''
  }))
  rounds.push(r0)
  let prev = r0
  while (prev.length > 1) {
    const nx = Array.from({ length: prev.length / 2 }, (_, i) => ({
      id: `r${rounds.length}m${i}`, a: null, b: null, winner: null, tA: '', tB: ''
    }))
    rounds.push(nx)
    prev = nx
  }
  const names = []
  if (size >= 32) names.push('Round of 32')
  if (size >= 16) names.push('Round of 16')
  if (size >= 8) names.push('Quarterfinals')
  if (size >= 4) names.push('Semifinals')
  names.push('FINAL')
  return { rounds, names }
}

// Group key for ranking
export const groupKey = (cat, ageGroup, gender) =>
  cat === 'elite' ? `elite_${gender}` : `ag_${ageGroup}_${gender}`

// WhatsApp message builder
export const buildWAMessage = (athlete, event, discipline, position, time) => {
  const medal = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : '🏅'
  return encodeURIComponent(
    `${medal} OCR TIME — ${event.name}\n` +
    `${athlete.full_name} #${athlete.bib}\n` +
    `📍 ${discipline}\n` +
    `⏱ Tiempo: ${time}\n` +
    `🏅 Posición: ${position}\n` +
    `Ver ranking: https://ocrtime.com/results`
  )
}
