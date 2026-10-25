// Sleep log math: how long each night was, and how recent nights compare
// to the sleep goal.
import { SETTINGS, toMinutes } from './plan.js'

// Minutes asleep for one entry. Going to bed before midnight works too:
// 23:30 -> 07:30 is 480 minutes.
export function minutesSlept(entry) {
  const diff = toMinutes(entry.wakeTime) - toMinutes(entry.bedTime)
  return diff < 0 ? diff + 24 * 60 : diff
}

// 450 -> "7h 30m"
export function formatDuration(minutes) {
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`
}

// The 7 most recent entries, newest first.
export function recentNights(log) {
  return [...log].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7)
}

// One-line summary, e.g. "Last 3 nights: average 7h 20m, 1 of 3 hit the 8h goal."
export function describeStatus(log) {
  const recent = recentNights(log)
  if (recent.length === 0) return 'No nights logged yet.'

  const total = recent.reduce((sum, entry) => sum + minutesSlept(entry), 0)
  const average = Math.round(total / recent.length)
  const hitGoal = recent.filter((entry) => minutesSlept(entry) >= SETTINGS.sleepGoal).length
  const goalHours = SETTINGS.sleepGoal / 60
  const nights = recent.length === 1 ? 'night' : 'nights'

  return `Last ${recent.length} ${nights}: average ${formatDuration(average)}, ${hitGoal} of ${recent.length} hit the ${goalHours}h goal.`
}
