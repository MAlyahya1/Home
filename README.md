# Home

A simple, no-build-tools web app to keep household stuff organized:

- **Chores** — recurring and one-off tasks, assign to a person, mark done
- **Shopping list** — quick add/check-off items, grouped by category
- **Bills & reminders** — due dates with days-remaining and overdue highlighting

Everything is stored locally in the browser (`localStorage`) — no server, no
account, no build step. Just open `index.html`, or serve the folder with any
static file server.

## Usage

Open directly:

```
open index.html   # or just double-click it
```

Or serve it (recommended, avoids browser file:// restrictions in some browsers):

```
python3 -m http.server 8080
# then visit http://localhost:8080
```

## Project layout

```
index.html   - app shell / layout
style.css    - styling (light/dark aware)
app.js       - all app logic (state, rendering, localStorage persistence)
```

## Features

- Add / complete / delete chores, with optional assignee and recurrence
  (daily, weekly, monthly)
- Recurring chores automatically reschedule to their next due date when
  completed
- Shopping list with categories and a "clear checked items" action
- Bills list with due dates, sorted soonest-first, overdue items flagged
- All data persists per-browser via `localStorage` — no backend required
- Responsive layout, works on phone or desktop

## Notes

Data lives only in the browser that adds it. If multiple people need a
shared view, host this folder somewhere reachable by everyone (e.g. a Pi on
the home network, or any static hosting) — everyone visiting the same URL in
the same browser profile will share that browser's local storage, but
different browsers/devices will NOT automatically sync with each other.
Syncing across devices would need a small backend, which isn't included here
to keep things simple.
