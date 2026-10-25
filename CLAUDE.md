# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

**Nigthy** is a planner for a Lehman College commuter student. It tells the user
when to **sleep**, **wake**, and **leave** each day based on their class schedule
and commute time.

- **Type:** CMP 464/343 Product 1, due **Monday, Nov 2, 2026**.
  Presentations in class Mon Nov 2 / Wed Nov 4 (~5 min + questions).
- **Graded on (equal thirds):**
  1. **Spec:** README.md follows the course template (About me, Problem
     statement, Existing solutions, Features with MVP/Later/Not doing, Tech
     stack with reasons + Mermaid diagram, Open questions) and matches what
     was built
  2. **Repo + demo:** real code, many small commits, no secrets, a Demo
     section (live URL + screenshots in `docs/screenshots/`)
  3. **Code review:** the student explains the code, design choices, and AI use

Because of #3, clarity matters more than cleverness. Keep README.md in sync
with any feature change. The spec sections use the student's own words from
their draft; don't rewrite their voice.

## Stack

- **Vite + React** web app (JavaScript)
- **PWA**, installable on an Android phone (web app manifest + service worker)
- **localStorage** for all data. No backend, no database.
- Hosted on Netlify (see Current status).

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
- **Google Maps commute time:** use real transit times from home to Lehman
  instead of the fixed 33 min. Needs an API key, so same server rule as below.
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
- Sleep stats page works: `src/SleepStats.jsx` (average / total / nights at
  8h+ tiles, CSS bar chart of last 7 nights with an 8h goal line, short nights
  in amber with a legend and hours on each bar, table).
  - Sleep debt = sum of `max(0, goal − slept)` over the last 7 nights
    (`weekSummary().debt` in `src/sleep.js`).
  - Bedtime vs plan = actual bedtime − planned bedtime for the day the user
    woke up (`bedtimeVsPlan` in `src/sleep.js`), kept within ±12h. Uses
    `campusChoice` from `src/plan.js`, the same default rule as `DayCard`.
- Schedule import (paste text): `src/importSchedule.js` (`parseSchedule`
  returns `{ events, problems }`; plain JS) and `src/ScheduleImport.jsx`
  (paste box + preview). `App.addEvents` skips duplicates. A number is only
  a time if it has `:` or AM/PM. No mode written → in-person, marked
  `modeGuessed` for the preview only (not saved).
- First-time demo: `src/demo.js` holds sample events, campus answers, and
  nights. `App.jsx` starts in demo mode only if `nigthy-demo-seen` isn't set
  and nothing is saved yet. In demo mode the save effects are skipped.
  "Skip demo" sets the flag and loads the real saved data; "View demo"
  brings the demo back without touching saved data.
- Colors live as CSS variables at the top of `src/index.css` (midnight blue
  theme). Chart colors were checked for contrast and colorblind safety. `App.jsx` switches
  between "plan" and "stats" with a `page` state (no router).
- PWA setup done (hand-written, no plugin):
  - `public/manifest.webmanifest`: name, colors, icons for install
  - `public/sw.js`: service worker, network-first with a cache fallback so the
    app opens offline. Registered in `src/main.jsx` only in production builds.
    Bump `CACHE` (e.g. `nigthy-v2`) if caching ever needs a fresh start.
  - `public/icon.svg` is the source icon; `icon-192.png` / `icon-512.png` were
    made from it with `sips` (macOS)
- Deployed on Netlify: https://vermillion-bubblegum-896cf3.netlify.app
  - GitHub repo: https://github.com/Klunam/Nigthy (public, branch `main`)
  - Netlify rebuilds on every push to `main` (`npm run build` → `dist`)
  - `.nvmrc` pins Node 22; `public/_headers` sets the manifest content type
- Pushing to `main` publishes to the live site, so only push when asked.
- Idea for later: one-tap "Going to bed" / "I'm awake" buttons to make
  logging faster. Automatic tracking isn't possible from a web app.

## Commands

- `npm install`: download the libraries the app needs (run once).
- `npm run dev`: start the app locally to try it in the browser.
- `npm run build`: make the final version for deploying (goes in `dist/`).
- `npm run preview`: try the built version locally.
- `npm run lint`: check the code for common mistakes (uses oxlint).
