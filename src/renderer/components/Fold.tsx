import { useState } from 'react';

const KEY = 'lifespan.folded';

function readFolded(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]') as string[]);
  } catch {
    return new Set();
  }
}

/**
 * A section title you can click to fold the section away. What's folded is remembered
 * between sessions; `open` forces it open (while searching, say).
 */
export function FoldTitle({
  id,
  title,
  count,
  open,
  children,
}: {
  id: string;
  title: string;
  count?: number;
  open?: boolean;
  children: React.ReactNode;
}): React.JSX.Element {
  const [folded, setFolded] = useState(() => readFolded().has(id));
  const shut = folded && !open;
  const toggle = (): void => {
    const all = readFolded();
    if (all.has(id)) all.delete(id);
    else all.add(id);
    try {
      localStorage.setItem(KEY, JSON.stringify([...all]));
    } catch {
      // Storage unavailable: folding still works for this session.
    }
    setFolded(!folded);
  };
  return (
    <>
      <h3 className="section-title fold-title">
        <button
          type="button"
          className="fold-toggle"
          aria-expanded={!shut}
          data-testid={`fold-${id}`}
          onClick={toggle}
        >
          <span className="fold-caret" aria-hidden="true">
            {shut ? '▸' : '▾'}
          </span>
          {title}
          {count !== undefined && <span className="fold-count">{count}</span>}
        </button>
      </h3>
      {!shut && children}
    </>
  );
}
