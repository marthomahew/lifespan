/** Challenges you have completed, across every life (kept beside the settings). */
const KEY = 'lifespan.challenges';

export function loadCompleted(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? '[]') as unknown;
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function markCompleted(id: string): void {
  try {
    const done = loadCompleted();
    if (!done.includes(id)) localStorage.setItem(KEY, JSON.stringify([...done, id]));
  } catch {
    // Storage unavailable: the life itself still records the win.
  }
}
