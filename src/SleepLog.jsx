// The sleep log: a form to record a night, a summary, and the last 7 nights.
import { useState } from 'react'
import { formatTime, toMinutes } from './plan.js'
import { describeStatus, formatDuration, minutesSlept, recentNights } from './sleep.js'

// Today's date as "YYYY-MM-DD" in local time (the format date inputs use).
function today() {
  return new Date().toLocaleDateString('en-CA')
}

function SleepLog({ log, onSave, onDelete }) {
  const [date, setDate] = useState(today)
  const [bedTime, setBedTime] = useState('')
  const [wakeTime, setWakeTime] = useState('')

  function handleSubmit(e) {
    e.preventDefault() // stop the browser from reloading the page
    if (!date || !bedTime || !wakeTime) return
    onSave({ date, bedTime, wakeTime })
    setBedTime('')
    setWakeTime('')
  }

  return (
    <section className="card">
      <h2>Sleep log</h2>
      <p>{describeStatus(log)}</p>

      <form className="event-form" onSubmit={handleSubmit}>
        <label>
          Woke up on
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </label>
        <label>
          Went to bed
          <input type="time" value={bedTime} onChange={(e) => setBedTime(e.target.value)} required />
        </label>
        <label>
          Woke up
          <input type="time" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)} required />
        </label>
        <button type="submit">Save night</button>
      </form>

      <ul className="events">
        {recentNights(log).map((entry) => (
          <li key={entry.date}>
            {entry.date}: {formatTime(toMinutes(entry.bedTime))} →{' '}
            {formatTime(toMinutes(entry.wakeTime))} ({formatDuration(minutesSlept(entry))})
            <button className="link" onClick={() => onDelete(entry.date)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default SleepLog
