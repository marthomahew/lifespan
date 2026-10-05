import { perkNotes } from '../../../../engine/systems/perks';

/** A job's perks, with what each one actually does in brackets. */
export function Perks({
  jobId,
  testId,
}: {
  jobId: string;
  testId?: string;
}): React.JSX.Element | null {
  const notes = perkNotes(jobId);
  if (!notes.length) return null;
  return (
    <div className="small perks" data-testid={testId}>
      Perks:{' '}
      {notes.map((p, i) => (
        <span key={p.perk}>
          {i > 0 && ', '}
          {p.perk}
          {p.note && <span className="perk-note"> ({p.note})</span>}
        </span>
      ))}
    </div>
  );
}
