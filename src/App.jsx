// The main screen. It holds the events and campus answers, saves them,
// and shows the add-event form plus one card per day.
import { useEffect, useState } from 'react'
import DayCard from './DayCard.jsx'
import EventForm from './EventForm.jsx'
import { DAYS } from './plan.js'
import { load, save } from './storage.js'

function App() {
  // Start from whatever was saved last time (or empty).
  const [events, setEvents] = useState(() => load('nigthy-events', []))
  // { Mon: true, Wed: false, ... } — a day missing here hasn't been answered.
  const [campus, setCampus] = useState(() => load('nigthy-campus', {}))

  // Save again whenever these change.
  useEffect(() => save('nigthy-events', events), [events])
  useEffect(() => save('nigthy-campus', campus), [campus])

  function addEvent(event) {
    setEvents([...events, { ...event, id: Date.now() }])
  }

  function deleteEvent(id) {
    setEvents(events.filter((event) => event.id !== id))
  }

  function setGoingToCampus(day, value) {
    setCampus({ ...campus, [day]: value })
  }

  return (
    <main>
      <h1>Nigthy</h1>
      <p className="muted">Your sleep, wake, and leave times, based on your schedule.</p>

      <EventForm onAdd={addEvent} />

      {DAYS.map((day) => (
        <DayCard
          key={day}
          day={day}
          events={events.filter((event) => event.day === day)}
          goingToCampus={campus[day]}
          onCampusChange={(value) => setGoingToCampus(day, value)}
          onDelete={deleteEvent}
        />
      ))}
    </main>
  )
}

export default App
