import { useState } from 'react';
import { HAIR_COLORS, EYE_COLORS, LOOK_PARTS, SKIN_COLORS, TOP_COLORS } from '../../engine/look';
import type { Gender, Look } from '../../engine/types';
import { Portrait } from './Portrait';

/** The builder's tabs, each a shape part with an optional colour row beneath it. */
type Tab = {
  id: string;
  label: string;
  shape?: keyof typeof LOOK_PARTS;
  colors?: 'skin' | 'hairColor' | 'eyeColor' | 'topColor';
};

export const LOOK_TABS: Tab[] = [
  { id: 'skin', label: 'Skin', colors: 'skin' },
  { id: 'face', label: 'Face', shape: 'face' },
  { id: 'hair', label: 'Hair', shape: 'hair', colors: 'hairColor' },
  { id: 'eyes', label: 'Eyes', shape: 'eyes', colors: 'eyeColor' },
  { id: 'brows', label: 'Brows', shape: 'brows' },
  { id: 'nose', label: 'Nose', shape: 'nose' },
  { id: 'mouth', label: 'Mouth', shape: 'mouth' },
  { id: 'facialHair', label: 'Facial hair', shape: 'facialHair' },
  { id: 'glasses', label: 'Glasses', shape: 'glasses' },
  { id: 'top', label: 'Clothes', shape: 'top', colors: 'topColor' },
  { id: 'hat', label: 'Hats', shape: 'hat' },
  { id: 'earrings', label: 'Earrings', shape: 'earrings' },
];

const SWATCHES: Record<
  NonNullable<Tab['colors']>,
  { label: string; hex: string; value: string | number }[]
> = {
  skin: SKIN_COLORS.map((c, i) => ({ label: `Skin ${i + 1}`, hex: c.hex, value: i })),
  hairColor: HAIR_COLORS.map((c) => ({ label: c.label, hex: c.hex, value: c.id })),
  eyeColor: EYE_COLORS.map((c) => ({ label: c.label, hex: c.hex, value: c.id })),
  topColor: TOP_COLORS.map((hex, i) => ({ label: `Colour ${i + 1}`, hex, value: i })),
};

/** Pick features by eye: every option is drawn on your own face, so you see what you get. */
export function LookBuilder({
  look,
  gender,
  age = 30,
  tabs = LOOK_TABS,
  onChange,
}: {
  look: Look;
  gender: Gender;
  age?: number;
  tabs?: Tab[];
  onChange: (next: Look) => void;
}): React.JSX.Element {
  const [tabId, setTab] = useState(tabs[0]?.id ?? 'skin');
  const tab = tabs.find((t) => t.id === tabId) ?? tabs[0];
  const set = (patch: Partial<Look>): void => onChange({ ...look, ...patch });
  return (
    <div className="look-builder" data-testid="look-builder">
      <div className="look-tabs" role="tablist" aria-label="Features">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={t.id === tab?.id}
            className={`chip${t.id === tab?.id ? ' active' : ''}`}
            data-testid={`look-tab-${t.id}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab?.shape && (
        <div className="look-options" role="group" aria-label={tab.label}>
          {LOOK_PARTS[tab.shape].map((o) => {
            const key = tab.shape as keyof typeof LOOK_PARTS;
            const on = look[key] === o.id;
            return (
              <button
                key={o.id}
                type="button"
                className={`look-option${on ? ' active' : ''}`}
                aria-pressed={on}
                data-testid={`look-opt-${key}-${o.id}`}
                title={o.label}
                onClick={() => set({ [key]: o.id } as Partial<Look>)}
              >
                <Portrait
                  look={{ ...look, [key]: o.id }}
                  age={age}
                  gender={gender}
                  size={52}
                  {...(key === 'earrings' ? { viewBox: '68 48 26 26' } : {})}
                />
                <span className="small">{o.label}</span>
              </button>
            );
          })}
        </div>
      )}
      {tab?.colors && (
        <div className="look-swatches" role="group" aria-label={`${tab.label} colour`}>
          {SWATCHES[tab.colors].map((sw) => {
            const key = tab.colors as NonNullable<Tab['colors']>;
            const on = look[key] === sw.value;
            return (
              <button
                key={String(sw.value)}
                type="button"
                className={`swatch${on ? ' active' : ''}`}
                aria-pressed={on}
                aria-label={sw.label}
                title={sw.label}
                data-testid={`look-opt-${key}-${sw.value}`}
                style={{ background: sw.hex }}
                onClick={() => set({ [key]: sw.value } as Partial<Look>)}
              />
            );
          })}
          {tab.colors === 'skin' && (
            <label className="look-freckles">
              <input
                type="checkbox"
                data-testid="look-freckles"
                checked={look.freckles}
                onChange={(e) => set({ freckles: e.target.checked })}
              />
              Freckles
            </label>
          )}
        </div>
      )}
    </div>
  );
}
