// The "Sleep stats" page: weekly numbers, a bar chart of the last 7 nights,
// and a table with the same data.
import { SETTINGS, formatTime, toMinutes } from './plan.js'
import {
  bedtimeVsPlan,
  formatDuration,
  formatVsPlan,
  minutesSlept,
  recentNights,
  weekSummary,
} from './sleep.js'

// The chart's top is 10 hours, or higher if a night was longer.
const MIN_CHART_TOP = 10 * 60

function SleepStats({ log, events, campus }) {
  const summary = weekSummary(log)

  if (!summary) {
    return (
      <section className="card">
        <h2>Sleep stats</h2>
        <p className="muted">Log a few nights on the Plan page to see your stats.</p>
      </section>
    )
  }

  // Oldest night on the left, newest on the right.
  const nights = recentNights(log).reverse()
  const chartTop = Math.max(MIN_CHART_TOP, ...nights.map(minutesSlept))
  const goalPercent = (SETTINGS.sleepGoal / chartTop) * 100

  // Bedtime vs plan for each night (null when that day had no plan).
  const vsPlan = Object.fromEntries(
    nights.map((entry) => [entry.date, bedtimeVsPlan(entry, events, campus)]),
  )
  const planned = Object.values(vsPlan).filter((diff) => diff !== null)
  const averageVsPlan =
    planned.length > 0 ? Math.round(planned.reduce((sum, d) => sum + d, 0) / planned.length) : null

  return (
    <>
      <section className="card">
        <h2>Last 7 nights</h2>
        <div className="tiles">
          <div className="tile">
            <span className="muted">Average per night</span>
            <strong>{formatDuration(summary.average)}</strong>
          </div>
          <div className="tile">
            <span className="muted">Total slept</span>
            <strong>{formatDuration(summary.total)}</strong>
          </div>
          <div className="tile">
            <span className="muted">Nights at 8h+</span>
            <strong>
              {summary.hitGoal} of {summary.count}
            </strong>
          </div>
          <div className="tile">
            <span className="muted">Sleep debt</span>
            <strong>{summary.debt === 0 ? 'None' : formatDuration(summary.debt)}</strong>
          </div>
        </div>
        {summary.debt > 0 && (
          <p>You're {formatDuration(summary.debt)} behind your sleep goal over these nights.</p>
        )}
        {averageVsPlan !== null && (
          <p>On average you went to bed {formatVsPlan(averageVsPlan)} compared to your plan.</p>
        )}
        {summary.count < 7 && (
          <p className="muted">
            {summary.count} of 7 nights logged. The full week fills in as you log.
          </p>
        )}
      </section>

      <section className="card">
        <h2>Hours slept</h2>
        <div className="legend">
          <span>
            <i className="swatch" /> 8h or more
          </span>
          <span>
            <i className="swatch short" /> Under 8h
          </span>
          <span>
            <i className="swatch goal" /> {SETTINGS.sleepGoal / 60}h goal
          </span>
        </div>

        <div className="chart" role="img" aria-label="Bar chart of hours slept for the last 7 nights">
          {/* Dashed line at the sleep goal. */}
          <div className="goal-line" style={{ bottom: `${goalPercent}%` }} />

          {nights.map((entry) => {
            const slept = minutesSlept(entry)
            // Short nights get a different color so they stand out.
            const isShort = slept < SETTINGS.sleepGoal
            return (
              <div
                key={entry.date}
                className={isShort ? 'bar short' : 'bar'}
                style={{ height: `${(slept / chartTop) * 100}%` }}
                title={`${entry.date}: ${formatDuration(slept)}`}
              >
                {/* Hours on the bar, e.g. 7.5h, so it's readable on a phone. */}
                <span>{Math.round((slept / 60) * 10) / 10}h</span>
              </div>
            )
          })}
        </div>
        <div className="chart-labels">
          {nights.map((entry) => (
            <span key={entry.date}>{entry.date.slice(5)}</span>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Nights</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Bed</th>
              <th>Wake</th>
              <th>Slept</th>
              <th>Bed vs plan</th>
            </tr>
          </thead>
          <tbody>
            {[...nights].reverse().map((entry) => (
              <tr key={entry.date}>
                <td>{entry.date.slice(5)}</td>
                <td>{formatTime(toMinutes(entry.bedTime))}</td>
                <td>{formatTime(toMinutes(entry.wakeTime))}</td>
                <td>{formatDuration(minutesSlept(entry))}</td>
                <td>{vsPlan[entry.date] === null ? '–' : formatVsPlan(vsPlan[entry.date])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  )
}

export default SleepStats
