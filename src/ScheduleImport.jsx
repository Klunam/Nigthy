// Paste a whole schedule at once instead of adding events one by one.
// Shows a preview of what was understood before adding anything.
import { useState } from 'react'
import { parseSchedule } from './importSchedule.js'
import { formatTime, toMinutes } from './plan.js'

function ScheduleImport({ onAddAll }) {
  const [text, setText] = useState('')
  // Re-read the text on every keystroke, so the preview stays up to date.
  const { events, problems } = parseSchedule(text)

  function handleAddAll() {
    // Keep only the event fields (drop the "assumed" note used by the preview).
    onAddAll(
      events.map((e) => ({ type: e.type, mode: e.mode, day: e.day, startTime: e.startTime })),
    )
    setText('')
  }

  return (
    <details className="card">
      <summary>
        <h2>Paste your schedule</h2>
      </summary>

      <p className="muted">
        One class or shift per line, e.g. "Mon &amp; Wed 10AM In person". Add "Virtual" or
        "Online" for online classes; otherwise it counts as in-person.
      </p>

      <textarea
        rows={5}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={'Mon & Wed CMP 410 10AM In person\nTue & Thu 6:00PM Virtual'}
      />

      {events.length > 0 && (
        <ul className="events">
          {events.map((e, i) => (
            <li key={i}>
              {e.day} · {formatTime(toMinutes(e.startTime))} · {e.type} · {e.mode}
              {e.modeGuessed && <span className="muted"> (assumed)</span>}
            </li>
          ))}
        </ul>
      )}

      {problems.length > 0 && (
        <div className="muted">
          Couldn't read these lines (need a day and a time like 10AM or 6:00PM):
          <ul>
            {problems.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </div>
      )}

      <button onClick={handleAddAll} disabled={events.length === 0}>
        Add {events.length} {events.length === 1 ? 'event' : 'events'}
      </button>
    </details>
  )
}

export default ScheduleImport
