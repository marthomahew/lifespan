import { loadRecords } from '../store/records';
import { DEFAULT_LOOK } from '../../engine/look';
import { Portrait } from '../portrait/Portrait';
import { useEffect, useState } from 'react';
import { parseSaveFile, type SaveSummary } from '../../engine';
import { go, loadLife, saveStore, useApp } from '../store/app';

export type LifeRow = { id: string; summary: SaveSummary };

export async function listLives(): Promise<LifeRow[]> {
  const metas = await saveStore.list();
  const rows: LifeRow[] = [];
  for (const m of metas) {
    const json = await saveStore.read(m.id);
    if (!json) continue;
    try {
      rows.push({ id: m.id, summary: parseSaveFile(json).summary });
    } catch {
      // Damaged saves are skipped here; the Lives screen shows them.
    }
  }
  return rows.sort((a, b) => b.summary.savedAt - a.summary.savedAt);
}

export function StartScreen(): React.JSX.Element {
  const [latest, setLatest] = useState<LifeRow | null>(null);
  const version = useApp((s) => s.savesVersion);
  useEffect(() => {
    let live = true;
    void listLives().then((rows) => live && setLatest(rows.find((r) => !r.summary.dead) ?? null));
    return () => {
      live = false;
    };
  }, [version]);
  return (
    <div className="start" data-testid="start-screen">
      <div className="start-card card">
        <div className="logo" aria-hidden="true">
          🌱
        </div>
        <h1>Lifespan</h1>
        <p className="life-strip" aria-hidden="true">
          {[1, 8, 30, 75].map((age) => (
            <Portrait
              key={age}
              look={STRIP_LOOK}
              age={age}
              gender="female"
              size={age === 30 ? 44 : 36}
            />
          ))}
        </p>
        <p className="muted">A whole life, one year at a time.</p>
        <div className="col start-actions">
          {latest && (
            <button
              className="primary"
              data-testid="btn-continue"
              onClick={() => void loadLife(latest.id)}
            >
              {latest.summary.look && (
                <Portrait
                  look={latest.summary.look}
                  age={latest.summary.age}
                  gender={latest.summary.gender ?? 'nonbinary'}
                  size={28}
                />
              )}
              Continue as {latest.summary.first} {latest.summary.last}, {latest.summary.age}
            </button>
          )}
          <button
            className={latest ? '' : 'primary'}
            data-testid="btn-new-life"
            onClick={() => go('new')}
          >
            New Life
          </button>
          <div className="row start-secondary">
            <button className="ghost" data-testid="btn-start-lives" onClick={() => go('lives')}>
              🗂️ Lives
            </button>
            <button
              className="ghost"
              data-testid="btn-start-settings"
              onClick={() => go('settings')}
            >
              ⚙️ Settings
            </button>
          </div>
        </div>
        <RecordsCard />
      </div>
      <p className="start-foot muted small">No ads, no timers, no paywalls. Just a life.</p>
    </div>
  );
}

/** The best marks across every life lived here. */
function RecordsCard(): React.JSX.Element | null {
  const r = loadRecords();
  if (!r.lives) return null;
  const rows: [string, string][] = [];
  if (r.oldest) rows.push(['Oldest', `${r.oldest.who} · ${r.oldest.value}`]);
  if (r.richest)
    rows.push(['Richest (today’s dollars)', `${r.richest.who} · ${formatRef(r.richest.value)}`]);
  if (r.mostChildren)
    rows.push(['Most children', `${r.mostChildren.who} · ${r.mostChildren.value}`]);
  if (r.mostAchievements)
    rows.push(['Most achievements', `${r.mostAchievements.who} · ${r.mostAchievements.value}`]);
  return (
    <section className="records card pad" data-testid="records" aria-label="Records">
      <h2 className="section-title">
        Records · {r.lives} {r.lives === 1 ? 'life' : 'lives'} lived
      </h2>
      <dl>
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt className="muted small">{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** Today's dollars, short. */
function formatRef(v: number): string {
  const a = Math.abs(v);
  const s =
    a >= 1e6 ? `$${(a / 1e6).toFixed(1)}M` : a >= 1e3 ? `$${Math.round(a / 1e3)}k` : `$${a}`;
  return v < 0 ? `−${s}` : s;
}

/** One face for the strip, growing up and growing old. */
const STRIP_LOOK = {
  ...DEFAULT_LOOK,
  skin: 3,
  hair: 'curly',
  hairColor: 'auburn',
  eyeColor: 'green',
  topColor: 2,
} as const;
