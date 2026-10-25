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

// Numbers for the last 7 nights: how many, the total and average sleep, and
// how many hit the goal. Returns null if nothing is logged.
export function weekSummary(log) {
  const recent = recentNights(log)
  if (recent.length === 0) return null

  const total = recent.reduce((sum, entry) => sum + minutesSlept(entry), 0)
  return {
    count: recent.length,
    total,
    average: Math.round(total / recent.length),
    hitGoal: recent.filter((entry) => minutesSlept(entry) >= SETTINGS.sleepGoal).length,
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
