// The main screen. It holds the events and campus answers, saves them,
// and shows the add-event form plus one card per day.
import { useEffect, useState } from 'react'
import DayCard from './DayCard.jsx'
import EventForm from './EventForm.jsx'
import SleepLog from './SleepLog.jsx'
import { DAYS } from './plan.js'
import { describeStatus } from './sleep.js'
import { load, save } from './storage.js'

function App() {
  // Start from whatever was saved last time (or empty).
  const [events, setEvents] = useState(() => load('nigthy-events', []))
  // { Mon: true, Wed: false, ... } — a day missing here hasn't been answered.
  const [campus, setCampus] = useState(() => load('nigthy-campus', {}))
  // [{ date: "2026-10-24", bedTime: "23:30", wakeTime: "07:30" }, ...]
  const [sleepLog, setSleepLog] = useState(() => load('nigthy-sleep', []))

  // Save again whenever these change.
  useEffect(() => save('nigthy-events', events), [events])
  useEffect(() => save('nigthy-campus', campus), [campus])
  useEffect(() => save('nigthy-sleep', sleepLog), [sleepLog])

  function addEvent(event) {
    setEvents([...events, { ...event, id: Date.now() }])
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

      <SleepLog log={sleepLog} onSave={saveNight} onDelete={deleteNight} />

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
    </main>
  )
}

export default App
