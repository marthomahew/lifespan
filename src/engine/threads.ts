import type { GameState } from './types';

/** An open storyline worth keeping in view: a book half-written, a sentence part-served, a promise. */
export type Thread = { id: string; icon: string; label: string; detail: string; progress?: number };

export function openThreads(s: GameState): Thread[] {
  const out: Thread[] = [];
  const n = s.projects?.novel;
  if (n) {
    if (n.stage === 'drafting')
      out.push({
        id: 'novel',
        icon: '📖',
        label: n.title,
        detail: `${n.progress}% of a draft`,
        progress: n.progress,
      });
    else if (n.stage === 'querying')
      out.push({
        id: 'novel',
        icon: '✉️',
        label: n.title,
        detail: n.rejections
          ? `with agents · ${n.rejections} rejection${n.rejections === 1 ? '' : 's'}`
          : 'with agents',
      });
    else if (n.publishedYear !== undefined && s.year - n.publishedYear <= 2)
      out.push({ id: 'novel', icon: '📚', label: n.title, detail: `published ${n.publishedYear}` });
  }
  if (s.family.pregnancy)
    out.push({
      id: 'baby',
      icon: '👶',
      label: 'A baby on the way',
      detail: `due ${s.family.pregnancy.due}`,
    });
  const p = s.legal.prison;
  if (p)
    out.push({
      id: 'prison',
      icon: '🔒',
      label: 'Serving time',
      detail: `${p.served} of ${p.years} years`,
      progress: Math.round((100 * p.served) / Math.max(1, p.years)),
    });
  const f = s.legal.fugitive;
  if (f)
    out.push({
      id: 'run',
      icon: '🏃',
      label: 'On the run',
      detail: `${s.year - f.since} years out, ${f.owed} owed`,
    });
  const e = s.education.enrollment;
  if (e)
    out.push({
      id: 'study',
      icon: '🎓',
      label: 'Studying',
      detail: `year ${e.year + 1} of ${e.length}`,
      progress: Math.round((100 * e.year) / Math.max(1, e.length)),
    });
  // Stories still unfolding with someone: named, but not spoiled.
  const seen = new Set<number>();
  for (const c of s.chains) {
    const id = Object.values(c.bindings)[0];
    const npc = id === undefined ? undefined : s.npcs.find((x) => x.id === id && x.alive);
    if (!npc || seen.has(npc.id)) continue;
    seen.add(npc.id);
    out.push({
      id: `chain-${npc.id}`,
      icon: '🧵',
      label: `Something with ${npc.first}`,
      detail: 'is still unfolding',
    });
    if (seen.size >= 3) break;
  }
  return out;
}
