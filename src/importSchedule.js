// Reads a pasted schedule (one class or shift per line) and turns it into
// events. Plain JavaScript, no React.
//
// Works with lines like:
//   Mon & Wens CMP 410 - 10AM - 11:40AM In person
//   Tuesday & Thursdays CMP 408: 6:00PM - 7:40PM
//   MoWe 9:00AM - 10:15AM          (CUNYfirst style)

// Words that mean each day, including plurals and common spellings.
const DAY_WORDS = {
  Mon: ['mon', 'mons', 'monday', 'mondays'],
  Tue: ['tue', 'tues', 'tuesday', 'tuesdays'],
  Wed: ['wed', 'weds', 'wens', 'wednesday', 'wednesdays'],
  Thu: ['thu', 'thur', 'thurs', 'thursday', 'thursdays'],
  Fri: ['fri', 'friday', 'fridays'],
  Sat: ['sat', 'saturday', 'saturdays'],
  Sun: ['sun', 'sunday', 'sundays'],
}

// CUNYfirst short codes, which can be joined together like "MoWe" or "TuTh".
const SHORT_CODES = { mo: 'Mon', tu: 'Tue', we: 'Wed', th: 'Thu', fr: 'Fri', sa: 'Sat', su: 'Sun' }

// Finds every day mentioned in a line, e.g. "Mon & Wens ..." -> ["Mon", "Wed"].
function findDays(line) {
  const days = []
  const words = line.toLowerCase().split(/[^a-z]+/)

  for (const word of words) {
    for (const [day, spellings] of Object.entries(DAY_WORDS)) {
      if (spellings.includes(word)) days.push(day)
    }
    // "mowe" -> ["mo", "we"] -> Mon, Wed
    if (/^(mo|tu|we|th|fr|sa|su)+$/.test(word)) {
      for (const code of word.match(/../g)) days.push(SHORT_CODES[code])
    }
  }
  return [...new Set(days)] // remove repeats
}

// Finds the first time in a line and returns it as "HH:MM" (24-hour).
// A number only counts as a time if it has ":" or AM/PM, so "CMP 410" isn't
// read as a time. Returns null if there's no time.
function findStartTime(line) {
  for (const match of line.matchAll(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/gi)) {
    const [, hourText, minuteText, ampm] = match
    if (!minuteText && !ampm) continue

    let hour = Number(hourText)
    const minute = Number(minuteText ?? 0)
    if (ampm) {
      const isPm = ampm.toLowerCase() === 'pm'
      if (hour < 1 || hour > 12) continue
      if (hour === 12) hour = 0 // 12 AM = 0:00, 12 PM = 12:00 (added below)
      if (isPm) hour += 12
    }
    if (hour > 23 || minute > 59) continue

    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
  }
  return null
}

// Reads the whole pasted text.
// Returns { events, problems }: the events it understood, and the lines it
// couldn't read (so the user can fix them).
export function parseSchedule(text) {
  const events = []
  const problems = []

  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim()
    if (!line) continue

    const days = findDays(line)
    const startTime = findStartTime(line)
    if (days.length === 0 || !startTime) {
      problems.push(line)
      continue
    }

    const lower = line.toLowerCase()
    const type = /\b(work|shift|job)\b/.test(lower) ? 'work' : 'class'
    const isOnline = /\b(virtual|online|remote|zoom)\b/.test(lower)
    const isInPerson = /\bin[\s-]?person\b/.test(lower)
    // No mode written: assume in-person, and mark it so the preview says so.
    const mode = isOnline ? 'online' : 'in-person'
    const modeGuessed = !isOnline && !isInPerson

    for (const day of days) {
      events.push({ type, mode, day, startTime, modeGuessed })
    }
  }

  return { events, problems }
}
