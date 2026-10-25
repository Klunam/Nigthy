# Nigthy

Nigthy is a sleep planner for commuter students. You enter your weekly classes
and work shifts, and it tells you when to go to bed, when to wake up, and when
to leave for campus.

## The problem

I'm a commuter student at Lehman College. My classes start at different times
each day, my commute is 33 minutes, and morning trains are often 20 minutes
late. Working out a bedtime in my head every night is easy to get wrong, so I
end up sleeping too little or running late.

## Who it's for

Commuter students with a schedule that changes day to day, who want a simple
daily plan on their phone.

## MVP features

### 1. Daily plan

The user adds their events. Each event has:

| Field      | Values                    | Example       |
|------------|---------------------------|---------------|
| Type       | class or work             | class         |
| Mode       | in-person or online       | in-person     |
| Day        | Mon–Sun                   | Mon           |
| Start time | 24-hour time              | 09:30         |

For each day, the app shows a **bedtime**, **wake time**, and, on campus days,
a **leave time**.

### 2. Sleep log

The user logs the date they woke up, when they went to bed, and when they woke
up. The app shows how long each night was, plus a summary of the last 7
nights: the average and how many hit the 8-hour goal. Logging the same date
again replaces that night. The log is saved on the device, so it's still there
after closing the app.

### 3. Sleep stats page

A "Sleep stats" tab shows the last 7 nights:

- **Average per night** and **total slept**
- **Nights at 8h+**
- **Sleep debt:** how far the short nights fell below 8 hours, added up. Long
  nights don't cancel out short ones. Example: 8h, 5h, 9h → 3h of debt.
- **Bedtime vs plan:** how much earlier or later the user went to bed than the
  plan said, per night and on average. Example: planned 11:37 PM, went to bed
  at 1:00 AM → "1h 23m late". Days with no plan show "–".
- A bar chart of hours slept, with a line at the 8-hour goal. Nights under 8h
  are a different color.
- A table with each night's bed, wake, total time, and bedtime vs plan.

Sleep is logged by hand. A web app can't read the phone's sleep sensors, so
fully automatic tracking would need a native app.

## How the plan is calculated

**Settings:**

| Setting      | Value   |
|--------------|---------|
| Sleep goal   | 8 hours |
| Get-ready    | 30 min  |
| Commute      | 33 min  |
| Train delay buffer | 20 min, only if leaving between 6:00 and 9:30 AM |

**Going to campus (yes/no):**

- A day with an in-person event defaults to **yes**.
- A day with only online events **asks the user** yes or no.
- A day with no events shows the user's **sleep log status** instead of a plan.
- The user can add an event to any day.

**On a campus day (yes):** the plan starts from the earliest in-person event.

1. Leave time = event start − 33 min commute
2. If that leave time is between 6:00 and 9:30 AM, leave 20 min earlier for
   train delays
3. Wake time = leave time − 30 min to get ready, or earlier if an online
   event starts before that
4. Bedtime = wake time − 8 hours

If an online-only day is marked "yes", the plan starts from the earliest
online event instead.

**On a home day (no):** no leave time. The plan starts from the earliest event.

1. Wake time = event start − 30 min to get ready
2. Bedtime = wake time − 8 hours

**Example:** in-person class Monday at 9:00 AM.

| Step | Time |
|------|------|
| 9:00 − 33 min commute | 8:27 AM (inside 6:00–9:30, so add buffer) |
| Leave (− 20 min buffer) | 8:07 AM |
| Wake (− 30 min get-ready) | 7:37 AM |
| Bedtime (− 8 hours) | 11:37 PM Sunday night |

## User flow

1. Open the app and add events for the week.
2. See each day's bedtime, wake time, and leave time.
3. For online-only days, answer "going to campus?" yes or no.
4. Each morning, log last night's sleep.

## Tech stack

- **Vite + React**: builds the web app.
- **PWA**: lets the app be installed on an Android phone like a normal app,
  and open with no internet (useful underground on the train). It uses a
  manifest (name, icon, colors) and a small service worker that saves the
  app's files on the phone.
- **localStorage**: saves events and the sleep log in the browser, with no
  server or account needed.
- Deployed to a live URL (link to be added).

## Out of scope (future ideas)

- Uploading a schedule and class syllabus.
- AI (Gemini) suggestions for better sleep habits and what to work on before
  online classes. This would need a small server to keep the API key secret.
- User accounts or syncing between devices.
- Notifications and alarms.

## Privacy

All data stays in the user's browser on their own device. Nothing is sent to a
server, and the code contains no API keys.

## Running locally

_Coming soon, once the app is set up._

## Live demo

_Link coming soon._
