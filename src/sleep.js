// Sleep log math: how long each night was, and how recent nights compare
// to the sleep goal and to the plan.
import { DAYS, SETTINGS, campusChoice, planDay, toMinutes } from './plan.js'

const MINUTES_IN_DAY = 24 * 60

// Minutes asleep for one entry. Going to bed before midnight works too:
// 23:30 -> 07:30 is 480 minutes.
export function minutesSlept(entry) {
  const diff = toMinutes(entry.wakeTime) - toMinutes(entry.bedTime)
  return diff < 0 ? diff + MINUTES_IN_DAY : diff
}

// 450 -> "7h 30m", 40 -> "40m"
export function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60)
  return hours === 0 ? `${minutes % 60}m` : `${hours}h ${minutes % 60}m`
}

// The 7 most recent entries, newest first.
export function recentNights(log) {
  return [...log].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7)
}

// Numbers for the last 7 nights: how many, the total and average sleep, how
// many hit the goal, and the sleep debt. Returns null if nothing is logged.
export function weekSummary(log) {
  const recent = recentNights(log)
  if (recent.length === 0) return null

  const total = recent.reduce((sum, entry) => sum + minutesSlept(entry), 0)
  // Sleep debt: add up how far each short night fell below the goal.
  // Long nights don't cancel out short ones.
  const debt = recent.reduce(
    (sum, entry) => sum + Math.max(0, SETTINGS.sleepGoal - minutesSlept(entry)),
    0,
  )
  return {
    count: recent.length,
    total,
    average: Math.round(total / recent.length),
    hitGoal: recent.filter((entry) => minutesSlept(entry) >= SETTINGS.sleepGoal).length,
    debt,
  }
}

// One-line summary, e.g. "Last 3 nights: average 7h 20m, 1 of 3 hit the 8h goal."
export function describeStatus(log) {
  const summary = weekSummary(log)
  if (!summary) return 'No nights logged yet.'

  const { count, average, hitGoal } = summary
  const goalHours = SETTINGS.sleepGoal / 60
  const nights = count === 1 ? 'night' : 'nights'

  return `Last ${count} ${nights}: average ${formatDuration(average)}, ${hitGoal} of ${count} hit the ${goalHours}h goal.`
}

// "2026-10-26" -> "Mon". getDay() counts from Sunday (0), DAYS starts on Monday.
function dayOfDate(date) {
  return DAYS[(new Date(`${date}T00:00`).getDay() + 6) % 7]
}

// How many minutes later (+) or earlier (-) than the plan the user went to
// bed. The plan is for the day they woke up. Returns null if that day had no
// plan (no events, or an online-only day with no campus answer).
export function bedtimeVsPlan(entry, events, campus) {
  const day = dayOfDate(entry.date)
  const dayEvents = events.filter((event) => event.day === day)
  const choice = campusChoice(dayEvents, campus[day])
  if (choice === null) return null

  const plan = planDay(dayEvents, choice)
  if (!plan) return null

  // Bring the difference into -12h..+12h, so 00:30 vs 23:30 is +1h, not -23h.
  const diff = toMinutes(entry.bedTime) - plan.bed
  return ((((diff + MINUTES_IN_DAY / 2) % MINUTES_IN_DAY) + MINUTES_IN_DAY) % MINUTES_IN_DAY) - MINUTES_IN_DAY / 2
}

// 80 -> "1h 20m late", -40 -> "40m early", 3 -> "on time" (within 5 min)
export function formatVsPlan(diff) {
  if (Math.abs(diff) < 5) return 'on time'
  return `${formatDuration(Math.abs(diff))} ${diff > 0 ? 'late' : 'early'}`
}
