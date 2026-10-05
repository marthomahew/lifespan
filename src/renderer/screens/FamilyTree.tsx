import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { familyTree, type GameState } from '../../engine';
import { treeLayout } from '../../engine/family-tree';
import { Modal } from '../components/Modal';
import { app } from '../store/app';

const GEN_LABEL: Record<number, string> = {
  [-3]: 'Great-grandparents',
  [-2]: 'Grandparents',
  [-1]: 'Parents',
  0: 'Your generation',
  1: 'Children',
  2: 'Grandchildren',
  3: 'Great-grandchildren',
};

type Line = { key: string; d: string; dead: boolean };

/** Three generations up and down, joined child to parent; click anyone to open them. */
export function FamilyTree({ game }: { game: GameState }): React.JSX.Element {
  const layout = useMemo(() => treeLayout(familyTree(game)), [game]);
  const box = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [focus, setFocus] = useState<number | null>(null);

  // Measure the laid-out cards and draw a curve from each child's top to each parent's bottom.
  useLayoutEffect(() => {
    const root = box.current;
    if (!root) return;
    const draw = (): void => {
      const origin = root.getBoundingClientRect();
      const at = (id: number): DOMRect | undefined =>
        root.querySelector<HTMLElement>(`[data-node="${id}"]`)?.getBoundingClientRect();
      const out: Line[] = [];
      for (const [child, parent] of layout.edges) {
        const c = at(child);
        const p = at(parent);
        if (!c || !p) continue;
        const x1 = c.left + c.width / 2 - origin.left;
        const y1 = c.top - origin.top;
        const x2 = p.left + p.width / 2 - origin.left;
        const y2 = p.bottom - origin.top;
        const mid = (y1 + y2) / 2;
        const dead = root.querySelector(`[data-node="${parent}"]`)?.classList.contains('dead');
        out.push({
          key: `${child}-${parent}`,
          d: `M${x1},${y1} C${x1},${mid} ${x2},${mid} ${x2},${y2}`,
          dead: dead === true,
        });
      }
      setLines(out);
      setSize({ w: root.scrollWidth, h: root.scrollHeight });
    };
    draw();
    // Start with you in the middle of the view.
    const sc = scroller.current;
    const me = root.querySelector<HTMLElement>('.tree-node.me');
    if (sc && me) sc.scrollLeft = me.offsetLeft + me.offsetWidth / 2 - sc.clientWidth / 2;
    const ro = new ResizeObserver(draw);
    ro.observe(root);
    return () => ro.disconnect();
  }, [layout]);

  const related = (id: number): boolean =>
    focus !== null &&
    (id === focus ||
      layout.edges.some(([c, p]) => (c === focus && p === id) || (p === focus && c === id)));

  return (
    <Modal title="Family tree" testId="family-tree" onClose={() => app.set({ overlay: null })} full>
      <div className="tree-scroll" ref={scroller}>
        <div className="tree" ref={box}>
          <svg
            className="tree-lines"
            width={size.w}
            height={size.h}
            aria-hidden="true"
            data-testid="tree-lines"
          >
            {lines.map((l) => {
              const [c, p] = l.key.split('-').map(Number);
              const lit = focus !== null && (c === focus || p === focus);
              return (
                <path
                  key={l.key}
                  d={l.d}
                  className={`tree-line${l.dead ? ' faded' : ''}${lit ? ' lit' : ''}`}
                  data-testid={`tree-line-${l.key}`}
                />
              );
            })}
          </svg>
          {layout.rows.map(({ gen, nodes }) => (
            <section key={gen} className="tree-gen" data-testid={`tree-gen-${gen}`}>
              <h3 className="section-title">{GEN_LABEL[gen]}</h3>
              <div className="tree-row">
                {nodes.map((n) => (
                  <button
                    key={n.id}
                    data-node={n.id}
                    className={`tree-node${n.isPlayer ? ' me' : ''}${n.alive ? '' : ' dead'}${related(n.id) ? ' lit' : ''}`}
                    data-testid={`tree-node-${n.id}`}
                    disabled={n.isPlayer}
                    onMouseEnter={() => setFocus(n.id)}
                    onMouseLeave={() => setFocus(null)}
                    onFocus={(e) => {
                      if (e.currentTarget.matches(':focus-visible')) setFocus(n.id);
                    }}
                    onBlur={() => setFocus(null)}
                    onClick={() => app.set({ overlay: null, npcId: n.id })}
                  >
                    <span className="tree-name">{n.name}</span>
                    <span className="muted small">
                      {n.label}, {n.alive ? n.age : '✝'}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </Modal>
  );
}
