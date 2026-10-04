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
  const tab = useApp((s) => s.tab);
  return (
    <aside className="right card" aria-label="Life panels">
      <div className="tabs" role="tablist">
        {TABS.map((t, i) => (
          <button
            key={t.id}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
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
      >
        {tab === 'occupation' && <OccupationTab game={game} />}
        {tab === 'assets' && <AssetsTab game={game} />}
        {tab === 'relationships' && <RelationshipsTab game={game} />}
        {tab === 'activities' && <ActivitiesTab game={game} />}
      </div>
    </aside>
  );
}
