import { START, type Draft } from '../screens/newlife/useNewLife';

/** Saved New Life setups, kept on this computer beside the settings (they survive new builds). */
const KEY = 'lifespan.templates';

export type Template = { id: string; name: string; draft: Draft };

export function loadTemplates(): Template[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? '[]') as unknown;
    if (!Array.isArray(v)) return [];
    return v.flatMap((x: unknown): Template[] => {
      if (!x || typeof x !== 'object') return [];
      const t = x as Partial<Template>;
      if (typeof t.id !== 'string' || typeof t.name !== 'string' || !t.draft) return [];
      // Fields added to the form since the template was saved take their defaults.
      return [{ id: t.id, name: t.name, draft: { ...START, ...t.draft } }];
    });
  } catch {
    return [];
  }
}

function store(list: Template[]): Template[] {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // Storage unavailable: the list lasts for this session only.
  }
  return list;
}

/** Save a setup under a name; the same name replaces the older one. */
export function saveTemplate(name: string, draft: Draft): Template[] {
  const clean = name.trim().slice(0, 40) || 'Untitled';
  const rest = loadTemplates().filter((t) => t.name.toLowerCase() !== clean.toLowerCase());
  const id = `t${rest.reduce((m, t) => Math.max(m, Number(t.id.slice(1)) || 0), 0) + 1}`;
  return store([...rest, { id, name: clean, draft }]);
}

export function renameTemplate(id: string, name: string): Template[] {
  const clean = name.trim().slice(0, 40);
  if (!clean) return loadTemplates();
  return store(loadTemplates().map((t) => (t.id === id ? { ...t, name: clean } : t)));
}

export function deleteTemplate(id: string): Template[] {
  return store(loadTemplates().filter((t) => t.id !== id));
}
