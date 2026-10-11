import {
  formatMoney,
  hireReason,
  labCapacity,
  labReason,
  patentable,
  patentReason,
  type GameState,
  type LabAction,
} from '../../../../engine';
import { doAct } from '../../../store/app';

const ACTIONS: { id: LabAction; label: string; tip: string }[] = [
  {
    id: 'conference',
    label: '✈️ Conference',
    tip: 'One work pip: standing, a better project, maybe a collaborator',
  },
  {
    id: 'review',
    label: '🧐 Review a paper',
    tip: 'One work pip: good citizenship, a little standing',
  },
  { id: 'teach', label: '🧑‍🏫 Teach a course', tip: 'One work pip: your performance review notices' },
  {
    id: 'sabbatical',
    label: '🧳 Sabbatical',
    tip: 'A year abroad every seven: standing, rest, a language, a big push on your project',
  },
];

/** The research career beyond the bench: your group, the professional round, tenure, patents. */
export function ScienceLab({
  game,
  onError,
}: {
  game: GameState;
  onError: (e: string | null) => void;
}): React.JSX.Element | null {
  const sc = game.science ?? null;
  const lab = sc?.lab ?? [];
  const cap = labCapacity(game);
  const hire = hireReason(game);
  const patents = patentable(game);
  const tenure =
    game.career.jobId === 'professor'
      ? sc?.tenure === undefined
        ? game.career.level <= 1
          ? `Tenure review after six years as an assistant professor (${Math.max(0, 6 - (game.year - game.career.since))} to go): four papers in seven years and one real grant.`
          : null
        : sc.tenure > 0
          ? `Tenured since ${sc.tenure}.`
          : null
      : null;
  return (
    <div className="col small" data-testid="science-lab">
      <strong>Your lab</strong>
      <p className="muted">
        Grants pay for people: PhD students stay five years, postdocs three, and every one of them
        moves your projects along faster. Your grants can pay for {cap}{' '}
        {cap === 1 ? 'person' : 'people'} right now.
        {sc?.collaborators ? ` ${sc.collaborators} collaborators improve every new project.` : ''}
      </p>
      {lab.length > 0 && (
        <ul className="plain" data-testid="science-lab-members">
          {lab.map((m) => {
            const n = game.npcs.find((x) => x.id === m.id);
            return (
              <li key={m.id} className="muted">
                {n ? `${n.first} ${n.last}` : 'Someone'}:{' '}
                {m.role === 'phd' ? 'PhD student' : 'postdoc'} since {m.since}
              </li>
            );
          })}
        </ul>
      )}
      <div className="btn-row">
        <button
          data-testid="sci-hire-phd"
          disabled={hire !== null}
          title={hire ?? 'Five years; uses grant money, not yours'}
          onClick={() => onError(doAct({ type: 'science', id: 'hire', role: 'phd' }))}
        >
          ➕ PhD student
        </button>
        <button
          data-testid="sci-hire-postdoc"
          disabled={hire !== null}
          title={hire ?? 'Three years; uses grant money, not yours'}
          onClick={() => onError(doAct({ type: 'science', id: 'hire', role: 'postdoc' }))}
        >
          ➕ Postdoc
        </button>
        {hire && <span className="muted">{hire}</span>}
      </div>
      {tenure && (
        <div className="muted" data-testid="science-tenure">
          🔑 {tenure}
        </div>
      )}
      <div className="btn-row wrap">
        {ACTIONS.map((a) => {
          const why = labReason(game, a.id);
          if (why === 'professors teach' || why === 'tenured professors') return null;
          return (
            <button
              key={a.id}
              data-testid={`sci-${a.id}`}
              disabled={why !== null}
              title={why ?? a.tip}
              onClick={() => onError(doAct({ type: 'science', id: 'lab', what: a.id }))}
            >
              {a.label}
            </button>
          );
        })}
      </div>
      {sc && (patents.length > 0 || (sc.patents?.length ?? 0) > 0) && (
        <div className="col" data-testid="science-patents">
          <strong>Patents</strong>
          <span className="muted">
            Strong applied results can be patented (lawyers’ fees up front). After two years you
            learn if a company licenses it; royalties then run for fifteen years.
          </span>
          {(sc.patents ?? []).map((p) => (
            <span key={p.title} className="muted">
              📜 {p.title} ({p.from}):{' '}
              {p.licensed === null
                ? 'waiting for a licence'
                : p.licensed
                  ? `${formatMoney(game, p.royalty)} a year`
                  : 'not licensed'}
            </span>
          ))}
          {patents.slice(0, 3).map((i) => {
            const paper = sc.papers[i];
            const why = patentReason(game, i);
            return (
              <div key={i} className="sci-funder">
                <span className="grow">{paper?.title}</span>
                <button
                  data-testid={`sci-patent-${i}`}
                  disabled={why !== null}
                  title={why ?? 'File a patent'}
                  onClick={() => onError(doAct({ type: 'science', id: 'patent', paper: i }))}
                >
                  Patent
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
