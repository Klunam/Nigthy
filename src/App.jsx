// The main screen. It holds the events, campus answers, and sleep log, saves
// them, and switches between the Plan and Sleep stats pages. On the first
// visit it shows a demo with sample data instead.
import { useEffect, useState } from 'react'
import DayCard from './DayCard.jsx'
import EventForm from './EventForm.jsx'
import ScheduleImport from './ScheduleImport.jsx'
import SleepLog from './SleepLog.jsx'
import SleepStats from './SleepStats.jsx'
import { DEMO_CAMPUS, DEMO_EVENTS, DEMO_SLEEP } from './demo.js'
import { DAYS } from './plan.js'
import { describeStatus } from './sleep.js'
import { load, save } from './storage.js'

// First visit = the demo hasn't been seen and nothing has been saved yet
// (so people already using the app don't get the demo).
const firstVisit =
  !load('nigthy-demo-seen', false) &&
  load('nigthy-events', []).length === 0 &&
  load('nigthy-sleep', []).length === 0

function App() {
  // Which page is showing: "plan" or "stats".
  const [page, setPage] = useState('plan')
  // true while the demo is showing.
  const [demo, setDemo] = useState(firstVisit)
  // Start from the demo data, or from whatever was saved last time.
  const [events, setEvents] = useState(() => (firstVisit ? DEMO_EVENTS : load('nigthy-events', [])))
  // { Mon: true, Wed: false, ... } — a day missing here hasn't been answered.
  const [campus, setCampus] = useState(() => (firstVisit ? DEMO_CAMPUS : load('nigthy-campus', {})))
  // [{ date: "2026-10-24", bedTime: "23:30", wakeTime: "07:30" }, ...]
  const [sleepLog, setSleepLog] = useState(() => (firstVisit ? DEMO_SLEEP : load('nigthy-sleep', [])))

  // Save again whenever these change, but never save demo data.
  useEffect(() => {
    if (!demo) save('nigthy-events', events)
  }, [events, demo])
  useEffect(() => {
    if (!demo) save('nigthy-campus', campus)
  }, [campus, demo])
  useEffect(() => {
    if (!demo) save('nigthy-sleep', sleepLog)
  }, [sleepLog, demo])

  // Leave the demo: remember it was seen and switch to the real saved data.
  function skipDemo() {
    save('nigthy-demo-seen', true)
    setEvents(load('nigthy-events', []))
    setCampus(load('nigthy-campus', {}))
    setSleepLog(load('nigthy-sleep', []))
    setDemo(false)
    setPage('plan')
  }

  // Show the demo again (the real data stays saved and comes back on skip).
  function showDemo() {
    setEvents(DEMO_EVENTS)
    setCampus(DEMO_CAMPUS)
    setSleepLog(DEMO_SLEEP)
    setDemo(true)
    setPage('plan')
  }

  function addEvent(event) {
    setEvents([...events, { ...event, id: Date.now() }])
  }

  // Add many events at once (from a pasted schedule). Skips any that are
  // already there, so pasting the same schedule twice doesn't double it.
  function addEvents(newEvents) {
    const isSame = (a, b) =>
      a.day === b.day && a.startTime === b.startTime && a.type === b.type && a.mode === b.mode
    const fresh = newEvents.filter((n) => !events.some((e) => isSame(e, n)))
    setEvents([...events, ...fresh.map((event, i) => ({ ...event, id: Date.now() + i }))])
  }

  function deleteEvent(id) {
    setEvents(events.filter((event) => event.id !== id))
  }

  function setGoingToCampus(day, value) {
    setCampus({ ...campus, [day]: value })
  }

  // One entry per date: saving the same date again replaces the old one.
  function saveNight(entry) {
    setSleepLog([...sleepLog.filter((e) => e.date !== entry.date), entry])
  }

  function deleteNight(date) {
    setSleepLog(sleepLog.filter((e) => e.date !== date))
  }

  return (
    <main>
      <h1>Nigthy</h1>
      <p className="muted">Your sleep, wake, and leave times, based on your schedule.</p>

      {demo && (
        <p className="demo-banner">
          Demo with sample data. Look around and try both pages. Nothing here is saved.
        </p>
      )}

      <nav className="tabs">
        <button aria-pressed={page === 'plan'} onClick={() => setPage('plan')}>
          Plan
        </button>
        <button aria-pressed={page === 'stats'} onClick={() => setPage('stats')}>
          Sleep stats
        </button>
      </nav>

      {page === 'stats' ? (
        <SleepStats log={sleepLog} events={events} campus={campus} />
      ) : (
        <>
          <SleepLog log={sleepLog} onSave={saveNight} onDelete={deleteNight} />

          <ScheduleImport onAddAll={addEvents} />

          <EventForm onAdd={addEvent} />

          {DAYS.map((day) => (
            <DayCard
              key={day}
              day={day}
              events={events.filter((event) => event.day === day)}
              goingToCampus={campus[day]}
              onCampusChange={(value) => setGoingToCampus(day, value)}
              onDelete={deleteEvent}
              sleepStatus={describeStatus(sleepLog)}
            />
          ))}
        </>
      )}

      {demo ? (
        <button className="skip-demo" onClick={skipDemo}>
          Skip demo
        </button>
      ) : (
        <p className="muted footer">
          <button className="link" onClick={showDemo}>
            View demo
          </button>
        </p>
      )}
    </main>
  )
}

export default App
