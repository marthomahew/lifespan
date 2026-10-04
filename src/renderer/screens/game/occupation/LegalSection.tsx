import { CRIME_BY_ID } from '../../../../content/crimes';
import type { GameState } from '../../../../engine';

/** Record, case, probation, and prison time. */
export function LegalSection({ game }: { game: GameState }): React.JSX.Element | null {
  const l = game.legal;
  if (!l.record.length && !l.prison && !l.case && l.probation <= 0) return null;
  return (
    <section className="panel-section" data-testid="legal-section">
      <h3 className="section-title">Legal</h3>
      {l.prison && (
        <p data-testid="prison-status">
          🔒 Serving {l.prison.years} years for{' '}
          {CRIME_BY_ID[l.prison.crimeId]?.label.toLowerCase() ?? 'a crime'} · {l.prison.served}{' '}
          served · behaviour {l.prison.behaviour}
        </p>
      )}
      {l.case && (
        <p data-testid="case-status">
          ⚖️ Case pending: {CRIME_BY_ID[l.case.crimeId]?.label ?? l.case.crimeId}
        </p>
      )}
      {l.probation > 0 && (
        <p>
          On probation for {l.probation} more year{l.probation === 1 ? '' : 's'}.
        </p>
      )}
      {l.record.length > 0 && (
        <ul className="plain small" data-testid="criminal-record">
          {l.record.map((r, i) => (
            <li key={i}>
              {r.year}: {CRIME_BY_ID[r.crimeId]?.label ?? r.crimeId} · {r.verdict}
              {r.sentenceYears ? ` · ${r.sentenceYears} yrs` : ''}
              {r.juvenile ? (l.sealed ? ' · juvenile, sealed' : ' · juvenile') : ''}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
