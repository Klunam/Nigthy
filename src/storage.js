// Saves and loads data in the browser's localStorage, so it's still there
// after the app is closed.

export function load(key, fallback) {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : fallback
  } catch {
    // Storage blocked or data broken: start fresh instead of crashing.
    return fallback
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage full or blocked: the app still works, it just won't remember.
  }
}
