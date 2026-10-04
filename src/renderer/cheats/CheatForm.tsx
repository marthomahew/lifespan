import { useState } from 'react';
import type { CheatDef, GameState, ParamDef } from '../../engine';
import { doCheat } from '../store/app';

function initial(p: ParamDef, game: GameState): string {
  if (p.default !== undefined) return String(p.default);
  if (p.type === 'enum') return p.options(game)[0]?.value ?? '';
  if (p.type === 'bool') return '';
  return '';
}

/** A form generated from a cheat's params schema (the same registry the console uses). */
export function CheatForm({
  def,
  game,
  onResult,
}: {
  def: CheatDef;
  game: GameState;
  onResult: (msg: string, ok: boolean) => void;
}): React.JSX.Element {
  const [vals, setVals] = useState<Record<string, string>>(() =>
    Object.fromEntries(def.params.map((p) => [p.name, initial(p, game)])),
  );
  const isToggle = def.isOn !== undefined;
  const on = def.isOn?.(game) ?? false;
  const submit = (e: React.FormEvent): void => {
    e.preventDefault();
    const params: Record<string, unknown> = {};
    for (const p of def.params) {
      const v = vals[p.name];
      if (isToggle && p.type === 'bool') continue;
      if (v !== undefined && v !== '') params[p.name] = v;
    }
    const r = doCheat(def.id, params);
    onResult(r.message, r.ok);
  };
  return (
    <form
      className={`cheat-form${isToggle ? ' toggle' : ''}`}
      onSubmit={submit}
      data-testid={`cheat-${def.id}`}
    >
      <div className="cheat-label" title={def.help}>
        {def.label}
        {isToggle && <span className={`pill ${on ? 'on' : ''}`}>{on ? 'ON' : 'OFF'}</span>}
      </div>
      <div className="cheat-fields">
        {def.params.map((p) => {
          if (isToggle && p.type === 'bool') return null;
          const id = `cp-${def.id}-${p.name}`;
          const set = (v: string): void => setVals((x) => ({ ...x, [p.name]: v }));
          return (
            <label key={p.name} htmlFor={id} className="cheat-field">
              <span className="sr-only">{p.label ?? p.name}</span>
              {p.type === 'enum' ? (
                <select
                  id={id}
                  data-testid={`cheat-${def.id}-${p.name}`}
                  value={vals[p.name] ?? ''}
                  onChange={(e) => set(e.target.value)}
                >
                  {p.optional && <option value="">—</option>}
                  {p.options(game).map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              ) : p.type === 'bool' ? (
                <select
                  id={id}
                  data-testid={`cheat-${def.id}-${p.name}`}
                  value={vals[p.name] ?? ''}
                  onChange={(e) => set(e.target.value)}
                >
                  <option value="">—</option>
                  <option value="on">on</option>
                  <option value="off">off</option>
                </select>
              ) : (
                <input
                  id={id}
                  data-testid={`cheat-${def.id}-${p.name}`}
                  type={p.type === 'string' ? 'text' : 'number'}
                  placeholder={p.label ?? p.name}
                  min={'min' in p ? p.min : undefined}
                  max={'max' in p ? p.max : undefined}
                  value={vals[p.name] ?? ''}
                  onChange={(e) => set(e.target.value)}
                />
              )}
            </label>
          );
        })}
        <button
          type="submit"
          className={isToggle ? '' : 'primary'}
          data-testid={`cheat-${def.id}-run`}
        >
          {isToggle ? 'Toggle' : 'Run'}
        </button>
      </div>
    </form>
  );
}
