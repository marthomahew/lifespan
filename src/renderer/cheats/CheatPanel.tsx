import { useState } from 'react';
import { CHEAT_GROUPS, CHEATS, type CheatGroup, type GameState } from '../../engine';
import { app } from '../store/app';
import { CheatForm } from './CheatForm';
import { Console } from './Console';
import { DebugTab } from './DebugTab';
import { EventsTab } from './EventsTab';

const EVENTS_EXTRA = new Set([
  'event.reroll',
  'category.toggle',
  'chains.list',
  'chain.fire',
  'event.fire',
  'events.list',
]);
const DEBUG_EXTRA = new Set(['state.size', 'deathbot', 'state.replace']);

/** The cheat panel: slides in from the right with tabs and a console along the bottom (SPEC §8). */
export function CheatPanel({ game }: { game: GameState }): React.JSX.Element {
  const [tab, setTab] = useState<CheatGroup>('character');
  const [status, setStatus] = useState<{ msg: string; ok: boolean } | null>(null);
  const onResult = (msg: string, ok: boolean): void => setStatus({ msg, ok });
  const defs = CHEATS.filter(
    (c) => c.group === tab && !EVENTS_EXTRA.has(c.id) && !DEBUG_EXTRA.has(c.id),
  );
  return (
    <aside
      className="cheat-panel"
      data-testid="cheat-panel"
      aria-label="Cheats"
      role="complementary"
    >
      <div className="cheat-head">
        <h2>🃏 Cheats</h2>
        <button
          className="ghost"
          aria-label="Close cheats"
          data-testid="cheat-close"
          onClick={() => app.set({ cheatsOpen: false })}
        >
          ✕
        </button>
      </div>
      <div className="cheat-tabs" role="tablist" aria-label="Cheat groups">
        {CHEAT_GROUPS.map((g) => (
          <button
            key={g.id}
            role="tab"
            aria-selected={tab === g.id}
            className={`cheat-tab${tab === g.id ? ' active' : ''}`}
            data-testid={`cheat-tab-${g.id}`}
            onClick={() => setTab(g.id)}
          >
            {g.label}
          </button>
        ))}
      </div>
      {status && (
        <p
          className={`cheat-status ${status.ok ? '' : 'error'}`}
          data-testid="cheat-status"
          role="status"
        >
          {status.msg}
        </p>
      )}
      <div className="cheat-body" role="tabpanel">
        {tab === 'events' && <EventsTab game={game} onResult={onResult} />}
        {tab === 'debug' && <DebugTab game={game} onResult={onResult} />}
        {defs.map((d) => (
          <CheatForm key={d.id} def={d} game={game} onResult={onResult} />
        ))}
        {tab !== 'events' && tab !== 'debug' && defs.length === 0 && (
          <p className="muted">More cheats arrive here as their systems do.</p>
        )}
      </div>
      <Console game={game} />
    </aside>
  );
}
