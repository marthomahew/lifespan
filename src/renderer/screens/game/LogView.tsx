import { useEffect, useMemo, useRef, useState } from 'react';
import { categoryEmoji, type GameState, type LogEntry } from '../../../engine';

const PAGE_AGES = 40;
const EXTRA_EMOJI: Record<string, string> = {
  system: '📌',
  death: '🕯️',
  achievement: '🏆',
  activity: '🎯',
};

type Group = { age: number; year: number; entries: { e: LogEntry; i: number }[] };

export function groupByAge(log: LogEntry[]): Group[] {
  const out: Group[] = [];
  log.forEach((e, i) => {
    const last = out[out.length - 1];
    if (last && last.age === e.age) last.entries.push({ e, i });
    else out.push({ age: e.age, year: e.year, entries: [{ e, i }] });
  });
  return out;
}

/** The life log: grouped by age with sticky headers, newest at the bottom, auto-scrolling. */
export function LogView({ game }: { game: GameState }): React.JSX.Element {
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('all');
  const [pages, setPages] = useState(1);
  const ref = useRef<HTMLDivElement>(null);
  const log = game.log;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q && cat === 'all') return log;
    return log.filter(
      (e) => (cat === 'all' || e.cat === cat) && (!q || e.text.toLowerCase().includes(q)),
    );
  }, [log, query, cat]);
  const groups = useMemo(() => groupByAge(filtered), [filtered]);
  // Paginate by age so very long logs stay smooth (SPEC §9.9).
  const shown = groups.slice(Math.max(0, groups.length - PAGE_AGES * pages));
  const hidden = groups.length - shown.length;
  const cats = useMemo(() => [...new Set(log.map((e) => e.cat))].sort(), [log]);

  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [log.length, query, cat]);

  return (
    <section className="log-wrap card" aria-label="Life log">
      <div className="log-tools">
        <input
          type="search"
          placeholder="Search your life"
          aria-label="Search the log"
          data-testid="log-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          aria-label="Filter by category"
          data-testid="log-filter"
          value={cat}
          onChange={(e) => setCat(e.target.value)}
        >
          <option value="all">All</option>
          {cats.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="log" ref={ref} data-testid="log" tabIndex={0}>
        {hidden > 0 && (
          <button
            className="ghost more"
            data-testid="log-more"
            onClick={() => setPages((p) => p + 1)}
          >
            Show {Math.min(hidden, PAGE_AGES)} earlier years
          </button>
        )}
        {shown.map((g) => (
          <div
            className="log-group"
            key={`${g.age}-${g.entries[0]?.i ?? 0}`}
            data-testid={`log-age-${g.age}`}
          >
            <h4 className="log-age">
              Age {g.age} <span className="muted">· {g.year}</span>
            </h4>
            {g.entries.map(({ e, i }) => (
              <p
                key={i}
                className={`log-line cat-${e.cat}${e.milestone ? ' milestone' : ''}`}
                data-testid="log-line"
              >
                <span className="log-emoji" aria-hidden="true">
                  {EXTRA_EMOJI[e.cat] ?? categoryEmoji(e.cat)}
                </span>
                <span>{e.text}</span>
              </p>
            ))}
          </div>
        ))}
        {filtered.length === 0 && <p className="muted pad">Nothing matches.</p>}
      </div>
    </section>
  );
}
