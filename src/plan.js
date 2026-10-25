// The time math for the daily plan: works out leave, wake, and bedtime
// from a day's events. No React here, just plain functions.

// All planning settings in one place (in minutes).
export const SETTINGS = {
  sleepGoal: 8 * 60,
  getReady: 30,
  commute: 33,
  delayBuffer: 20,
  delayWindowStart: 6 * 60, // 6:00 AM
  delayWindowEnd: 9 * 60 + 30, // 9:30 AM
}

const MINUTES_IN_DAY = 24 * 60

// "09:30" -> 570 (minutes since midnight)
export function toMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

// 570 -> "9:30 AM". Wraps around midnight, so -23 becomes "11:37 PM".
export function formatTime(totalMinutes) {
  const wrapped = ((totalMinutes % MINUTES_IN_DAY) + MINUTES_IN_DAY) % MINUTES_IN_DAY
  const hours24 = Math.floor(wrapped / 60)
  const minutes = wrapped % 60
  const period = hours24 < 12 ? 'AM' : 'PM'
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12
  return `${hours12}:${String(minutes).padStart(2, '0')} ${period}`
}

// Returns the event that starts first, or null if the list is empty.
function earliest(events) {
  if (events.length === 0) return null
  return events.reduce((first, event) =>
    toMinutes(event.startTime) < toMinutes(first.startTime) ? event : first,
  )
}

// Works out one day's plan.
// dayEvents: that day's events, e.g. [{ type, mode, day, startTime }]
// goingToCampus: true or false
// Returns { leave, wake, bed } in minutes (leave is null on home days),
// or null if the day has no events.
export function planDay(dayEvents, goingToCampus) {
  if (goingToCampus) {
    // Plan from the first in-person event. On an online-only day where the
    // user still goes to campus, plan from the first event instead.
    const inPerson = dayEvents.filter((event) => event.mode === 'in-person')
    const event = earliest(inPerson) ?? earliest(dayEvents)
    if (!event) return null

    let leave = toMinutes(event.startTime) - SETTINGS.commute

    // Morning trains run late, so leave earlier inside the delay window.
    if (leave >= SETTINGS.delayWindowStart && leave <= SETTINGS.delayWindowEnd) {
      leave -= SETTINGS.delayBuffer
    }

    // Wake in time to leave, or earlier if an online event starts first.
    const wakeForFirstEvent = toMinutes(earliest(dayEvents).startTime) - SETTINGS.getReady
    const wake = Math.min(leave - SETTINGS.getReady, wakeForFirstEvent)
    const bed = wake - SETTINGS.sleepGoal
    return { leave, wake, bed }
  }

  // Home day: no commute, just be ready for the first event.
  const event = earliest(dayEvents)
  if (!event) return null

  const wake = toMinutes(event.startTime) - SETTINGS.getReady
  const bed = wake - SETTINGS.sleepGoal
  return { leave: null, wake, bed }
}
