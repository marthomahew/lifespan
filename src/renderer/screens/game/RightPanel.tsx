import { useEffect, useRef } from 'react';
import type { GameState } from '../../../engine';
import { app, useApp, type Tab } from '../../store/app';
import { OccupationTab } from './tabs/OccupationTab';
import { AssetsTab } from './tabs/AssetsTab';
import { RelationshipsTab } from './tabs/RelationshipsTab';
import { ActivitiesTab } from './tabs/ActivitiesTab';

export const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: 'occupation', label: 'Occupation', emoji: '💼' },
  { id: 'assets', label: 'Assets', emoji: '🏠' },
  { id: 'relationships', label: 'Relationships', emoji: '❤️' },
  { id: 'activities', label: 'Activities', emoji: '🎯' },
];

export function RightPanel({ game }: { game: GameState }): React.JSX.Element {
  const panel = useRef<HTMLDivElement>(null);
  const tab = useApp((s) => s.tab);
  const feedback = useApp((s) => s.feedback);
  const fresh =
    feedback && feedback.tab === tab && feedback.year === game.year && !game.pending.length;
  // A new result scrolls the panel up to where it is shown.
  useEffect(() => {
    if (feedback) panel.current?.scrollTo({ top: 0 });
  }, [feedback]);
  return (
    <aside className="right card" aria-label="Life panels">
      <div className="tabs" role="tablist">
        {TABS.map((t, i) => (
          <button
            key={t.id}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={tab === t.id ? `panel-${t.id}` : undefined}
            tabIndex={tab === t.id ? 0 : -1}
            onKeyDown={(e) => {
              if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
              const next = TABS[(i + (e.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length];
              if (next) {
                app.set({ tab: next.id });
                document.getElementById(`tab-${next.id}`)?.focus();
              }
            }}
            className={`tab${tab === t.id ? ' active' : ''}`}
            data-testid={`tab-${t.id}`}
            title={`${t.label} (⌘${i + 1})`}
            onClick={() => app.set({ tab: t.id })}
          >
            <span className="tab-emoji" aria-hidden="true">
              {t.emoji}
            </span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>
      <div
        className="tab-panel"
        role="tabpanel"
        id={`panel-${tab}`}
        aria-labelledby={`tab-${tab}`}
        data-testid={`panel-${tab}`}
        ref={panel}
      >
        {fresh && (
          <div className="act-feedback" data-testid="act-feedback" role="status">
            <div className="grow">
              {feedback.lines.map((l) => (
                <p key={l}>{l}</p>
              ))}
            </div>
            <button
              className="ghost small"
              aria-label="Dismiss"
              onClick={() => app.set({ feedback: null })}
            >
              ✕
            </button>
          </div>
        )}
        {tab === 'occupation' && <OccupationTab game={game} />}
        {tab === 'assets' && <AssetsTab game={game} />}
        {tab === 'relationships' && <RelationshipsTab game={game} />}
        {tab === 'activities' && <ActivitiesTab game={game} />}
      </div>
    </aside>
  );
}
