// The form for adding one event (a class or work shift) to the schedule.
import { useState } from 'react'
import { DAYS } from './plan.js'

function EventForm({ onAdd }) {
  const [type, setType] = useState('class')
  const [mode, setMode] = useState('in-person')
  const [day, setDay] = useState('Mon')
  const [startTime, setStartTime] = useState('')

  function handleSubmit(e) {
    e.preventDefault() // stop the browser from reloading the page
    if (!startTime) return
    onAdd({ type, mode, day, startTime })
    setStartTime('') // clear the time, keep the rest for quick re-entry
  }

  return (
    <form className="card event-form" onSubmit={handleSubmit}>
      <h2>Add an event</h2>

      <label>
        Type
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="class">Class</option>
          <option value="work">Work</option>
        </select>
      </label>

      <label>
        Mode
        <select value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="in-person">In-person</option>
          <option value="online">Online</option>
        </select>
      </label>

      <label>
        Day
        <select value={day} onChange={(e) => setDay(e.target.value)}>
          {DAYS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </label>

      <label>
        Start time
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
        />
      </label>

      <button type="submit">Add event</button>
    </form>
  )
}

export default EventForm
