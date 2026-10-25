# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

**Nigthy** is a planner for a Lehman College commuter student. It tells the user
when to **sleep**, **wake**, and **leave** each day based on their class schedule
and commute time.

- **Type:** class project, due **Monday, Oct 26, 2026**
- **Graded on:**
  1. A clear README spec
  2. A working MVP slice
  3. The student being able to explain every line of the code

Because of #3, clarity matters more than cleverness.

## Stack

- **Vite + React** web app (JavaScript)
- **PWA**, installable on an Android phone (web app manifest + service worker)
- **localStorage** for the sleep log. No backend, no database.
- Deployed to a live URL later (host TBD). Don't add deploy config until asked.

## MVP scope

1. **Schedule → plan:** the user enters their class schedule and commute time,
   and the app shows a bedtime, wake time, and leave time for each day.
2. **Sleep log:** the user records when they slept and woke. Saved in localStorage.

Anything beyond these two features is out of scope until the MVP works. If an
idea comes up, suggest it, but don't build it unless asked.

## Events model

The schedule is a list of **events**. Each event has:

| Field       | Values                       | Example     |
|-------------|------------------------------|-------------|
| `type`      | `"class"` or `"work"`        | `"class"`   |
| `mode`      | `"in-person"` or `"online"`  | `"in-person"` |
| `day`       | day of the week              | `"Mon"`     |
| `startTime` | 24-hour `"HH:MM"`            | `"09:30"`   |

## Planning rules

### Constants

| Setting      | Value  |
|--------------|--------|
| Sleep goal   | 8 hours |
| Get-ready    | 30 min |
| Commute      | 33 min |
| Delay buffer | 20 min (only in the morning window below) |

Keep these in one place in the code (e.g. a single settings object), so they're
easy to find and change.

### Going to campus (per day)

Each day can be marked **"going to campus: yes/no"**.

- **Yes:** plan from the **earliest in-person event** that day.
  - leave time = event start − commute (33 min)
  - if that leave time is between **6:00 and 9:30 AM**, subtract the
    **20 min delay buffer** too (early morning trains run about 20 min late)
  - wake time = leave time − get-ready (30 min), or earlier if an online
    event starts first (wake must be ≥ 30 min before the day's first event)
  - bedtime = wake time − sleep goal (8 h)
  - online-only day marked "yes": plan from the earliest online event
- **No:** no commute, buffer, or leave time is calculated. Plan from the
  earliest event that day (online):
  - wake time = event start − get-ready (30 min)
  - bedtime = wake time − sleep goal (8 h)

**Delay buffer check:** test the leave time *before* adding the buffer
(event start − commute). Treat 6:00 and 9:30 as inside the window.

Example: in-person class at 9:00 → 9:00 − 33 min = 8:27, which is in the window,
so leave at 8:07 → wake at 7:37 → bed at 11:37 PM the night before.

**Defaults:**
- Day has an in-person event → "going to campus" defaults to **yes**.
- Day has only online events → **ask the user** "yes or no".
- Day has no events → no plan; show the user's **sleep log status** instead,
  with a button to **add an event** if something comes up.

The user can always add an event to any day.

## Later (not MVP)

- **Syllabus + schedule upload:** the user uploads their schedule and class
  syllabus.
- **Gemini suggestions:** on online days, suggest better sleep habits and what
  to work on in the free time before online classes, based on the syllabus.
- **API key warning:** a Gemini API key must **never** go in the React code or
  in a `VITE_` env variable, since those are shipped to the browser and are
  public. Calling Gemini will need a small server or serverless function that
  holds the key. Plan this when we get there.

Don't build any of these until the MVP is done and I ask.

## How to work with me (I'm learning)

- **Explain every file you create or change** in simple English, in one
  sentence if possible: what it does and why it's there. Assume I'm new to
  React and Vite.
- **Keep it simple.** Pick the simplest way that works. No extra features or
  clever tricks.
- **Keep changes small.** Do one step at a time, so each change is easy to read
  and test. Don't do big refactors or touch many files in one go.
- **Prefer simple code I can explain.** Use plain React (useState, useEffect)
  and avoid extra libraries unless they're clearly needed. If you want to add a
  dependency, ask first and say why.
- **Short, helpful comments.** Comment the *why* and anything non-obvious,
  especially the time math (e.g. how bedtime is worked out from the first class).
- **Ask before you assume** on product decisions, like how many hours of sleep
  to aim for or how much buffer time to add before leaving.

## Security rules

- **Never put API keys, tokens, or secrets in code** or in any committed file.
- If a key is ever needed, put it in a `.env` file, make sure `.env` is listed
  in `.gitignore`, and commit a `.env.example` with placeholder values only.
- `VITE_` prefixed variables are bundled into the browser code and are public.
  Only use them for non-secret settings, never for API keys.
- Anything shipped to the browser is public, so keep secrets out of the
  frontend entirely.

## Current status

- README.md is the graded spec. Keep it in sync if the planning rules change.
- MVP feature 1 (daily plan) works:
  - `src/plan.js`: plan math (`planDay`, `formatTime`, `SETTINGS`, `DAYS`)
  - `src/storage.js`: `load`/`save` to localStorage (keys `nigthy-events`,
    `nigthy-campus`)
  - `src/App.jsx`: holds events + campus answers; `src/EventForm.jsx` adds
    events; `src/DayCard.jsx` shows one day and its plan
- MVP feature 2 (sleep log) works:
  - `src/sleep.js`: sleep math (`minutesSlept`, `describeStatus`, ...)
  - `src/SleepLog.jsx`: log form, 7-night summary, recent nights list
  - saved under localStorage key `nigthy-sleep`, one entry per date
  - no-event days show the 7-night summary
- Sleep stats page works: `src/SleepStats.jsx` (summary tiles, CSS bar
  chart of last 7 nights with an 8h goal line, table). `App.jsx` switches
  between "plan" and "stats" with a `page` state (no router).
- Not built yet: PWA setup (installable on Android) and deploying.
- Idea for later: one-tap "Going to bed" / "I'm awake" buttons to make
  logging faster. Automatic tracking isn't possible from a web app.

## Commands

- `npm install`: download the libraries the app needs (run once).
- `npm run dev`: start the app locally to try it in the browser.
- `npm run build`: make the final version for deploying (goes in `dist/`).
- `npm run preview`: try the built version locally.
- `npm run lint`: check the code for common mistakes (uses oxlint).
