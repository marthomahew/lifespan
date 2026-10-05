import { useEffect, useRef } from 'react';

/** Open dialogs, bottom first; only the top one reacts to keys. */
const stack: object[] = [];

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

type Props = {
  title: string;
  onClose?: () => void;
  children: React.ReactNode;
  testId: string;
  wide?: boolean;
  /** Nearly the whole window (the family tree). */
  full?: boolean;
  hideTitle?: boolean;
};

/** Accessible modal dialog. Esc closes it when it has an onClose. */
export function Modal({
  title,
  onClose,
  children,
  testId,
  wide,
  full,
  hideTitle,
}: Props): React.JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const root = ref.current;
    const focusables = (): HTMLElement[] =>
      root
        ? [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
            (el) => !el.hasAttribute('disabled'),
          )
        : [];
    // Start on the first real control; a dialog with only a close button focuses itself.
    const firstEnabled = focusables().find((el) => !el.classList.contains('close')) ?? root;
    firstEnabled?.focus();
    const token = {};
    stack.push(token);
    // Keep Tab inside the dialog; Esc closes the topmost dialog only.
    const trap = (e: KeyboardEvent): void => {
      if (stack[stack.length - 1] !== token) return;
      if (e.key === 'Escape' && closeRef.current) {
        e.preventDefault();
        e.stopPropagation();
        closeRef.current();
        return;
      }
      if (e.key !== 'Tab') return;
      const els = focusables();
      if (!els.length) return;
      const first = els[0] as HTMLElement;
      const last = els[els.length - 1] as HTMLElement;
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !root?.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !root?.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', trap);
    return () => {
      document.removeEventListener('keydown', trap);
      const i = stack.indexOf(token);
      if (i >= 0) stack.splice(i, 1);
      prev?.focus?.();
    };
  }, []);
  return (
    <div className="modal-backdrop" data-testid={`${testId}-backdrop`}>
      <div
        ref={ref}
        className={`modal card${wide ? ' wide' : ''}${full ? ' full' : ''}`}
        role="dialog"
        tabIndex={-1}
        aria-modal="true"
        aria-label={title}
        data-testid={testId}
      >
        <div className="modal-head">
          <h2 className={hideTitle ? 'sr-only' : ''}>{title}</h2>
          {onClose && (
            <button
              className="ghost close"
              aria-label="Close"
              data-testid={`${testId}-close`}
              onClick={onClose}
            >
              ✕
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
