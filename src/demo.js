// Sample data for the first-time demo. It's shown but never saved, so it
// can't mix with the user's real data.

// A sample week of classes and work.
export const DEMO_EVENTS = [
  { id: 1, type: 'class', mode: 'in-person', day: 'Mon', startTime: '09:00' },
  { id: 2, type: 'work', mode: 'in-person', day: 'Mon', startTime: '17:00' },
  { id: 3, type: 'class', mode: 'online', day: 'Tue', startTime: '10:00' },
  { id: 4, type: 'class', mode: 'online', day: 'Wed', startTime: '08:00' },
  { id: 5, type: 'class', mode: 'in-person', day: 'Wed', startTime: '11:00' },
  { id: 6, type: 'class', mode: 'in-person', day: 'Thu', startTime: '09:30' },
  { id: 7, type: 'work', mode: 'in-person', day: 'Fri', startTime: '12:00' },
]

// Tuesday is online-only, and the sample student stays home.
export const DEMO_CAMPUS = { Tue: false }

// One week of nights (date = the morning they woke up), with a short
// midterm night on Wednesday.
export const DEMO_SLEEP = [
  { date: '2026-10-19', bedTime: '23:30', wakeTime: '07:35' },
  { date: '2026-10-20', bedTime: '01:30', wakeTime: '09:30' },
  { date: '2026-10-21', bedTime: '02:00', wakeTime: '07:00' },
  { date: '2026-10-22', bedTime: '23:00', wakeTime: '07:15' },
  { date: '2026-10-23', bedTime: '00:30', wakeTime: '08:00' },
  { date: '2026-10-24', bedTime: '01:00', wakeTime: '09:30' },
  { date: '2026-10-25', bedTime: '00:30', wakeTime: '09:00' },
]
