// One day of the week: its events, the "going to campus?" question, and the
// bedtime / wake / leave plan.
import { campusChoice, formatTime, planDay, toMinutes } from './plan.js'

function DayCard({ day, events, goingToCampus, onCampusChange, onDelete, sleepStatus }) {
  // No events: no plan, show how sleep has been going instead.
  if (events.length === 0) {
    return (
      <section className="card">
        <h2>{day}</h2>
        <p className="muted">No events. {sleepStatus}</p>
      </section>
    )
  }

  // In-person days default to "yes". Online-only days wait for an answer.
  const campus = campusChoice(events, goingToCampus)
  const plan = campus === null ? null : planDay(events, campus)

  const sorted = [...events].sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime))

  return (
    <section className="card">
      <h2>{day}</h2>

      <ul className="events">
        {sorted.map((event) => (
          <li key={event.id}>
            {formatTime(toMinutes(event.startTime))} · {event.type} · {event.mode}
            <button className="link" onClick={() => onDelete(event.id)}>
              Remove
            </button>
          </li>
        ))}
      </ul>

      <p>
        Going to campus?{' '}
        <button aria-pressed={campus === true} onClick={() => onCampusChange(true)}>
          Yes
        </button>{' '}
        <button aria-pressed={campus === false} onClick={() => onCampusChange(false)}>
          No
        </button>
      </p>

      {plan ? (
        <dl className="plan">
          {/* A negative bedtime means it falls the night before this day. */}
          <dt>Bedtime</dt>
          <dd>
            {formatTime(plan.bed)}
            {plan.bed < 0 && <span className="muted"> (night before)</span>}
          </dd>
          <dt>Wake</dt>
          <dd>{formatTime(plan.wake)}</dd>
          {plan.leave !== null && (
            <>
              <dt>Leave</dt>
              <dd>{formatTime(plan.leave)}</dd>
            </>
          )}
        </dl>
      ) : (
        <p className="muted">Answer above to see your plan.</p>
      )}
    </section>
  )
}

export default DayCard
