import { useState } from 'react';
import { GRAD_PROGRAMS, MAJORS, MAJOR_BY_ID, GRAD_BY_ID } from '../../../../content/education';
import {
  countryOf,
  enrollReason,
  formatMoney,
  letterGrade,
  tuitionFor,
  type GameState,
} from '../../../../engine';
import { doAct } from '../../../store/app';

type Kind = 'university' | 'community' | 'grad';

export function EducationSection({
  game,
  onError,
}: {
  game: GameState;
  onError: (e: string | null) => void;
}): React.JSX.Element | null {
  const e = game.education;
  const age = game.player.age;
  const [kind, setKind] = useState<Kind>('university');
  const [program, setProgram] = useState('computer_science');
  const options =
    kind === 'grad'
      ? GRAD_PROGRAMS.map((g) => ({ id: g.id, label: g.label }))
      : MAJORS.map((m) => ({ id: m.id, label: m.label }));
  const prog = options.some((o) => o.id === program) ? program : (options[0]?.id ?? '');
  const reason = enrollReason(game, kind, prog);
  const inSchool = age >= 6 && age <= 17 && !e.droppedOut;
  const leave = countryOf(game).ages.schoolLeaving;
  if (age < 5) return null;
  return (
    <section className="panel-section" data-testid="education-section">
      <h3 className="section-title">Education</h3>
      {inSchool && (
        <div className="row">
          <span className="grow" data-testid="school-grade">
            {age < 12 ? 'Primary' : 'Secondary'} school · grade {letterGrade(e.grade)}
          </span>
          {age >= leave && (
            <button data-testid="btn-drop-out" onClick={() => onError(doAct({ type: 'drop_out' }))}>
              Drop out
            </button>
          )}
        </div>
      )}
      {e.enrollment && (
        <div className="row">
          <span className="grow" data-testid="enrollment">
            Studying{' '}
            {e.enrollment.kind === 'grad'
              ? GRAD_BY_ID[e.enrollment.programId]?.label
              : MAJOR_BY_ID[e.enrollment.programId]?.label}
            {e.enrollment.kind === 'community' ? ' (community college)' : ''}, year{' '}
            {e.enrollment.year + 1} of {e.enrollment.length}
          </span>
          <button data-testid="btn-drop-out" onClick={() => onError(doAct({ type: 'drop_out' }))}>
            Drop out
          </button>
        </div>
      )}
      {e.degrees.length > 0 && (
        <ul className="plain" data-testid="degrees">
          {e.degrees.map((d, i) => (
            <li key={i}>
              🎓 {d.level.replace('_', ' ')}
              {d.field !== 'general'
                ? ` · ${MAJOR_BY_ID[d.field]?.label ?? GRAD_BY_ID[d.field]?.label ?? d.field}`
                : ''}{' '}
              · {d.gpa.toFixed(2)} GPA · {d.year}
            </li>
          ))}
        </ul>
      )}
      {age >= 17 && !e.enrollment && (
        <form
          className="enroll"
          data-testid="enroll-form"
          onSubmit={(ev) => {
            ev.preventDefault();
            onError(doAct({ type: 'enroll', kind, programId: prog }));
          }}
        >
          <select
            aria-label="Where to study"
            data-testid="enroll-kind"
            value={kind}
            onChange={(ev) => setKind(ev.target.value as Kind)}
          >
            <option value="university">University</option>
            <option value="community">Community college</option>
            <option value="grad">Graduate school</option>
          </select>
          <select
            aria-label="Major or program"
            data-testid="enroll-program"
            value={prog}
            onChange={(ev) => setProgram(ev.target.value)}
          >
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
          <button
            className="primary"
            type="submit"
            data-testid="btn-enroll"
            disabled={reason !== null}
            title={reason ?? undefined}
          >
            Apply
          </button>
          <span className="muted small enroll-note">
            {reason ?? `Tuition ${formatMoney(game, tuitionFor(game, kind, prog))} a year`}
          </span>
        </form>
      )}
    </section>
  );
}
