// The "Sleep stats" page: weekly numbers, a bar chart of the last 7 nights,
// and a table with the same data.
import { SETTINGS, formatTime, toMinutes } from './plan.js'
import { formatDuration, minutesSlept, recentNights, weekSummary } from './sleep.js'

// The chart's top is 10 hours, or higher if a night was longer.
const MIN_CHART_TOP = 10 * 60

function SleepStats({ log }) {
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

  return (
    <>
      <section className="card">
        <h2>This week</h2>
        <div className="tiles">
          <div className="tile">
            <span className="muted">Average sleep</span>
            <strong>{formatDuration(summary.average)}</strong>
          </div>
          <div className="tile">
            <span className="muted">Nights at 8h+</span>
            <strong>
              {summary.hitGoal} of {summary.count}
            </strong>
          </div>
        </div>
        {summary.count < 7 && (
          <p className="muted">
            {summary.count} of 7 nights logged. The full week fills in as you log.
          </p>
        )}
      </section>

      <section className="card">
        <h2>Hours slept</h2>
        <div className="chart" role="img" aria-label="Bar chart of hours slept for the last 7 nights">
          {/* Dashed line at the sleep goal. */}
          <div className="goal-line" style={{ bottom: `${goalPercent}%` }}>
            <span>{SETTINGS.sleepGoal / 60}h goal</span>
          </div>

          {nights.map((entry) => (
            <div
              key={entry.date}
              className="bar"
              style={{ height: `${(minutesSlept(entry) / chartTop) * 100}%` }}
              title={`${entry.date}: ${formatDuration(minutesSlept(entry))}`}
            />
          ))}
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
            </tr>
          </thead>
          <tbody>
            {[...nights].reverse().map((entry) => (
              <tr key={entry.date}>
                <td>{entry.date.slice(5)}</td>
                <td>{formatTime(toMinutes(entry.bedTime))}</td>
                <td>{formatTime(toMinutes(entry.wakeTime))}</td>
                <td>{formatDuration(minutesSlept(entry))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  )
}

export default SleepStats
